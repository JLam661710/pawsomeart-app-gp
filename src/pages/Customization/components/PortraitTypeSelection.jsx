import React from 'react';

const PortraitTypeSelection = ({ onSelect, onBack }) => {
  return (
    <div className="max-w-5xl mx-auto">
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

      {/* 标题和说明 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          请选择画像类型
        </h2>
        <p className="text-lg text-gray-600">
          请在下列画像类型中选择其中一项
        </p>
      </div>

      {/* 画像类型选择 */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* 画像类型 A */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* 示例图片区域 */}
          <div className="h-64 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-[#D2B48C]">A</span>
              </div>
              <p className="text-gray-600 text-sm">经典肖像画风格</p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              经典肖像画
            </h3>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 text-sm leading-relaxed">
                画像师将根据您提供的宠物照片创作正面端坐姿势的宠物画像。
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">特色：</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 正面端坐的经典姿势</li>
                  <li>• 突出宠物的体貌特征</li>
                  <li>• 可自定义背景场景</li>
                  <li>• 适合纪念和收藏</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => onSelect('A')}
              className="w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
            >
              选择经典肖像画
            </button>
          </div>
        </div>

        {/* 画像类型 B */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          {/* 示例图片区域 */}
          <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-[#D2B48C]">B</span>
              </div>
              <p className="text-gray-600 text-sm">艺术名作融合风格</p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              艺术名作融合
            </h3>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 text-sm leading-relaxed">
                您可以选择更具备鲜明艺术风格和文化特质的宠物画像创作方式。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                画像师将结合您的爱宠特点（包括形象、个性）以及您喜爱的艺术风格，精选并融合艺术肖像画名作，实现宠物艺术美学的跨时空对话。
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">特色：</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 融合经典艺术名作风格</li>
                  <li>• 体现宠物独特个性</li>
                  <li>• 跨时空的艺术对话</li>
                  <li>• 独一无二的艺术价值</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => onSelect('B')}
              className="w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
            >
              选择艺术名作融合
            </button>
          </div>
        </div>
      </div>

      {/* 效果展示区域 */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-8">
          效果展示
        </h3>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 示例图片占位符 */}
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs text-gray-400">效果示例</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            左右滑动查看更多效果示例
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortraitTypeSelection;