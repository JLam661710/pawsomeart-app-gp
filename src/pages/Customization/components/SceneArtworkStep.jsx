import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Palette, Camera, Sparkles } from 'lucide-react';
import { compressImage } from '../../../utils/imageCompression';

// 完整的场景推荐数据（硬编码）
const SCENE_RECOMMENDATIONS = {
  1: [
    { id: 1, name: 'A-ColorfulExpressionism-1', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-1.png', description: '色彩鲜艳的表达主义风格' },
    { id: 2, name: 'A-ColorfulExpressionism-2', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-2.jpeg', description: '色彩鲜艳的表达主义风格' },
    { id: 3, name: 'A-ColorfulExpressionism-3', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-3.png', description: '色彩鲜艳的表达主义风格' },
    { id: 4, name: 'B-ModernPaintingsWithSharpColorsAndBrushes-1', image: '/pictures/ArtworkToBeBackgroundRecommended/B-ModernPaintingsWithSharpColorsAndBrushes-1.jpeg', description: '现代画作' },
    { id: 5, name: 'C-SmoothAndEye-catchingDecorativeImages-1', image: '/pictures/ArtworkToBeBackgroundRecommended/C-SmoothAndEye-catchingDecorativeImages-1.png', description: '平滑且引人注目的装饰图像' },
    { id: 6, name: 'D-ImpressionistLandscape-1', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-1.jpg', description: '印象派风景' },
    { id: 7, name: 'D-ImpressionistLandscape-2', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-2.jpg', description: '印象派风景' },
    { id: 8, name: 'D-ImpressionistLandscape-3', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-3.png', description: '印象派风景' },
    { id: 9, name: 'E-PointillismBrushstrokeAndColor-1', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-1.jpg', description: '点画派笔触与色彩' },
    { id: 10, name: 'E-PointillismBrushstrokeAndColor-2', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-2.png', description: '点画派笔触与色彩' },
    { id: 11, name: 'F-ThePurpleImpression-1', image: '/pictures/ArtworkToBeBackgroundRecommended/F-ThePurpleImpression-1.png', description: '紫色印象' },
    { id: 12, name: 'G-TheImpressionOfAVastAndShallowPlace-1', image: '/pictures/ArtworkToBeBackgroundRecommended/G-TheImpressionOfAVastAndShallowPlace-1.png', description: '广阔浅滩的印象' },
    { id: 13, name: 'H-AbstractLinesAndShapes-1', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-1.png', description: '抽象线条与形状' },
    { id: 14, name: 'H-AbstractLinesAndShapes-2', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-2.png', description: '抽象线条与形状' },
    { id: 15, name: 'H-AbstractLinesAndShapes-3', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-3.png', description: '抽象线条与形状' }
  ],
  3: [
    { id: 16, name: 'A-ColorfulExpressionism-1', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-1.png', description: '色彩鲜艳的表达主义风格' },
    { id: 17, name: 'A-ColorfulExpressionism-2', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-2.jpeg', description: '色彩鲜艳的表达主义风格' },
    { id: 18, name: 'A-ColorfulExpressionism-3', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-3.png', description: '色彩鲜艳的表达主义风格' },
    { id: 19, name: 'B-ModernPaintingsWithSharpColorsAndBrushes-1', image: '/pictures/ArtworkToBeBackgroundRecommended/B-ModernPaintingsWithSharpColorsAndBrushes-1.jpeg', description: '现代画作' },
    { id: 20, name: 'C-SmoothAndEye-catchingDecorativeImages-1', image: '/pictures/ArtworkToBeBackgroundRecommended/C-SmoothAndEye-catchingDecorativeImages-1.png', description: '平滑且引人注目的装饰图像' },
    { id: 21, name: 'D-ImpressionistLandscape-1', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-1.jpg', description: '印象派风景' },
    { id: 22, name: 'D-ImpressionistLandscape-2', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-2.jpg', description: '印象派风景' },
    { id: 23, name: 'D-ImpressionistLandscape-3', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-3.png', description: '印象派风景' },
    { id: 24, name: 'E-PointillismBrushstrokeAndColor-1', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-1.jpg', description: '点画派笔触与色彩' },
    { id: 25, name: 'E-PointillismBrushstrokeAndColor-2', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-2.png', description: '点画派笔触与色彩' },
    { id: 26, name: 'F-ThePurpleImpression-1', image: '/pictures/ArtworkToBeBackgroundRecommended/F-ThePurpleImpression-1.png', description: '紫色印象' },
    { id: 27, name: 'G-TheImpressionOfAVastAndShallowPlace-1', image: '/pictures/ArtworkToBeBackgroundRecommended/G-TheImpressionOfAVastAndShallowPlace-1.png', description: '广阔浅滩的印象' },
    { id: 28, name: 'H-AbstractLinesAndShapes-1', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-1.png', description: '抽象线条与形状' },
    { id: 29, name: 'H-AbstractLinesAndShapes-2', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-2.png', description: '抽象线条与形状' },
    { id: 30, name: 'H-AbstractLinesAndShapes-3', image: '/pictures/ArtworkToBeBackgroundRecommended/H-AbstractLinesAndShapes-3.png', description: '抽象线条与形状' }
  ]
};

// 完整的艺术作品推荐数据（硬编码）
const ARTWORK_RECOMMENDATIONS = [
  { id: 1, name: 'Berthe Morisot with a Bouquet of Violets-Edouard Manet', artist: 'Edouard Manet', image: '/pictures/FamousArtPortraitsRecommended/Berthe Morisot with a Bouquet of Violets-Edouard Manet.png', description: '贝尔特·莫里索与紫罗兰花束' },
  { id: 2, name: 'Girl with a Pearl Earring-Johannes Vermeer', artist: 'Johannes Vermeer', image: '/pictures/FamousArtPortraitsRecommended/Girl with a Pearl Earring-Johannes Vermeer.png', description: '戴珍珠耳环的少女' },
  { id: 3, name: 'La Primevere et La Plume-Alphonse Mucha', artist: 'Alphonse Mucha', image: '/pictures/FamousArtPortraitsRecommended/La Primevere et La Plume-Alphonse Mucha.png', description: '报春花与羽毛' },
  { id: 4, name: 'Lady with an Ermine-Leonardo da Vinci', artist: 'Leonardo da Vinci', image: '/pictures/FamousArtPortraitsRecommended/Lady with an Ermine-Leonardo da Vinci.png', description: '抱银鼠的女子' },
  { id: 5, name: 'Marchesa Brigida Spinola Doria-Peter Paul Rubens', artist: 'Peter Paul Rubens', image: '/pictures/FamousArtPortraitsRecommended/Marchesa Brigida Spinola Doria-Peter Paul Rubens.png', description: '布里吉达·斯皮诺拉·多里亚侯爵夫人' },
  { id: 6, name: 'Portrait Fritz Ridler-Klimt Gustav', artist: 'Gustav Klimt', image: '/pictures/FamousArtPortraitsRecommended/Portrait Fritz Ridler-Klimt Gustav.png', description: '弗里茨·里德勒肖像' },
  { id: 7, name: 'Portrait of Armand Roulin-Vincent van Gogh', artist: 'Vincent van Gogh', image: '/pictures/FamousArtPortraitsRecommended/Portrait of Armand Roulin-Vincent van Gogh.png', description: '阿尔芒·鲁林肖像' },
  { id: 8, name: 'Portrait of Josette Gris-Juan Gris', artist: 'Juan Gris', image: '/pictures/FamousArtPortraitsRecommended/Portrait of Josette Gris-Juan Gris.png', description: '约塞特·格里斯肖像' },
  { id: 9, name: 'Portrait of Madame Matisse. The Green Line-Henri Matisse', artist: 'Henri Matisse', image: '/pictures/FamousArtPortraitsRecommended/Portrait of Madame Matisse. The Green Line-Henri Matisse.png', description: '马蒂斯夫人肖像·绿线' },
  { id: 10, name: 'Portrait of Pablo Picasso-Juan Gris', artist: 'Juan Gris', image: '/pictures/FamousArtPortraitsRecommended/Portrait of Pablo Picasso-Juan Gris.png', description: '巴勃罗·毕加索肖像' },
  { id: 11, name: 'Portrait of Wally-Egon Schiele', artist: 'Egon Schiele', image: '/pictures/FamousArtPortraitsRecommended/Portrait of Wally-Egon Schiele.png', description: '瓦利肖像' },
  { id: 12, name: 'Portrait of William I King of the Netherlands-Joseph Paelinck', artist: 'Joseph Paelinck', image: '/pictures/FamousArtPortraitsRecommended/Portrait of William I King of the Netherlands-Joseph Paelinck.png', description: '荷兰国王威廉一世肖像' },
  { id: 13, name: 'Samuel F. B. Morse Self-Portrait-Samuel F. B. Morse', artist: 'Samuel F. B. Morse', image: '/pictures/FamousArtPortraitsRecommended/Samuel F. B. Morse Self-Portrait-Samuel F. B. Morse.png', description: '塞缪尔·莫尔斯自画像' },
  { id: 14, name: 'Seated Woman-Juan Gris', artist: 'Juan Gris', image: '/pictures/FamousArtPortraitsRecommended/Seated Woman-Juan Gris.png', description: '坐着的女人' },
  { id: 15, name: 'Self Portrait in a Straw Hat- Elisabeth Vigee Le Brun', artist: 'Elisabeth Vigee Le Brun', image: '/pictures/FamousArtPortraitsRecommended/Self Portrait in a Straw Hat- Elisabeth Vigee Le Brun.png', description: '戴草帽的自画像' },
  { id: 16, name: 'Self-Portrait 1-Vincent van Gogh', artist: 'Vincent van Gogh', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait 1-Vincent van Gogh.png', description: '自画像1' },
  { id: 17, name: 'Self-Portrait 2-Vincent van Gogh', artist: 'Vincent van Gogh', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait 2-Vincent van Gogh.png', description: '自画像2' },
  { id: 18, name: 'Self-Portrait 3-Vincent van Gogh', artist: 'Vincent van Gogh', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait 3-Vincent van Gogh.png', description: '自画像3' },
  { id: 19, name: 'Self-Portrait with Chinese Lantern Plant-Egon Schiele', artist: 'Egon Schiele', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait with Chinese Lantern Plant-Egon Schiele.png', description: '与酸浆植物的自画像' },
  { id: 20, name: 'Self-Portrait with Grey Felt Hat-Vincent van Gogh ', artist: 'Vincent van Gogh', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait with Grey Felt Hat-Vincent van Gogh .png', description: '戴灰色毡帽的自画像' },
  { id: 21, name: 'Self-Portrait-Paul Gauguin', artist: 'Paul Gauguin', image: '/pictures/FamousArtPortraitsRecommended/Self-Portrait-Paul Gauguin.png', description: '自画像' },
  { id: 22, name: 'Self-portrait Dedicated to Leon Trotsky-Frida Kahlo', artist: 'Frida Kahlo', image: '/pictures/FamousArtPortraitsRecommended/Self-portrait Dedicated to Leon Trotsky-Frida Kahlo.png', description: '献给列昂·托洛茨基的自画像' },
  { id: 23, name: 'Self-portrait as the Allegory of Painting-Artemisia Gentileschi', artist: 'Artemisia Gentileschi', image: '/pictures/FamousArtPortraitsRecommended/Self-portrait as the Allegory of Painting-Artemisia Gentileschi.png', description: '作为绘画寓言的自画像' },
  { id: 24, name: 'Self-portrait wearing a velvet dress-Frida Kahlo', artist: 'Frida Kahlo', image: '/pictures/FamousArtPortraitsRecommended/Self-portrait wearing a velvet dress-Frida Kahlo.png', description: '穿天鹅绒裙子的自画像' },
  { id: 25, name: 'Self-portrait-Frida Kahlo', artist: 'Frida Kahlo', image: '/pictures/FamousArtPortraitsRecommended/Self-portrait-Frida Kahlo.png', description: '自画像' },
  { id: 26, name: 'Self-portrait-Rembrandt', artist: 'Rembrandt', image: '/pictures/FamousArtPortraitsRecommended/Self-portrait-Rembrandt.png', description: '自画像' },
  { id: 27, name: 'The Lady of the Camellias-Alphonse Mucha', artist: 'Alphonse Mucha', image: '/pictures/FamousArtPortraitsRecommended/The Lady of the Camellias-Alphonse Mucha.png', description: '茶花女' },
  { id: 28, name: 'The Lady with the Veil (the Artist\'s Wife)-Alexander Roslin', artist: 'Alexander Roslin', image: '/pictures/FamousArtPortraitsRecommended/The Lady with the Veil (the Artist\'s Wife)-Alexander Roslin.png', description: '戴面纱的女士（艺术家的妻子）' },
  { id: 29, name: 'The Red Boy-Sir Thomas Lawrence', artist: 'Sir Thomas Lawrence', image: '/pictures/FamousArtPortraitsRecommended/The Red Boy-Sir Thomas Lawrence.png', description: '红衣男孩' },
  { id: 30, name: 'Woman with a Parasol – Madame Monet and Her Son-Claude Monet ', artist: 'Claude Monet', image: '/pictures/FamousArtPortraitsRecommended/Woman with a Parasol – Madame Monet and Her Son-Claude Monet .png', description: '撑阳伞的女人——莫奈夫人和她的儿子' },
  { id: 31, name: 'Zodiac-Alphonse Mucha', artist: 'Alphonse Mucha', image: '/pictures/FamousArtPortraitsRecommended/Zodiac-Alphonse Mucha.png', description: '黄道十二宫' }
];

const SceneArtworkStep = ({ product, data, onNext, onPrev }) => {
  const [selectionMethod, setSelectionMethod] = useState(data.selectionMethod || null);
  const [textDescription, setTextDescription] = useState(data.textDescription || '');
  const [uploadedImage, setUploadedImage] = useState(data.uploadedImage || null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(data.selectedRecommendation || null);
  const [recommendations, setRecommendations] = useState([]);
  const fileInputRef = useRef(null);

  const isArtworkProduct = product.id === 2; // 名画致敬款

  useEffect(() => {
    if (selectionMethod === 'recommendation') {
      // 直接使用硬编码的推荐数据
      if (isArtworkProduct) {
        setRecommendations(ARTWORK_RECOMMENDATIONS);
      } else {
        setRecommendations(SCENE_RECOMMENDATIONS[product.id] || []);
      }
    }
  }, [selectionMethod, isArtworkProduct, product.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 9 * 1024 * 1024) {
        alert('文件大小不能超过9MB');
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
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage({
            file: compressedFile,
            preview: e.target.result,
            name: file.name,
            originalSize: file.size,
            compressedSize: compressedFile.size
          });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('图片压缩失败:', error);
        // 如果压缩失败，使用原文件
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage({
            file: file,
            preview: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    const stepData = {
      selectionMethod,
      textDescription: selectionMethod === 'text' ? textDescription : '',
      uploadedImage: selectionMethod === 'upload' ? uploadedImage : null,
      selectedRecommendation: selectionMethod === 'recommendation' ? selectedRecommendation : null
    };
    
    const hasValidSelection = 
      (selectionMethod === 'text' && textDescription.trim()) ||
      (selectionMethod === 'upload' && uploadedImage) ||
      (selectionMethod === 'recommendation' && selectedRecommendation);
    
    if (hasValidSelection) {
      onNext(stepData);
    }
  };

  const handlePrev = () => {
    const stepData = {
      selectionMethod,
      textDescription,
      uploadedImage,
      selectedRecommendation
    };
    onPrev(stepData);
  };

  const isNextDisabled = 
    !selectionMethod ||
    (selectionMethod === 'text' && !textDescription.trim()) ||
    (selectionMethod === 'upload' && !uploadedImage) ||
    (selectionMethod === 'recommendation' && !selectedRecommendation);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-song font-bold text-center text-[#D2B48C] mb-8 tracking-song leading-song">
          第三步：{isArtworkProduct ? '选择名画风格' : '设定场景背景'}
        </h2>

        {/* 指导图片 */}
        {(product.id === 1 || product.id === 2 || product.id === 3) && (
          <div className="mb-8 flex justify-center">
            <div className="max-w-md">
              <img 
                src={product.id === 1 ? '/pictures/TheClassicPortrait_GuideToSetBackground.png' : 
                     product.id === 2 ? '/pictures/TheMasterpieceHomage_GuideToMixArtworks.png' : 
                     '/pictures/Pose-OnlyRecreationStyle_GuideToSetBackground.png'} 
                alt="设定指导图" 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        )}

        {/* 选择方式 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            请选择{isArtworkProduct ? '名画' : '场景'}设定方式
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSelectionMethod('text')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectionMethod === 'text'
                  ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
              }`}
            >
              <Palette className="w-8 h-8 mx-auto mb-2" />
              <div className="text-center">
                <div className="font-semibold">文字描述</div>
                <div className="text-sm mt-1">{isArtworkProduct ? '描述您宠物的特征' : '用文字描述您的想法'}</div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectionMethod('upload')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectionMethod === 'upload'
                  ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
              }`}
            >
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <div className="text-center">
                <div className="font-semibold">上传图片</div>
                <div className="text-sm mt-1">上传参考图片</div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectionMethod('recommendation')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                selectionMethod === 'recommendation'
                  ? 'bg-[#D2B48C] border-[#D2B48C] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#D2B48C]'
              }`}
            >
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <div className="text-center">
                <div className="font-semibold">推荐选择</div>
                <div className="text-sm mt-1">从推荐中选择</div>
              </div>
            </button>
          </div>
        </div>

        {/* 文字描述 */}
        {selectionMethod === 'text' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {isArtworkProduct ? '请描述您宠物的外貌和个性特征' : `请描述您期望的${isArtworkProduct ? '名画风格' : '场景背景'}`}
            </h3>
            <textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder={isArtworkProduct 
                ? '例如：我的猫咪是橘色短毛，性格活泼好动，喜欢晒太阳，眼睛很大很圆，经常做出可爱的表情...'
                : '例如：希望在樱花飞舞的公园里，阳光透过树叶洒下斑驳光影...'}
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              {isArtworkProduct ? '详细的描述有助于艺术顾问为您的宠物匹配最合适的肖像画艺术形象' : '详细的描述有助于画师更好地理解您的需求'}
            </p>
          </div>
        )}

        {/* 图片上传 */}
        {selectionMethod === 'upload' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              上传参考图片
            </h3>
            
            {!uploadedImage ? (
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D2B48C] transition-colors duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  点击或拖拽上传参考图片
                </p>
                <p className="text-sm text-gray-500">
                  支持 JPG、PNG 格式，不超过9MB
                </p>
              </div>
            ) : (
              <div className="relative inline-block">
                <img
                  src={uploadedImage.preview}
                  alt={uploadedImage.name}
                  className="max-w-xs max-h-64 rounded-lg shadow-md"
                />
                <button
                  onClick={removeUploadedImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-2 text-sm text-gray-600">{uploadedImage.name}</p>
              </div>
            )}
          </div>
        )}

        {/* 推荐选择 */}
        {selectionMethod === 'recommendation' && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              选择推荐的{isArtworkProduct ? '名画风格' : '场景背景'}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">浏览全部推荐图片，点击任意一张进行选择</p>

            {/* Mobile: 横向滚动画廊 */}
            <div className="md:hidden overflow-x-auto scrollbar-thin pb-2 -mx-2 px-2">
              <div className="flex items-stretch gap-3">
                {recommendations.map((item, idx) => (
                  <button
                    key={item.id || `${item.name}-${idx}`}
                    onClick={() => setSelectedRecommendation(item)}
                    aria-pressed={selectedRecommendation?.id === item.id}
                    className={`relative flex-shrink-0 rounded-lg overflow-hidden border transition-all duration-200 ${
                      selectedRecommendation?.id === item.id
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
                    {selectedRecommendation?.id === item.id && (
                      <div className="absolute inset-0 bg-[#D2B48C]/20 pointer-events-none" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs px-2 py-1 truncate">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: 瀑布流（masonry）布局，可垂直滚动 */}
            <div className="hidden md:block">
              <div className="max-h-[520px] overflow-y-auto pr-2">
                <div className="columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                  {recommendations.map((item, idx) => (
                    <button
                      key={item.id || `${item.name}-${idx}`}
                      onClick={() => setSelectedRecommendation(item)}
                      aria-pressed={selectedRecommendation?.id === item.id}
                      className={`relative mb-4 w-full break-inside-avoid rounded-lg overflow-hidden border transition-all duration-200 text-left ${
                        selectedRecommendation?.id === item.id
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
                      {selectedRecommendation?.id === item.id && (
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
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            className="px-8 py-3 rounded-full font-semibold text-gray-700 bg-white border-2 border-gray-300 transition-transform duration-300 transform hover:scale-105 hover:border-gray-400"
          >
            上一步
          </button>
          
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-transform duration-300 transform hover:scale-105 ${
              isNextDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#D2B48C] text-white hover:bg-opacity-90'
            }`}
          >
            确认订单
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneArtworkStep;