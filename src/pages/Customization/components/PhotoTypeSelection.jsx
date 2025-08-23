import React from 'react';

const PhotoTypeSelection = ({ onSelect }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 标题和说明 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          我们需要您提供一些您爱宠的照片
        </h2>
        <p className="text-lg text-gray-600">
          请选择您希望的照片用途类型
        </p>
      </div>

      {/* 照片类型选择 */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* 照片类型 A */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#D2B48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                展现宠物体貌特征
              </h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 text-sm leading-relaxed">
                请让我们在照片中能看出宠物的长相、毛色、眼睛和体型等体貌特征，不一定要背景干净构图美观。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                请勿提供模糊、虚影或光线昏暗的照片。
              </p>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">需要：</span>3张照片展现宠物体貌特征
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onSelect('A')}
              className="w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
            >
              选择此类型
            </button>
          </div>
        </div>

        {/* 照片类型 B */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#D2B48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                参考照片构图或场景
              </h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 text-sm leading-relaxed">
                请尽量提供宠物体貌特征清楚可见、环境明亮、背景干净的照片。
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                如果照片的构图美观、画质清晰就更好啦～
              </p>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">需要：</span>1张照片作为构图或场景参考
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onSelect('B')}
              className="w-full bg-[#D2B48C] text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
            >
              选择此类型
            </button>
          </div>
        </div>
      </div>

      {/* 示例图片展示区域 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">
          查看示例效果，了解不同照片类型的定制结果
        </p>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 这里可以放置示例图片 */}
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">示例图片</span>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">示例图片</span>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">示例图片</span>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">示例图片</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoTypeSelection;