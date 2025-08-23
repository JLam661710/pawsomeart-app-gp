import React, { useState } from 'react';
import { Check, Edit, Package, Camera, Palette, CreditCard, Truck } from 'lucide-react';

const OrderConfirmation = ({ product, data, onPrev, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    notes: ''
  });

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!contactInfo.phone) {
      alert('请填写联系电话');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderData = {
        product,
        customization: data,
        contact: contactInfo,
        timestamp: new Date().toISOString()
      };
      
      await onSubmit(orderData);
    } catch (error) {
      console.error('订单提交失败:', error);
      alert('订单提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSceneArtworkDisplay = () => {
    if (!data.selectionMethod) return null;
    
    const isArtwork = product.id === 2;
    const title = isArtwork ? '名画风格' : '场景背景';
    
    switch (data.selectionMethod) {
      case 'text':
        return {
          title: `${title}（文字描述）`,
          content: data.textDescription
        };
      case 'upload':
        return {
          title: `${title}（上传图片）`,
          content: data.uploadedImage?.name || '已上传图片'
        };
      case 'recommendation':
        return {
          title: `${title}（推荐选择）`,
          content: data.selectedRecommendation?.name || '已选择推荐项'
        };
      default:
        return null;
    }
  };

  const sceneArtworkInfo = getSceneArtworkDisplay();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-song font-bold text-center text-[#D2B48C] mb-8 tracking-song leading-song">
          订单确认
        </h2>

        {/* 订单摘要 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            订单摘要
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {/* 产品信息 */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <div className="font-semibold text-gray-800">{product.name}</div>
                <div className="text-sm text-gray-600">{product.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#D2B48C]">¥{data.price}</div>
                <div className="text-sm text-gray-600">{data.size}</div>
              </div>
            </div>

            {/* 基础信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">宠物数量</div>
                <div className="font-semibold">{data.petCount}只</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">画像尺寸</div>
                <div className="font-semibold">{data.size}</div>
              </div>
            </div>

            {/* 照片信息 */}
            <div>
              <div className="text-sm text-gray-600 mb-2 flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                上传照片
              </div>
              <div className="font-semibold">
                已上传 {data.photos?.length || 0} 张照片
              </div>
            </div>

            {/* 场景/名画信息 */}
            {sceneArtworkInfo && (
              <div>
                <div className="text-sm text-gray-600 mb-2 flex items-center">
                  <Palette className="w-4 h-4 mr-1" />
                  {sceneArtworkInfo.title}
                </div>
                <div className="font-semibold">
                  {sceneArtworkInfo.content}
                </div>
                {data.selectionMethod === 'recommendation' && data.selectedRecommendation?.image && (
                  <div className="mt-2">
                    <img
                      src={encodeURI(data.selectedRecommendation.image)}
                      alt={data.selectedRecommendation.name}
                      className="w-32 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 联系信息 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            联系信息
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* 联系电话 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  联系电话 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-shadow"
                  placeholder="请输入联系电话（支持大陆/港澳台/国际号码）"
                />
              </div>

              {/* 邮箱地址 */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactInfo.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-shadow"
                  placeholder="用于接收订单确认和作品预览"
                />
              </div>
            </div>

            {/* 备注信息 */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                备注信息
              </label>
              <textarea
                id="notes"
                value={contactInfo.notes}
                onChange={(e) => handleContactChange('notes', e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-shadow"
                placeholder="如有特殊要求，例如背景颜色、特定配饰等，请在此处填写"
              ></textarea>
            </div>
          </div>
        </div>

        {/* 服务说明 */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">服务说明：</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 订单确认后，我们将在1-2个工作日内与您联系确认细节</li>
                <li>• 画作制作周期为3-5个工作日</li>
                <li>• 制作完成后将通过您提供的联系方式发送预览图</li>
                <li>• 快递与物流相关服务细节将会有客服专员与您沟通提供支持</li>
                <li>• 如有任何问题，请随时联系客服</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between">
          <button
            onClick={() => onPrev(contactInfo)}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full font-semibold text-gray-700 bg-white border-2 border-gray-300 transition-transform duration-300 transform hover:scale-105 hover:border-gray-400 disabled:opacity-50"
          >
            上一步
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !contactInfo.phone}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-transform duration-300 transform hover:scale-105 flex items-center space-x-2 ${
              isSubmitting || !contactInfo.phone
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#D2B48C] text-white hover:bg-opacity-90'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>确认提交订单</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;