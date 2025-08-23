import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ product, customizationData, onBack, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(customizationData);
      // 提交成功后跳转到确认页面
      navigate('/confirmation');
    } catch (error) {
      console.error('订单提交失败:', error);
      alert('订单提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPhotoTypeText = (type) => {
    return type === 'A' ? '展现宠物体貌特征' : '参考照片构图或场景';
  };

  const getPortraitTypeText = (type) => {
    return type === 'A' ? '经典肖像画' : '艺术名作融合';
  };

  const getSceneMethodText = (method) => {
    switch (method) {
      case 'text': return '文字描述';
      case 'upload': return '上传图片';
      case 'recommendation':
      case 'recommend': return '推荐选择';
      default: return '未选择';
    }
  };

  const getArtworkMethodText = (method) => {
    switch (method) {
      case 'upload': return '上传艺术作品';
      case 'recommendation':
      case 'recommend': return '推荐艺术作品';
      default: return '未选择';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回上一步
      </button>

      {/* 标题 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          确认您的定制信息
        </h2>
        <p className="text-lg text-gray-600">
          请仔细检查以下信息，确认无误后提交订单
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 左侧：定制信息总结 */}
        <div className="space-y-6">
          {/* 产品信息 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">产品信息</h3>
            <div className="flex items-center space-x-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 object-contain rounded-lg"
              />
              <div>
                <h4 className="font-medium text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-600">{product.englishName}</p>
                <p className="text-lg font-semibold text-[#D2B48C] mt-1">{product.priceRange}</p>
              </div>
            </div>
          </div>

          {/* 照片类型 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">照片类型</h3>
            <p className="text-gray-700">{getPhotoTypeText(customizationData.photoType)}</p>
          </div>

          {/* 画像类型 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">画像类型</h3>
            <p className="text-gray-700">{getPortraitTypeText(customizationData.portraitType)}</p>
          </div>

          {/* 场景设置 */}
          {customizationData.scene && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">场景设置</h3>
              <p className="text-gray-700 mb-2">
                方式：{getSceneMethodText(customizationData.scene.method)}
              </p>
              {customizationData.scene.method === 'text' && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">描述：</p>
                  <p className="text-gray-800">{customizationData.scene.description}</p>
                </div>
              )}
              {customizationData.scene.method === 'upload' && customizationData.scene.uploadedScene && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">上传的场景图：</p>
                  <img
                    src={customizationData.scene.uploadedScene.preview}
                    alt="场景图"
                    className="max-w-32 rounded-lg"
                  />
                </div>
              )}
              { (customizationData.scene.method === 'recommendation' || customizationData.scene.method === 'recommend') && customizationData.scene.selectedScene && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">选择的场景：</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={encodeURI(customizationData.scene.selectedScene.image)}
                      alt={customizationData.scene.selectedScene.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <p className="text-gray-800">{customizationData.scene.selectedScene.name}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 艺术作品选择 */}
          {customizationData.artwork && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">艺术作品</h3>
              <p className="text-gray-700 mb-2">
                方式：{getArtworkMethodText(customizationData.artwork.method)}
              </p>
              {customizationData.artwork.method === 'upload' && customizationData.artwork.uploadedArtwork && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">上传的艺术作品：</p>
                  <img
                    src={customizationData.artwork.uploadedArtwork.preview}
                    alt="艺术作品"
                    className="max-w-32 rounded-lg"
                  />
                </div>
              )}
              { (customizationData.artwork.method === 'recommendation' || customizationData.artwork.method === 'recommend') && customizationData.artwork.selectedArtwork && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">选择的艺术作品：</p>
                  <div className="flex items-center space-x-3">
                    <img
                      src={encodeURI(customizationData.artwork.selectedArtwork.image)}
                      alt={customizationData.artwork.selectedArtwork.name}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-gray-800 font-medium">{customizationData.artwork.selectedArtwork.name}</p>
                      <p className="text-sm text-gray-600">{customizationData.artwork.selectedArtwork.artist}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：上传的照片 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">上传的宠物照片</h3>
          {customizationData.photos && customizationData.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {customizationData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.preview}
                    alt={`宠物照片 ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    照片 {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">暂无上传的照片</p>
          )}

          {/* 定制说明 */}
          <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">定制说明</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 下单后3-5日发货</li>
              <li>• 油画立体肌理还原触感质感</li>
              <li>• 专业印刷技术精心制作</li>
              <li>• 如有疑问请联系客服</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex justify-center mt-12">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-12 py-4 rounded-lg font-medium text-lg transition-all duration-200 ${
            isSubmitting
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-[#D2B48C] text-white hover:bg-opacity-90 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>提交中...</span>
            </div>
          ) : (
            '确认并提交订单'
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;