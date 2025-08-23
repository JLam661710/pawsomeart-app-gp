import React from 'react';
import { X, AlertTriangle, RefreshCw, FileX, Wifi, Server } from 'lucide-react';

const ErrorModal = ({ isOpen, onClose, error }) => {
  if (!isOpen || !error) return null;

  const getErrorIcon = (errorType) => {
    switch (errorType) {
      case 'FILE_UPLOAD_ERROR':
      case 'REFERENCE_IMAGE_UPLOAD_ERROR':
      case 'FILE_ERROR':
        return <FileX className="w-8 h-8 text-red-500" />;
      case 'NETWORK_ERROR':
        return <Wifi className="w-8 h-8 text-red-500" />;
      case 'API_ERROR':
        return <Server className="w-8 h-8 text-red-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorTitle = (errorType) => {
    switch (errorType) {
      case 'FILE_UPLOAD_ERROR':
        return '图片上传失败';
      case 'REFERENCE_IMAGE_UPLOAD_ERROR':
        return '参考图片上传失败';
      case 'NETWORK_ERROR':
        return '网络连接异常';
      case 'API_ERROR':
        return '系统服务异常';
      case 'FILE_ERROR':
        return '文件处理失败';
      default:
        return '操作失败';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getErrorIcon(error.type)}
            <h3 className="text-lg font-semibold text-gray-900">
              {getErrorTitle(error.type)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 错误信息 */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {error.message || '操作过程中发生了错误，请重试。'}
            </p>
            
            {/* 文件信息 */}
            {(error.fileName || error.fileSize) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">文件信息：</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {error.fileName && (
                    <div>文件名：{error.fileName}</div>
                  )}
                  {error.fileSize && (
                    <div>文件大小：{error.fileSize}</div>
                  )}
                </div>
              </div>
            )}

            {/* 详细错误信息 */}
            {error.details && (
              <details className="mb-4">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  查看详细错误信息
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                  {error.details}
                </div>
              </details>
            )}
          </div>

          {/* 建议操作 */}
          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                建议解决方案：
              </h4>
              <ul className="space-y-2">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            我知道了
          </button>
          <button
            onClick={() => {
              onClose();
              // 可以在这里添加重试逻辑
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-[#D2B48C] rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新尝试</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;