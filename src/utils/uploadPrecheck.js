/**
 * 预上传检查工具
 */
// 添加缺失的导入
import { shouldUseBatchUpload } from './batchUpload.js';

export const preUploadCheck = async (files) => {
  const fileCount = files.length;
  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  
  // 模拟压缩后的大小估算
  let estimatedCompressedSize = 0;
  
  if (fileCount <= 2) {
    // 1-2张：压缩率约30%
    estimatedCompressedSize = totalOriginalSize * 0.7;
  } else if (fileCount <= 5) {
    // 3-5张：压缩率约50%
    estimatedCompressedSize = totalOriginalSize * 0.5;
  } else {
    // 6张及以上：压缩率约70%
    estimatedCompressedSize = totalOriginalSize * 0.3;
  }
  
  const VERCEL_LIMIT = 4.5 * 1024 * 1024; // 4.5MB
  const SAFE_THRESHOLD = 3.5 * 1024 * 1024; // 3.5MB安全阈值
  
  const result = {
    fileCount,
    totalOriginalSize,
    estimatedCompressedSize,
    willUseBatchUpload: shouldUseBatchUpload(files),
    riskLevel: 'low',
    recommendations: []
  };
  
  if (estimatedCompressedSize > VERCEL_LIMIT) {
    result.riskLevel = 'high';
    result.recommendations.push('文件总大小可能超过限制，将自动使用分批上传');
  } else if (estimatedCompressedSize > SAFE_THRESHOLD) {
    result.riskLevel = 'medium';
    result.recommendations.push('文件大小接近限制，建议进一步压缩');
  }
  
  if (fileCount >= 6) {
    result.recommendations.push('图片数量较多，将使用强力压缩和分批上传确保成功');
  }
  
  return result;
};