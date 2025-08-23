import React from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import { products } from './products';

const Lobby = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-song font-bold text-gray-800 mb-6 tracking-song leading-song">
              为您的爱宠
              <span className="block text-[#D2B48C] mt-2">定制专属艺术肖像</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              将珍贵的回忆转化为永恒的艺术品<br />让每一个瞬间都成为值得珍藏的杰作
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>下单后3-5日发货</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>油画立体肌理还原触感质感</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>个性化定制服务</span>
              </div>
            </div>
            
            {/* Scroll Down Indicator */}
            <div className="mt-12 flex justify-center">
              <div className="animate-bounce">
                <svg 
                  className="w-6 h-6 text-gray-400 hover:text-[#D2B48C] transition-colors duration-300 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-song font-bold text-gray-800 mb-4 tracking-song leading-song">
              选择您喜爱的
              <span className="text-[#D2B48C]">艺术风格</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              四种独特的创作风格，每一种都能完美诠释您爱宠的独特魅力
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-song font-bold text-gray-800 mb-8 tracking-song leading-song">为什么选择 PawsomeArt？</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="">
              <div className="w-16 h-16 bg-[#D2B48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">用心创作</h4>
              <p className="text-gray-600">独家工艺精心制作，为产品质感与艺术价值护航</p>
            </div>
            <div className="">
              <div className="w-16 h-16 bg-[#D2B48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">品质保证</h4>
              <p className="text-gray-600">使用高品质画布和颜料，确保作品持久保存，历久弥新</p>
            </div>
            <div className="">
              <div className="w-16 h-16 bg-[#D2B48C] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6l-4 4V8a2 2 0 012-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">贴心服务</h4>
              <p className="text-gray-600">一对一专属客服，全程跟进创作进度，让您安心无忧</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 PawsomeArt. 保留所有权利。
          </p>
          <p className="text-xs text-gray-400 mt-2">
            专业宠物艺术肖像定制服务
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Lobby;