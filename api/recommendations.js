import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// In-memory cache to avoid repeated disk reads
let cache = {
  scenes: null,
  artworks: null,
  mtime: 0,
};

// 使用基于当前文件位置的绝对路径，避免 process.cwd() 引起的不稳定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SCENES_DIR = path.join(ROOT_DIR, 'public', 'pictures', 'ArtworkToBeBackgroundRecommended');
const ARTWORKS_DIR = path.join(ROOT_DIR, 'public', 'pictures', 'FamousArtPortraitsRecommended');

function safeReadDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg']);
    return entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => !name.startsWith('.') && !name.startsWith('._'))
      .filter((name) => allowed.has(path.extname(name).toLowerCase()));
  } catch {
    return null;
  }
}

function buildItemsFromDir(dir, basePublicPath) {
  const files = safeReadDir(dir) || [];
  return files.map((file, idx) => {
    const displayName = path.basename(file, path.extname(file));
    return {
      id: idx + 1,
      name: displayName,
      image: `${basePublicPath}/${file}`,
      description: '',
    };
  });
}

function getAllScenes() {
  if (!cache.scenes) {
    cache.scenes = buildItemsFromDir(SCENES_DIR, '/pictures/ArtworkToBeBackgroundRecommended');
  }
  return cache.scenes;
}

function getAllArtworks() {
  if (!cache.artworks) {
    cache.artworks = buildItemsFromDir(ARTWORKS_DIR, '/pictures/FamousArtPortraitsRecommended');
  }
  return cache.artworks;
}

function handler(req, res) {
  const { type } = req.query;

  // Prefer dynamic directory reading to include ALL images in folders
  if (type === 'artworks') {
    const items = getAllArtworks();
    if (items && items.length) {
      return res.status(200).json(items);
    }
  } else if (type === 'scenes') {
    const items = getAllScenes();
    if (items && items.length) {
      return res.status(200).json(items);
    }
  }

  // Fallback to previous static lists if directory read fails
  const RECOMMENDED_SCENES = {
    1: [
      { id: 1, name: 'A-ColorfulExpressionism-1', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-1.png', description: '色彩鲜艳的表达主义风格' },
      { id: 2, name: 'A-ColorfulExpressionism-2', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-2.jpeg', description: '色彩鲜艳的表达主义风格' },
      { id: 3, name: 'A-ColorfulExpressionism-3', image: '/pictures/ArtworkToBeBackgroundRecommended/A-ColorfulExpressionism-3.png', description: '色彩鲜艳的表达主义风格' },
      { id: 4, name: 'B-ModernPaintingsWithSharpColorsAndBrushes-1', image: '/pictures/ArtworkToBeBackgroundRecommended/B-ModernPaintingsWithSharpColorsAndBrushes-1.jpeg', description: '色彩和笔触鲜明的现代画作' },
      { id: 5, name: 'C-SmoothAndEye-catchingDecorativeImages-1', image: '/pictures/ArtworkToBeBackgroundRecommended/C-SmoothAndEye-catchingDecorativeImages-1.png', description: '平滑且引人注目的装饰性图像' },
      { id: 6, name: 'D-ImpressionistLandscape-1', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-1.jpg', description: '印象派风景画' }
    ],
    3: [
      { id: 1, name: 'D-ImpressionistLandscape-2', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-2.jpg', description: '印象派风景画' },
      { id: 2, name: 'D-ImpressionistLandscape-3', image: '/pictures/ArtworkToBeBackgroundRecommended/D-ImpressionistLandscape-3.png', description: '印象派风景画' },
      { id: 3, name: 'E-PointillismBrushstrokeAndColor-1', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-1.jpg', description: '点画派的笔触和色彩' },
      { id: 4, name: 'E-PointillismBrushstrokeAndColor-2', image: '/pictures/ArtworkToBeBackgroundRecommended/E-PointillismBrushstrokeAndColor-2.png', description: '点画派的笔触和色彩' },
      { id: 5, name: 'F-ThePurpleImpression-1', image: '/pictures/ArtworkToBeBackgroundRecommended/F-ThePurpleImpression-1.png', description: '紫色印象' },
      { id: 6, name: 'G-TheImpressionOfAVastAndShallowPlace-1', image: '/pictures/ArtworkToBeBackgroundRecommended/G-TheImpressionOfAVastAndShallowPlace-1.png', description: '广阔而浅薄地方的印象' }
    ]
  };

  const RECOMMENDED_ARTWORKS = [
    { id: 1, name: 'Berthe Morisot with a Bouquet of Violets-Édouard Manet', artist: 'Édouard Manet', image: '/pictures/FamousArtPortraitsRecommended/Berthe Morisot with a Bouquet of Violets-Édouard Manet.png', description: '手持紫罗兰花束的贝尔特·莫里索' },
    { id: 2, name: 'Girl with a Pearl Earring-Johannes Vermeer', artist: 'Johannes Vermeer', image: '/pictures/FamousArtPortraitsRecommended/Girl with a Pearl Earring-Johannes Vermeer.png', description: '戴珍珠耳环的少女' },
    { id: 3, name: 'La Primevere et La Plume-Alphonse Mucha', artist: 'Alphonse Mucha', image: '/pictures/FamousArtPortraitsRecommended/La Primevere et La Plume-Alphonse Mucha.png', description: '报春花与羽毛' },
    { id: 4, name: 'Lady with an Ermine-Leonardo da Vinci', artist: 'Leonardo da Vinci', image: '/pictures/FamousArtPortraitsRecommended/Lady with an Ermine-Leonardo da Vinci.png', description: '抱银鼠的女子' },
    { id: 5, name: 'Marchesa Brigida Spinola Doria-Peter Paul Rubens', artist: 'Peter Paul Rubens', image: '/pictures/FamousArtPortraitsRecommended/Marchesa Brigida Spinola Doria-Peter Paul Rubens.png', description: '玛尔切萨·布里吉达·斯皮诺拉·多里亚' },
    { id: 6, name: 'Portrait Fritz Ridler-Klimt Gustav', artist: 'Klimt Gustav', image: '/pictures/FamousArtPortraitsRecommended/Portrait Fritz Ridler-Klimt Gustav.png', description: '弗里茨·里德勒肖像' }
  ];

  if (type === 'artworks') {
    return res.status(200).json(RECOMMENDED_ARTWORKS);
  } else if (type === 'scenes') {
    const productId = req.query.productId;
    const scenes = RECOMMENDED_SCENES[productId] || [];
    return res.status(200).json(scenes);
  }

  return res.status(400).json({ message: 'Invalid recommendation type' });
}

export default handler;