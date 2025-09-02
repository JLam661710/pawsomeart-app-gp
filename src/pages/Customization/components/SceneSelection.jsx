import React, { useState, useRef, useEffect, useMemo } from 'react';
import { compressImage } from '../../../utils/imageCompression';
import { getImagePath } from '../../../utils/pathUtils';

const SceneSelection = ({ product, photoType, portraitType, onComplete, onBack }) => {
  const [sceneMethod, setSceneMethod] = useState(null); // 'text', 'upload', 'recommendation'
  const [sceneDescription, setSceneDescription] = useState('');
  const [uploadedScene, setUploadedScene] = useState(null);
  const [selectedScene, setSelectedScene] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const fileInputRef = useRef(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (sceneMethod === 'recommendation' && showRecommendations) {
      const fetchData = async () => {
        try {
          const res = await fetch(`/api/recommendations?type=scenes&productId=${product?.id}`);
          if (res.ok) {
            const data = await res.json();
            setRecommendations(data);
          } else {
            setRecommendations(recommendedScenes || []);
          }
        } catch {
          setRecommendations(recommendedScenes || []);
        }
      };
      fetchData();
    }
  }, [sceneMethod, showRecommendations, product?.id, recommendedScenes]);

  // 推荐场景图片（这里使用占位符，实际应该从 pictures/ArtworkToBeBackgroundRecommended 加载）
  const recommendedScenes = useMemo(() => [
    { id: 1, name: '彩色表现主义', image: getImagePath('ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-1.png') },
    { id: 2, name: '现代画作', image: getImagePath('ArtworkToBeBackgroundRecommended/B-ModernPaintingsWithSharpColorsAndBrushes-1.jpeg') },
    { id: 3, name: '装饰图像', image: getImagePath('ArtworkToBeBackgroundRecommended/C-SmoothAndEye-catchingDecorativeImages-1.png') },
    { id: 4, name: '印象派风景', image: getImagePath('ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-1.jpg') },
    { id: 5, name: '点彩画法', image: getImagePath('ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-1.jpg') },
    { id: 6, name: '紫色印象', image: getImagePath('ArtworkToBeBackgroundRecommended/F-ThePurpleImpression-1.png') },
    { id: 7, name: '抽象线条', image: getImagePath('ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-1.png') },
    { id: 8, name: '广阔印象', image: getImagePath('ArtworkToBeBackgroundRecommended/G-TheImpressionOfAVastAndShallowPlace-1.png') }
  ], []);

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
        
        setUploadedScene({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
          name: file.name,
          originalSize: file.size,
          compressedSize: compressedFile.size
        });
      } catch (error) {
        console.error('图片压缩失败:', error);
        // 如果压缩失败，使用原文件
        setUploadedScene({
          file: file,
          preview: URL.createObjectURL(file),
          name: file.name
        });
      }
    }
  };

  const handleSceneSelect = (scene) => {
    setSelectedScene(scene);
  };

  const handleComplete = () => {
    const data = {
      method: sceneMethod,
      description: sceneMethod === 'text' ? sceneDescription : '',
      uploadedScene: sceneMethod === 'upload' ? uploadedScene : null,
      selectedScene: sceneMethod === 'recommendation' ? selectedScene : null
    };

    // 验证数据完整性
    if (sceneMethod === 'text' && !sceneDescription.trim()) {
      alert('请输入场景描述');
      return;
    }
    if (sceneMethod === 'upload' && !uploadedScene) {
      alert('请上传场景图片');
      return;
    }
    if (sceneMethod === 'recommendation' && !selectedScene) {
      alert('请选择推荐的场景');
      return;
    }

    onComplete(data);
  };

  const getTitle = () => {
    if (photoType === 'A' && portraitType === 'A') {
      return '请建议画像中宠物所在的场景';
    }
    return '请建议画像场景';
  };

  const getDescription = () => {
    if (photoType === 'A' && portraitType === 'A') {
      return '可以提供图片示意或文字描述';
    }
    return '请提供图片示意或文字描述';
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
          {getTitle()}
        </h2>
        <p className="text-lg text-gray-600">
          {getDescription()}
        </p>
      </div>

      {/* 场景选择方式 */}
      {!sceneMethod && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 文字描述 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setSceneMethod('text')}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">文字描述</h3>
              <p className="text-sm text-gray-600">用文字描述您期望的场景</p>
            </div>
          </div>

          {/* 图片上传 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => setSceneMethod('upload')}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">上传图片</h3>
              <p className="text-sm text-gray-600">上传一张场景参考图</p>
            </div>
          </div>

          {/* 推荐选择 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
               onClick={() => {
                 setSceneMethod('recommendation');
                 setShowRecommendations(true);
               }}>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">推荐选择</h3>
              <p className="text-sm text-gray-600">从我们的推荐中选择</p>
            </div>
          </div>
        </div>
      )}

      {/* 文字描述输入 */}
      {sceneMethod === 'text' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">描述您期望的场景</h3>
          <textarea
            value={sceneDescription}
            onChange={(e) => setSceneDescription(e.target.value)}
            placeholder="请详细描述您希望的背景场景，例如：花园、海边、森林、客厅等..."
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setSceneMethod(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              重新选择方式
            </button>
            <span className="text-sm text-gray-500">{sceneDescription.length}/500</span>
          </div>
        </div>
      )}

      {/* 图片上传 */}
      {sceneMethod === 'upload' && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">上传场景参考图</h3>
          
          {!uploadedScene ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D2B48C] transition-colors">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">点击上传场景图片</p>
              <p className="text-sm text-gray-500 mb-4">支持 JPG、PNG、WEBP 格式，不超过9MB</p>
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
                src={uploadedScene.preview}
                alt="场景预览"
                className="max-w-md mx-auto rounded-lg shadow-md mb-4"
              />
              <p className="text-sm text-gray-600 mb-4">{uploadedScene.name || uploadedScene.file.name}</p>
              {uploadedScene.originalSize && uploadedScene.compressedSize && (
                <p className="text-xs text-gray-500 mb-4">
                  原始大小: {(uploadedScene.originalSize / 1024 / 1024).toFixed(2)}MB → 
                  压缩后: {(uploadedScene.compressedSize / 1024 / 1024).toFixed(2)}MB
                </p>
              )}
              <button
                onClick={() => setUploadedScene(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                重新上传
              </button>
            </div>
          )}
          
          <div className="flex justify-start mt-6">
            <button
              onClick={() => setSceneMethod(null)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              重新选择方式
            </button>
          </div>
        </div>
      )}

      {/* 推荐场景选择 */}
      {sceneMethod === 'recommendation' && showRecommendations && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            推荐的艺术风格场景
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
                  onClick={() => handleSceneSelect(item)}
                  aria-pressed={selectedScene?.id === item.id}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-200 ${
                    selectedScene?.id === item.id
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
                  {selectedScene?.id === item.id && (
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
                    onClick={() => handleSceneSelect(item)}
                    aria-pressed={selectedScene?.id === item.id}
                    className={`relative mb-4 w-full break-inside-avoid rounded-lg overflow-hidden border transition-all duration-200 text-left ${
                      selectedScene?.id === item.id
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
                    {selectedScene?.id === item.id && (
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
                setSceneMethod(null);
                setShowRecommendations(false);
                setSelectedScene(null);
              }}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              重新选择方式
            </button>
            <button
              onClick={handleComplete}
              disabled={!selectedScene}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedScene ? 'bg-[#D2B48C] text-white hover:bg-opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              确认所选场景
            </button>
          </div>
        </div>
      )}

      {/* 继续按钮 */}
      {sceneMethod && (
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className="bg-[#D2B48C] text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 hover:shadow-md"
          >
            完成场景设置
          </button>
        </div>
      )}
    </div>
  );
};

export default SceneSelection;