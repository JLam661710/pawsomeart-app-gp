import React, { useState, useRef, useEffect } from 'react';
import { compressImage } from '../../../utils/imageCompression';

const ArtworkSelection = ({ onComplete, onBack }) => {
  const [artworkMethod, setArtworkMethod] = useState(null); // 'upload', 'recommendation'
  const [uploadedArtwork, setUploadedArtwork] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const fileInputRef = useRef(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (artworkMethod === 'recommendation' && showRecommendations) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/recommendations?type=artworks');
          if (res.ok) {
            const data = await res.json();
            setRecommendations(data);
          } else {
            setRecommendations([]);
          }
        } catch {
          setRecommendations([]);
        }
      };
      fetchData();
    }
  }, [artworkMethod, showRecommendations]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // 文件大小验证
      if (file.size > 9 * 1024 * 1024) {
        alert('文件大小不能超过9MB');
        return;
      }
      
      // 文件类型验证
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      
      try {
        // 压缩图片
        const compressedFile = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.6,
          maxSizeKB: 512 // 512KB
        });
        
        setUploadedArtwork({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedFile.size
        });
      } catch (error) {
        console.error('图片压缩失败:', error);
        // 如果压缩失败，使用原文件
        setUploadedArtwork({
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name
        });
      }
    }
  };



  const handleComplete = () => {
    const data = {
      method: artworkMethod,
      uploadedArtwork: artworkMethod === 'upload' ? uploadedArtwork : null,
      selectedArtwork: artworkMethod === 'recommendation' ? selectedArtwork : null
    };

    // 验证数据完整性
    if (artworkMethod === 'upload' && !uploadedArtwork) {
      alert('请上传艺术作品图片');
      return;
    }
    if (artworkMethod === 'recommendation' && !selectedArtwork) {
      alert('请选择推荐的艺术作品');
      return;
    }

    onComplete(data);
  };

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
          选择艺术名作风格
        </h2>
        <p className="text-lg text-gray-600">
          选择一幅经典艺术作品作为您宠物画像的风格参考
        </p>
      </div>

      {/* 艺术作品选择方式 */}
      {!artworkMethod && (
        <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-3xl mx-auto">
          {/* 上传艺术作品 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setArtworkMethod('upload')}>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">上传艺术作品</h3>
              <p className="text-gray-600 mb-4">上传您喜欢的艺术作品图片</p>
              <p className="text-sm text-gray-500">支持经典油画、水彩画等艺术作品</p>
            </div>
          </div>

          {/* 推荐艺术作品 */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => {
                 setArtworkMethod('recommendation');
                 setShowRecommendations(true);
               }}>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">推荐艺术作品</h3>
              <p className="text-gray-600 mb-4">从经典名作中选择</p>
              <p className="text-sm text-gray-500">包含蒙娜丽莎、星夜等经典作品</p>
            </div>
          </div>
        </div>
      )}

      {/* 上传艺术作品 */}
      {artworkMethod === 'upload' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">上传艺术作品参考图</h3>
          
          {!uploadedArtwork ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D2B48C] transition-colors">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">点击上传艺术作品图片</p>
              <p className="text-sm text-gray-500 mb-4">支持 JPG、PNG、WEBP 格式，不超过9MB</p>
              <p className="text-xs text-gray-400 mb-4">建议上传高清的艺术作品图片以获得更好的效果</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#D2B48C] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                选择文件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center">
              <img
                src={uploadedArtwork.preview}
                alt="艺术作品预览"
                className="max-w-md mx-auto rounded-lg shadow-md mb-4"
              />
              <p className="text-sm text-gray-600 mb-4">{uploadedArtwork.name || uploadedArtwork.file.name}</p>
              {uploadedArtwork.originalSize && uploadedArtwork.compressedSize && (
                <p className="text-xs text-gray-500 mb-4">
                  原始大小: {(uploadedArtwork.originalSize / 1024 / 1024).toFixed(2)}MB → 
                  压缩后: {(uploadedArtwork.compressedSize / 1024 / 1024).toFixed(2)}MB
                </p>
              )}
              <button
                onClick={() => setUploadedArtwork(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                重新上传
              </button>
            </div>
          )}
          
          <div className="flex justify-start mt-6">
            <button
              onClick={() => setArtworkMethod(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              重新选择方式
            </button>
          </div>
        </div>
      )}

      {/* 推荐艺术作品选择 */}
      {artworkMethod === 'recommendation' && showRecommendations && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            经典艺术名作
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            浏览全部推荐图片，点击任意一张进行选择
          </p>

          {/* Mobile: 横向滚动画廊 */}
          <div className="md:hidden overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex items-stretch gap-3">
              {recommendations.map((item, idx) => (
                <button
                  key={item.id || `${item.name}-${idx}`}
                  onClick={() => setSelectedArtwork(item)}
                  aria-pressed={selectedArtwork?.id === item.id}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-200 ${
                    selectedArtwork?.id === item.id
                      ? 'border-[#D2B48C] ring-2 ring-[#D2B48C]'
                      : 'border-gray-200 hover:border-[#D2B48C]'
                  }`}
                  style={{ height: 160, minWidth: 120 }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-auto object-cover"
                  />
                  {selectedArtwork?.id === item.id && (
                    <div className="absolute inset-0 bg-[#D2B48C]/20 pointer-events-none" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: 瀑布流（masonry）布局 */}
          <div className="hidden md:block">
            <div className="max-h-[520px] overflow-y-auto pr-2">
              <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                {recommendations.map((item, idx) => (
                  <button
                    key={item.id || `${item.name}-${idx}`}
                    onClick={() => setSelectedArtwork(item)}
                    aria-pressed={selectedArtwork?.id === item.id}
                    className={`relative mb-4 w-full break-inside-avoid rounded-lg overflow-hidden border transition-all duration-200 text-left ${
                      selectedArtwork?.id === item.id
                        ? 'border-[#D2B48C] ring-2 ring-[#D2B48C]'
                        : 'border-gray-200 hover:border-[#D2B48C]'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-auto object-cover block"
                    />
                    {selectedArtwork?.id === item.id && (
                      <div className="absolute inset-0 bg-[#D2B48C]/20 pointer-events-none" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => {
                setArtworkMethod(null);
                setShowRecommendations(false);
                setSelectedArtwork(null);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              重新选择方式
            </button>
            <button
              onClick={handleComplete}
              disabled={!selectedArtwork}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedArtwork ? 'bg-[#D2B48C] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              确认所选作品
            </button>
          </div>
        </div>
      )}

      {/* 继续按钮 */}
      {artworkMethod && (
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className="bg-[#D2B48C] text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
          >
            完成艺术作品选择
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtworkSelection;