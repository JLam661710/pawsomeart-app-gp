/**
 * 图片压缩工具函数
 * 用于在上传前压缩图片以减少文件大小
 */

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度，默认1920
 * @param {number} options.maxHeight - 最大高度，默认1920
 * @param {number} options.quality - 压缩质量，0-1之间，默认0.8
 * @param {number} options.maxSizeKB - 最大文件大小(KB)，默认2048KB
 * @returns {Promise<File>} 压缩后的文件
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.6,
    maxSizeKB = 512
  } = options;

  return new Promise((resolve, reject) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件不是图片格式'));
      return;
    }

    // 如果文件已经很小，直接返回
    if (file.size <= maxSizeKB * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      
      // 按比例缩放
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);

      // 转换为blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('图片压缩失败'));
            return;
          }

          // 如果压缩后仍然太大，降低质量重试
          if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
            const newOptions = { ...options, quality: quality * 0.8 };
            compressImage(file, newOptions).then(resolve).catch(reject);
            return;
          }

          // 创建新的File对象
          const compressedFile = new File(
            [blob],
            file.name,
            {
              type: file.type,
              lastModified: Date.now()
            }
          );

          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 加载图片
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 批量压缩图片
 * @param {File[]} files - 图片文件数组
 * @param {Object} options - 压缩选项
 * @returns {Promise<File[]>} 压缩后的文件数组
 */
export const compressImages = async (files, options = {}) => {
  const compressedFiles = [];
  
  for (const file of files) {
    try {
      const compressedFile = await compressImage(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`压缩图片 ${file.name} 失败:`, error);
      // 如果压缩失败，使用原文件
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
};

/**
 * 获取图片尺寸信息
 * @param {File} file - 图片文件
 * @returns {Promise<{width: number, height: number}>} 图片尺寸
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('无法获取图片尺寸'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};