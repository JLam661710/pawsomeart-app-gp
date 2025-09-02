/**
 * 获取正确的基础路径
 * 在生产环境中确保图片路径正确
 */
export const getBasePath = () => {
  // 检查当前环境
  const isDev = import.meta.env.DEV;
  const baseUrl = import.meta.env.BASE_URL;
  
  // 如果是开发环境，使用默认的BASE_URL
  if (isDev) {
    return baseUrl || '/';
  }
  
  // 生产环境中，确保使用正确的路径
  // 检查当前URL是否包含项目路径
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/pawsomeart-app-gp/')) {
      return '/pawsomeart-app-gp/';
    }
  }
  
  // 回退到配置的BASE_URL或默认值
  return baseUrl || '/pawsomeart-app-gp/';
};

/**
 * 获取图片的完整路径
 * @param {string} imagePath - 相对于pictures目录的图片路径
 * @returns {string} 完整的图片URL
 */
export const getImagePath = (imagePath) => {
  const basePath = getBasePath();
  // 确保路径格式正确
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const cleanBasePath = basePath.endsWith('/') ? basePath : basePath + '/';
  
  return `${cleanBasePath}pictures/${cleanImagePath}`;
};

/**
 * 获取静态资源的完整路径
 * @param {string} assetPath - 相对于public目录的资源路径
 * @returns {string} 完整的资源URL
 */
export const getAssetPath = (assetPath) => {
  const basePath = getBasePath();
  const cleanAssetPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const cleanBasePath = basePath.endsWith('/') ? basePath : basePath + '/';
  
  return `${cleanBasePath}${cleanAssetPath}`;
};