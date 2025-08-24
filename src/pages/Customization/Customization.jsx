import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 导入 useNavigate
import { products } from '../Lobby/products';
import BasicInfoStep from './components/BasicInfoStep';
import PhotoUploadStep from './components/PhotoUploadStep';
import SceneArtworkStep from './components/SceneArtworkStep';
import OrderConfirmation from './components/OrderConfirmation';
import ErrorModal from '../../components/ErrorModal/ErrorModal';
import {
  shouldUseBatchUpload,
  executeBatchUpload,
  submitBatchOrder,
  traditionalUpload
} from '../../utils/batchUpload';

const Customization = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(productId));
  
  // 定制流程状态管理 - 按照 prd.md 的四步流程
  const [currentStep, setCurrentStep] = useState(1); // 1: 基础信息, 2: 上传照片, 3: 设定场景/名画, 4: 订单确认
  
  // 错误模态框状态管理
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    error: null
  });
  
  // 上传进度状态管理
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    useBatchUpload: false,
    batchIndex: 0,
    totalBatches: 0,
    completedBatches: 0,
    currentBatchProgress: 0,
    overallProgress: 0
  });
  
  // 定义步骤信息
  const steps = [
    { number: 1, title: '基础信息' },
    { number: 2, title: '上传照片' },
    { number: 3, title: '场景设定' },
    { number: 4, title: '订单确认' }
  ];
  const [customizationData, setCustomizationData] = useState({
    // 步骤一：基础信息
    petCount: null,
    size: null,
    price: 0,
    
    // 步骤二：照片上传
    photos: [],
    
    // 步骤三：场景/名画设定
    selectionMethod: null,
    textDescription: '',
    uploadedImage: null,
    selectedRecommendation: null,
    
    // 步骤四：联系信息
    contactInfo: {}
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">产品未找到</h2>
          <p className="text-gray-600">请返回首页重新选择产品</p>
        </div>
      </div>
    );
  }



  // 关闭错误模态框
  const closeErrorModal = () => {
    setErrorModal({
      isOpen: false,
      error: null
    });
  };

  const handleOrderSubmit = async (submitPayload) => {
    console.log('[Customization] handleOrderSubmit: Starting order submission...');
    console.log('[Customization] handleOrderSubmit: submitPayload:', submitPayload);
    console.log('[Customization] handleOrderSubmit: customizationData:', customizationData);
    
    // 兼容两种入参：1）直接 contactInfo 对象；2）包含 contact 字段的对象
    const contactInfo = submitPayload && submitPayload.name && submitPayload.phone
      ? submitPayload
      : (submitPayload && submitPayload.contact) || {};
  
    console.log('[Customization] handleOrderSubmit: contactInfo:', contactInfo);
    
    const finalData = { ...customizationData, contactInfo };
    console.log('[Customization] handleOrderSubmit: finalData:', finalData);
    
    // 设置上传状态
    setUploadProgress(prev => ({
      ...prev,
      isUploading: true,
      overallProgress: 0
    }));
    
    try {
      // 提取文件
      const userUploads = finalData.photos?.map(photo => photo.file).filter(file => file instanceof File) || [];
      const referenceImages = [];
      if (finalData.uploadedImage instanceof File) {
        referenceImages.push(finalData.uploadedImage);
      } else if (finalData.uploadedImage?.file instanceof File) {
        referenceImages.push(finalData.uploadedImage.file);
      }
      
      console.log('[Customization] 文件统计:', {
        userUploadsCount: userUploads.length,
        referenceImagesCount: referenceImages.length,
        totalFiles: userUploads.length + referenceImages.length
      });
      
      // 判断是否使用分批上传
      const allFiles = [...userUploads, ...referenceImages];
      const useBatchUpload = shouldUseBatchUpload(allFiles);
      
      setUploadProgress(prev => ({
        ...prev,
        useBatchUpload
      }));
      
      console.log(`[Customization] 上传策略: ${useBatchUpload ? '分批上传' : '传统上传'}`);
      
      if (useBatchUpload) {
        // 使用分批上传
        await handleBatchUpload(userUploads, referenceImages, finalData, contactInfo);
      } else {
        // 使用传统上传
        await handleTraditionalUpload(finalData);
      }
      
    } catch (error) {
      console.error('[Customization] 订单提交失败:', error);
      
      // 重置上传状态
      setUploadProgress(prev => ({
        ...prev,
        isUploading: false,
        overallProgress: 0
      }));
      
      // 显示错误信息
      let errorType = 'UPLOAD_ERROR';
      let errorMessage = error.message || '订单提交时发生错误';
      let suggestions = [
        '请检查您的网络连接',
        '确认所有文件格式正确',
        '稍后重试或联系技术支持'
      ];
      
      // 根据错误信息判断错误类型
       if (error.message && (error.message.includes('500') || error.message.includes('服务器错误'))) {
         errorType = 'API_ERROR';
         errorMessage = '系统服务异常';
         suggestions = [
           '系统正在维护中，请稍后重试',
           '如果问题持续，请联系客服'
         ];
       } else if (error.message && (error.message.includes('网络') || error.message.includes('network'))) {
        errorType = 'NETWORK_ERROR';
        errorMessage = '网络连接异常';
        suggestions = [
          '请检查您的网络连接',
          '尝试刷新页面重新提交',
          '如果问题持续，请联系技术支持'
        ];
      }
      
      const errorInfo = {
         type: errorType,
         message: errorMessage,
         suggestions: suggestions
       };
      
      setErrorModal({
        isOpen: true,
        error: errorInfo
      });
    }
  };
  
  // 分批上传处理函数
  const handleBatchUpload = async (userUploads, referenceImages, finalData, contactInfo) => {
    try {
      console.log('[Customization] 开始分批上传流程');
      
      // 执行分批上传
      const uploadResult = await executeBatchUpload(
        userUploads,
        referenceImages,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            ...progress
          }));
        }
      );
      
      console.log('[Customization] 分批上传完成，开始提交订单');
      
      // 准备订单数据
      const orderData = {
        phone: contactInfo.phone,
        email: contactInfo.email,
        customization_style: product.name,
        petCount: finalData.petCount,
        size: finalData.size,
        price: finalData.price,
        selectionMethod: finalData.selectionMethod,
        textDescription: finalData.textDescription,
        selectedRecommendation: finalData.selectedRecommendation,
        notes: contactInfo.notes
      };
      
      // 提交分批订单
      const submitResult = await submitBatchOrder(
        uploadResult.batchId,
        uploadResult.userUploads,
        uploadResult.referenceImages,
        orderData
      );
      
      // 订单提交成功
      handleOrderSuccess(submitResult.orderId);
      
    } catch (error) {
      console.warn('[Customization] 分批上传失败，尝试降级到传统上传:', error);
      
      // 降级到传统上传
      setUploadProgress(prev => ({
        ...prev,
        useBatchUpload: false,
        overallProgress: 0
      }));
      
      await handleTraditionalUpload(finalData);
    }
  };
  
  // 传统上传处理函数
  const handleTraditionalUpload = async (finalData) => {
    console.log('[Customization] 使用传统上传方式');
    
    // 使用传统上传工具函数
    const result = await traditionalUpload(
      finalData,
      product,
      (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          overallProgress: progress
        }));
      }
    );
    
    // 订单提交成功
    handleOrderSuccess(result.orderId);
  };
  
  // 原有的 FormData 构建逻辑（保留作为备用）
  const buildFormDataLegacy = (finalData) => {
    const formData = new FormData();
    
    // 添加用户上传的照片
    if (finalData.photos && finalData.photos.length > 0) {
      finalData.photos.forEach((photo, index) => {
        if (photo.file instanceof File) {
          formData.append('user_uploads', photo.file);
          console.log(`[Customization] buildFormDataLegacy: Added user_uploads[${index}]:`, photo.file.name);
        }
      });
    }
    
    // 添加联系信息
    if (finalData.contactInfo?.phone) {
      formData.append('phone', finalData.contactInfo.phone);
    }
    if (finalData.contactInfo?.email) {
      formData.append('email', finalData.contactInfo.email);
    }
    
    // 添加参考图
    if (finalData.uploadedImage) {
      if (finalData.uploadedImage instanceof File) {
        formData.append('uploadedImage', finalData.uploadedImage);
      } else if (finalData.uploadedImage.file instanceof File) {
        formData.append('uploadedImage', finalData.uploadedImage.file);
      }
    }
    
    // 添加其他定制化数据
    formData.append('customization_style', product.name);
    formData.append('petCount', finalData.petCount);
    formData.append('size', finalData.size);
    formData.append('price', finalData.price);
    formData.append('selectionMethod', finalData.selectionMethod);
    formData.append('textDescription', finalData.textDescription || '');
    formData.append('selectedRecommendation', JSON.stringify(finalData.selectedRecommendation || null));
    if (finalData.contactInfo?.notes) {
      formData.append('notes', finalData.contactInfo.notes);
    }
    
    return formData;
  };

  // 订单成功处理函数
  const handleOrderSuccess = (orderId) => {
    console.log('[Customization] 订单提交成功，订单ID:', orderId);
    
    // 重置上传状态
    setUploadProgress({
      isUploading: false,
      useBatchUpload: false,
      batchIndex: 0,
      totalBatches: 0,
      completedBatches: 0,
      currentBatchProgress: 0,
      overallProgress: 100
    });
    
    // 跳转到成功页面
    navigate('/submission-success', { 
      state: { orderId: orderId }
    });
    
    // 重置定制数据
    setCurrentStep(1);
    setCustomizationData({
      petCount: null,
      size: null,
      price: 0,
      photos: [],
      selectionMethod: null,
      textDescription: '',
      uploadedImage: null,
      selectedRecommendation: null,
      contactInfo: {}
    });
    
    console.log('[Customization] 订单处理完成');
  };

  // 处理下一步
  const handleNext = (data) => {
    setCustomizationData(prev => ({ ...prev, ...data }));
    if (product.id === 4 && currentStep === 2) {
      setCurrentStep(4); // For product 4, skip from step 2 to 4
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  // 处理上一步
  const handlePrev = () => {
    if (product.id === 4 && currentStep === 4) {
      setCurrentStep(2); // For product 4, go back from step 4 to 2
    } else {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            product={product}
            data={customizationData}
            onNext={(data) => {
              setCustomizationData(prev => ({ ...prev, ...data }));
              setCurrentStep(2);
            }}
          />
        );
      
      case 2:
        return (
          <PhotoUploadStep
            product={product}
            data={customizationData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      
      case 3:
          return (
            <SceneArtworkStep
              product={product}
              data={customizationData}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          );
      
      case 4:
        return (
          <OrderConfirmation
            product={product}
            data={customizationData}
            onPrev={handlePrev}
            onSubmit={handleOrderSubmit}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* 上传进度显示 */}
      {uploadProgress.isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">正在处理您的订单...</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {uploadProgress.useBatchUpload ? '分批上传模式' : '标准上传模式'}
              </p>
              {uploadProgress.useBatchUpload && (
                <p className="text-sm text-gray-600 mb-2">
                  批次进度: {uploadProgress.completedBatches}/{uploadProgress.totalBatches}
                </p>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-[#D2B48C] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress.overallProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600">{Math.round(uploadProgress.overallProgress)}%</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 进度指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {index > 0 && (
                  <div className={`w-12 h-0.5 ${
                    currentStep >= step.number ? 'bg-[#D2B48C]' : 'bg-gray-300'
                  }`}></div>
                )}
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number ? 'bg-[#D2B48C] text-white' : 'bg-gray-300 text-gray-600'
                  }`}>{step.number}</div>
                  <span className={`text-sm ${
                    currentStep >= step.number ? 'text-[#D2B48C] font-semibold' : 'text-gray-500'
                  }`}>{step.title}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            定制您的 "{product.name}"
          </p>
        </div>

        {/* 当前步骤内容 */}
        {renderCurrentStep()}
      </div>
      
      {/* 错误提示模态框 */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={closeErrorModal}
        error={errorModal.error}
      />
    </div>
  );
};

export default Customization;