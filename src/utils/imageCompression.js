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
  
  // 确保压缩后的文件不会超过API限制（9MB）
  const MAX_API_SIZE_KB = 9 * 1024; // 9MB
  const effectiveMaxSize = Math.min(maxSizeKB, MAX_API_SIZE_KB);

  return new Promise((resolve, reject) => {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件不是图片格式'));
      return;
    }

    // 如果文件已经很小，直接返回
    if (file.size <= effectiveMaxSize * 1024) {
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
          if (blob.size > effectiveMaxSize * 1024 && quality > 0.1) {
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

/**
 * 根据文件数量动态调整压缩参数
 * @param {File} file - 原始图片文件
 * @param {number} totalFileCount - 总文件数量
 * @param {Object} options - 额外压缩选项
 */
export const compressImageDynamic = (file, totalFileCount, options = {}) => {
  // 根据文件数量动态调整压缩策略
  let compressionConfig;
  
  if (totalFileCount <= 2) {
    // 1-2张图片：正常压缩
    compressionConfig = {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.7,
      maxSizeKB: 800
    };
  } else if (totalFileCount <= 5) {
    // 3-5张图片：中等压缩
    compressionConfig = {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.6,
      maxSizeKB: 600
    };
  } else {
    // 6张及以上：强力压缩
    compressionConfig = {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.45,
      maxSizeKB: 350
    };
  }
  
  // 合并用户自定义选项
  const finalConfig = { ...compressionConfig, ...options };
  
  return compressImage(file, finalConfig);
};

/**
 * 批量压缩图片（智能版本）
 */
export const compressImagesSmart = async (files, options = {}) => {
  const totalCount = files.length;
  const compressedFiles = [];
  
  console.log(`[Smart Compression] 开始智能压缩 ${totalCount} 张图片`);
  
  for (const file of files) {
    try {
      const compressedFile = await compressImageDynamic(file, totalCount, options);
      compressedFiles.push(compressedFile);
      
      console.log(`[Smart Compression] 压缩完成: ${file.name}`, {
        original: `${(file.size / 1024).toFixed(1)}KB`,
        compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
        ratio: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error(`压缩图片 ${file.name} 失败:`, error);
      compressedFiles.push(file);
    }
  }
  
  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalCompressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0);
  
  console.log(`[Smart Compression] 批量压缩完成`, {
    fileCount: totalCount,
    originalSize: `${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`,
    compressedSize: `${(totalCompressedSize / 1024 / 1024).toFixed(2)}MB`,
    savedSpace: `${((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%`
  });
  
  return compressedFiles;
};