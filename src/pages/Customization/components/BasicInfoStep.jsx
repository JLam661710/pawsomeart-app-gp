import React, { useState, useEffect } from 'react';

// 价格矩阵 - 根据 prd.md
const PRICE_MATRIX = {
  // 经典定制款 (id: 1) - 支持1-4只宠物
  1: {
    1: { '8寸': 328, 'A4': 358, '大尺寸': 1380 },
    2: { 'A4': 388, '大尺寸': 1380 },
    3: { '大尺寸': 1380 },
    4: { '大尺寸': 1580 }
  },
  // 名画致敬款 (id: 2) - 仅限单宠
  2: {
    1: { '8寸': 358, 'A4': 388, '大尺寸': 1380 }
  },
  // 场景复刻款 (id: 3) - 支持1-3只宠物
  3: {
    1: { '8寸': 328, 'A4': 358, '大尺寸': 1380 },
    2: { 'A4': 388, '大尺寸': 1380 },
    '3+': { '大尺寸': 1380 }
  },
  // 姿态保留款 (id: 4) - 支持1-3只宠物
  4: {
    1: { '8寸': 328, 'A4': 358, '大尺寸': 1380 },
    2: { 'A4': 388, '大尺寸': 1380 },
    '3+': { '大尺寸': 1380 }
  }
};

const BasicInfoStep = ({ product, data, onNext }) => {
  const [petCount, setPetCount] = useState(data.petCount || null);
  const [size, setSize] = useState(data.size || null);
  const [price, setPrice] = useState(data.price || 0);

  // 计算价格
  useEffect(() => {
    if (petCount && size && PRICE_MATRIX[product.id]) {
      const productPrices = PRICE_MATRIX[product.id];
      // 经典定制款使用具体宠物数量，其他产品使用'3+'键
      const countKey = product.id === 1 ? petCount : (petCount >= 3 ? '3+' : petCount);
      if (productPrices[countKey] && productPrices[countKey][size]) {
        setPrice(productPrices[countKey][size]);
      }
    }
  }, [petCount, size, product.id]);

  // 获取可用的尺寸选项
  const getAvailableSizes = () => {
    if (!petCount || !PRICE_MATRIX[product.id]) return [];
    
    // 经典定制款使用具体宠物数量，其他产品使用'3+'键
    const countKey = product.id === 1 ? petCount : (petCount >= 3 ? '3+' : petCount);
    const availableSizes = PRICE_MATRIX[product.id][countKey];
    
    return Object.keys(availableSizes || {});
  };

  const handleNext = () => {
    if (petCount && size && price > 0) {
      onNext({ petCount, size, price });
    }
  };

  const isNextDisabled = !petCount || !size || price === 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-song font-bold text-center text-[#D2B48C] mb-8 tracking-song leading-song">
          第一步：设定基础信息
        </h2>

        {/* 宠物数量选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            您的画作中将包含几只宠物？
          </h3>
          {/* 根据产品类型显示不同的宠物数量选项 */}
          {product.id === 2 ? (
            // 名画致敬款：仅限单宠
            <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
              <button
                onClick={() => setPetCount(1)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  petCount === 1
                    ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">1只</div>
                  <div className="text-sm mt-1">单宠</div>
                </div>
              </button>
            </div>
          ) : product.id === 1 ? (
            // 经典定制款：支持1-4只
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((count) => {
                const isSelected = petCount === count;
                
                return (
                  <button
                    key={count}
                    onClick={() => setPetCount(count)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">{count}只</div>
                      <div className="text-xs mt-1">
                        {count === 1 ? '单宠' : count === 2 ? '双宠' : '多宠'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // 其他产品：支持1-3只（保持原有逻辑）
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((count) => {
                const isSelected = petCount === count || (count === 3 && petCount >= 3);
                
                return (
                  <button
                    key={count}
                    onClick={() => setPetCount(count === 3 ? 3 : count)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {count === 3 ? '3只及以上' : `${count}只`}
                      </div>
                      <div className="text-sm mt-1">
                        {count === 1 ? '单宠' : count === 2 ? '双宠' : '多宠'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-3 text-center">
            {product.id === 2 && (
              <p className="text-sm text-gray-500">
                * 名画致敬款仅支持单宠定制
              </p>
            )}
            {product.id === 1 && (
              <p className="text-sm text-gray-500">
                * 经典定制款支持1-5只宠物定制
              </p>
            )}
          </div>
        </div>

        {/* 尺寸选择 */}
        {petCount && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              请选择您期望的画像尺寸
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {['8寸', 'A4', '大尺寸'].map((sizeOption) => {
                const availableSizes = getAvailableSizes();
                const isAvailable = availableSizes.includes(sizeOption);
                const isSelected = size === sizeOption;
                
                return (
                  <button
                    key={sizeOption}
                    onClick={() => isAvailable && setSize(sizeOption)}
                    disabled={!isAvailable}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      !isAvailable
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">{sizeOption}</div>
                      {isAvailable && PRICE_MATRIX[product.id] && (
                        <div className="text-sm mt-1">
                          ¥{PRICE_MATRIX[product.id][product.id === 1 ? petCount : (petCount >= 3 ? '3+' : petCount)][sizeOption]}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {petCount === 2 && (
              <p className="text-sm text-gray-500 mt-2">
                * 双宠画像不支持8寸尺寸
              </p>
            )}
            {petCount >= 3 && (
              <p className="text-sm text-gray-500 mt-2">
                * 多宠画像仅支持大尺寸
              </p>
            )}
          </div>
        )}

        {/* 价格显示 */}
        {price > 0 && (
          <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">预估价格</div>
              <div className="text-3xl font-bold text-[#D2B48C]">
                ¥{price}{price >= 1380 ? '+' : ''}
              </div>
              {price >= 1380 && (
                <>
                  <div className="text-sm text-gray-500 mt-1">
                    大尺寸具体价格请咨询客服
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    当前定制需求提交后将显示客服联络方式
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 下一步按钮 */}
        <button
          onClick={handleNext}
          disabled={isNextDisabled}
          className={`w-full py-3 px-6 rounded-full font-bold text-lg transition-transform duration-300 transform hover:scale-105 ${
            isNextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#D2B48C] text-white hover:bg-opacity-90'
          }`}
        >
          下一步：上传宠物照片
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;