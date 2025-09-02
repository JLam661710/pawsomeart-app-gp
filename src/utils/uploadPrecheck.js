/**
 * 简化的预上传检查工具
 * 适配火山引擎云函数架构
 */

export const preUploadCheck = async (files) => {
  const fileCount = files.length;
  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  
  // 简化的压缩后大小估算
  const estimatedCompressedSize = totalOriginalSize * 0.6; // 统一40%压缩率
  
  const result = {
    fileCount,
    totalOriginalSize,
    estimatedCompressedSize,
    riskLevel: 'low',
    recommendations: []
  };
  
  // 简化的风险评估（火山引擎支持更大文件）
  if (estimatedCompressedSize > 10 * 1024 * 1024) { // 10MB
    result.riskLevel = 'medium';
    result.recommendations.push('文件较大，建议适当压缩以提高上传速度');
  }
  
  if (fileCount > 10) {
    result.recommendations.push('图片数量较多，上传可能需要更长时间');
  }
  
  return result;
};