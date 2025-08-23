import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 导入 useNavigate
import { products } from '../Lobby/products';
import BasicInfoStep from './components/BasicInfoStep';
import PhotoUploadStep from './components/PhotoUploadStep';
import SceneArtworkStep from './components/SceneArtworkStep';
import OrderConfirmation from './components/OrderConfirmation';
import ErrorModal from '../../components/ErrorModal/ErrorModal';

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
    
    const formData = new FormData();
  
    // 附加所有定制化数据
    Object.entries(finalData).forEach(([key, value]) => {
      if (key === 'photos' && Array.isArray(value)) {
        console.log(`[Customization] handleOrderSubmit: Processing photos array, length: ${value.length}`);
        value.forEach((photo, index) => {
          console.log(`[Customization] handleOrderSubmit: Photo ${index}:`, {
            hasFile: photo.file instanceof File,
            fileName: photo.file?.name,
            fileSize: photo.file?.size,
            fileType: photo.file?.type
          });
          if (photo.file instanceof File) {
            formData.append('user_uploads', photo.file, photo.file.name);
            console.log(`[Customization] handleOrderSubmit: Appended photo ${index} to FormData`);
          } else {
            console.warn(`[Customization] handleOrderSubmit: Photo ${index} does not have valid File object`);
          }
        });
      } else if (key === 'contactInfo' && typeof value === 'object' && value !== null) {
        console.log('[Customization] handleOrderSubmit: Processing contactInfo:', value);
        Object.entries(value).forEach(([contactKey, contactValue]) => {
          formData.append(contactKey, contactValue);
          console.log(`[Customization] handleOrderSubmit: Appended contact field ${contactKey}: ${contactValue}`);
        });
      } else if (key === 'uploadedImage') {
        console.log('[Customization] handleOrderSubmit: Processing uploadedImage:', {
          isFile: value instanceof File,
          hasFileProperty: value && value.file instanceof File,
          value: value
        });
        // 支持两种形态：File 或 { file, preview, name }
        if (value instanceof File) {
          formData.append('uploadedImage', value, value.name);
          console.log('[Customization] handleOrderSubmit: Appended uploadedImage (File) to FormData');
        } else if (value && value.file instanceof File) {
          formData.append('uploadedImage', value.file, value.file.name);
          console.log('[Customization] handleOrderSubmit: Appended uploadedImage (object.file) to FormData');
        } else if (value) {
          console.warn('[Customization] handleOrderSubmit: uploadedImage exists but is not a valid File:', value);
        }
      } else if (typeof value === 'object' && value !== null) {
        const jsonValue = JSON.stringify(value);
        formData.append(key, jsonValue);
        console.log(`[Customization] handleOrderSubmit: Appended object field ${key}: ${jsonValue}`);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
        console.log(`[Customization] handleOrderSubmit: Appended field ${key}: ${value}`);
      }
    });
  
    // 附加产品信息
    formData.append('customization_style', product.name);
    console.log(`[Customization] handleOrderSubmit: Appended customization_style: ${product.name}`);
    
    // 打印FormData内容（用于调试）
    console.log('[Customization] handleOrderSubmit: FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
  
    try {
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        let errorData;
        try {
          const responseText = await response.text();
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { message: responseText || '服务器错误' };
          }
        } catch {
          errorData = { message: '网络连接错误' };
        }
        
        // 解析后端返回的详细错误信息
        const errorInfo = {
          type: errorData.errorType || 'API_ERROR',
          message: errorData.message || '订单提交失败',
          fileName: errorData.fileName,
          fileSize: errorData.fileSize,
          details: errorData.error,
          suggestions: errorData.suggestions || [
            '请检查网络连接是否正常',
            '确认所有必填信息已正确填写',
            '如问题持续存在，请联系客服'
          ]
        };
        
        setErrorModal({
          isOpen: true,
          error: errorInfo
        });
        return;
      }
  
      const result = await response.json();
  
      if (result.orderId) {
        navigate('/submission-success', { 
          state: { orderId: result.orderId }
        });
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
      } else {
        throw new Error('订单ID无效');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      
      // 处理网络错误或其他异常
      const errorInfo = {
        type: 'NETWORK_ERROR',
        message: error.message || '订单提交时发生网络错误',
        suggestions: [
          '请检查您的网络连接',
          '确认服务器连接正常',
          '稍后重试或联系技术支持'
        ]
      };
      
      setErrorModal({
        isOpen: true,
        error: errorInfo
      });
    }
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