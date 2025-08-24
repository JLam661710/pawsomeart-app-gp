import React, { useState } from 'react';
import { compressImage } from '../utils/imageCompression';

const CompressionTest = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [compressionStats, setCompressionStats] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalFile(file);
      setCompressedFile(null);
      setCompressionStats(null);
    }
  };

  const testCompression = async (options) => {
    if (!originalFile) return;
    
    setIsCompressing(true);
    try {
      const startTime = Date.now();
      const compressed = await compressImage(originalFile, options);
      const endTime = Date.now();
      
      setCompressedFile(compressed);
      
      const stats = {
        originalSize: originalFile.size,
        compressedSize: compressed.size,
        compressionRatio: ((originalFile.size - compressed.size) / originalFile.size * 100).toFixed(2),
        timeTaken: endTime - startTime,
        options: options
      };
      
      setCompressionStats(stats);
    } catch (error) {
      console.error('压缩失败:', error);
      alert('压缩失败: ' + error.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const compressionPresets = [
    {
      name: '标准压缩 (当前设置)',
      options: { maxWidth: 1920, maxHeight: 1920, quality: 0.8, maxSizeKB: 2048 }
    },
    {
      name: '高压缩 (1MB限制)',
      options: { maxWidth: 1600, maxHeight: 1600, quality: 0.7, maxSizeKB: 1024 }
    },
    {
      name: '极限压缩 (500KB限制)',
      options: { maxWidth: 1200, maxHeight: 1200, quality: 0.6, maxSizeKB: 512 }
    },
    {
      name: '超级压缩 (200KB限制)',
      options: { maxWidth: 800, maxHeight: 800, quality: 0.5, maxSizeKB: 200 }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">图片压缩测试工具</h1>
        
        {/* 文件选择 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">选择测试图片</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {originalFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">原始文件信息:</h3>
              <p>文件名: {originalFile.name}</p>
              <p>文件大小: {formatFileSize(originalFile.size)}</p>
              <p>文件类型: {originalFile.type}</p>
            </div>
          )}
        </div>

        {/* 压缩选项 */}
        {originalFile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">压缩选项测试</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {compressionPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => testCompression(preset.options)}
                  disabled={isCompressing}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  <h3 className="font-medium text-blue-600">{preset.name}</h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>尺寸: {preset.options.maxWidth}x{preset.options.maxHeight}</p>
                    <p>质量: {preset.options.quality}</p>
                    <p>目标大小: {preset.options.maxSizeKB}KB</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 压缩结果 */}
        {compressionStats && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">压缩结果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 统计信息 */}
              <div>
                <h3 className="font-medium mb-3">压缩统计</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>原始大小:</span>
                    <span className="font-medium">{formatFileSize(compressionStats.originalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>压缩后大小:</span>
                    <span className="font-medium text-green-600">{formatFileSize(compressionStats.compressedSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>压缩率:</span>
                    <span className="font-medium text-blue-600">{compressionStats.compressionRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>处理时间:</span>
                    <span className="font-medium">{compressionStats.timeTaken}ms</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <h4 className="font-medium text-sm mb-2">压缩参数:</h4>
                  <div className="text-xs text-gray-600">
                    <p>最大尺寸: {compressionStats.options.maxWidth}x{compressionStats.options.maxHeight}</p>
                    <p>质量: {compressionStats.options.quality}</p>
                    <p>目标大小: {compressionStats.options.maxSizeKB}KB</p>
                  </div>
                </div>
              </div>
              
              {/* 预览对比 */}
              <div>
                <h3 className="font-medium mb-3">效果预览</h3>
                {compressedFile && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">压缩后图片:</p>
                      <img
                        src={URL.createObjectURL(compressedFile)}
                        alt="压缩后"
                        className="max-w-full h-auto rounded border"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <a
                        href={URL.createObjectURL(compressedFile)}
                        download={`compressed_${originalFile.name}`}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        下载压缩图片
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isCompressing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>正在压缩图片...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompressionTest;