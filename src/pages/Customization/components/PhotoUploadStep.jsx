import React, { useState, useRef } from 'react';
import { Upload, X, Camera, AlertCircle, Lightbulb } from 'lucide-react';

const PhotoUploadStep = ({ product, data, onNext, onPrev }) => {
  const [uploadedPhotos, setUploadedPhotos] = useState(data.photos || []);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  // 计算所需照片数量的函数
  const calculateRequiredPhotos = () => {
    if (!product) return 1;
    
    const petCount = data.petCount || 1;
    const productName = product.name;
    
    // 经典定制款和名画致敬款：每只宠物需要3张照片
    if (productName === '经典定制款' || productName === '名画致敬款') {
      return petCount * 3;
    }
    
    // 姿态保留款和场景复刻款：不管几只宠物都只需要1张照片
    if (productName === '姿态保留款' || productName === '场景复刻款') {
      return 1;
    }
    
    return product.photoUploadLimit || 1;
  };
  
  const requiredPhotos = calculateRequiredPhotos();
  const photoUploadLimit = Math.max(requiredPhotos, product?.photoUploadLimit || 10);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null); // Clear error on new drag action
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    e.target.value = ''; // Reset file input
  };

  const handleFiles = (files) => {
    setError(null); // Reset error state

    if (uploadedPhotos.length + files.length > photoUploadLimit) {
      setError(`最多只能上传${photoUploadLimit}张照片。`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      // 1. File Type Validation
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError(`不支持的文件类型: ${file.name}。请上传 JPG 或 PNG 格式的图片。`);
        continue; // Skip this file
      }

      // 2. File Size Validation
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError(`文件大小超过10MB限制: ${file.name}`);
        continue; // Skip this file
      }
      validFiles.push(file);
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        };
        setUploadedPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleNext = () => {
    if (uploadedPhotos.length < requiredPhotos) {
      const productName = product?.name || '当前创作模式';
      setError(`对于${productName}需要您上传 ${requiredPhotos} 张宠物照片才能继续。`);
      return;
    }
    
    setError('');
    onNext({ photos: uploadedPhotos });
  };

  const handlePrev = () => {
    onPrev({ photos: uploadedPhotos });
  };

  const isNextDisabled = uploadedPhotos.length < requiredPhotos;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-song font-bold text-center text-[#D2B48C] mb-8 tracking-song leading-song">
          第二步：上传宠物照片
        </h2>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* 左侧：上传提示 */}
          <div className="w-full md:w-1/2">
            <div className="h-full p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">照片上传建议：</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• 请上传清晰、光线充足的宠物照片</li>
                    <li>• 建议多角度拍摄，包括正面、侧面等</li>
                    <li>• 照片中宠物应占据主要位置</li>
                    <li>• 支持 JPG、PNG 格式，单张不超过10MB</li>
                    {product.series === '参考照片创作系列' ? (
                      <li>• 当前模式仅支持上传一张照片供创作参考，请精选您最心仪的一张宠物美照吧</li>
                    ) : (
                      data.petCount > 1 && (product?.name === '经典定制款' || product?.name === '名画致敬款') ? (
                        <li>• 您选择了{data.petCount}只宠物，需要为每只宠物上传3张照片，总共{requiredPhotos}张</li>
                      ) : (
                        <li>• 我们将根据您上传的 3 张宠物照片，进行对宠物体貌特征的参考创作</li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：引导示意图 */}
          <div className="w-full md:w-1/2">
            <div className="h-full p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">不知道怎么拍？参考一下我们的引导图</p>
                  <div className="mt-2 rounded-lg overflow-hidden border border-green-200">
                    <img src={encodeURI(product.guideImage)} alt="引导示意图" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 拖拽上传区域 */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-[#D2B48C] bg-amber-50'
              : 'border-gray-300 hover:border-[#D2B48C] hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            拖拽照片到此处，或点击选择文件
          </p>
          <p className="text-sm text-gray-500">
            支持多张照片同时上传
          </p>
          <p className="mt-1 text-xs text-blue-600">
            需要上传 {requiredPhotos} 张照片
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* 已上传照片预览 */}
        {uploadedPhotos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              已上传照片 ({uploadedPhotos.length}/{requiredPhotos}张)
            </h3>
            {data.petCount > 1 && (product?.name === '经典定制款' || product?.name === '名画致敬款') ? (
              // 多宠物分组显示
              <div className="space-y-6">
                {Array.from({ length: data.petCount }, (_, petIndex) => {
                  const startIndex = petIndex * 3;
                  const endIndex = startIndex + 3;
                  const petPhotos = uploadedPhotos.slice(startIndex, endIndex);
                  
                  return (
                    <div key={petIndex} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        第{petIndex + 1}只宠物的照片 ({petPhotos.length}/3)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {petPhotos.map((photo, photoIndex) => {
                          return (
                            <div key={photo.id} className="relative group">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={photo.preview}
                                  alt={`第${petIndex + 1}只宠物照片 ${photoIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                onClick={() => removePhoto(photo.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <p className="mt-2 text-xs text-gray-600 truncate">
                                {photo.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // 单宠物或其他模式的普通显示
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={photo.preview}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-2 text-xs text-gray-600 truncate">
                      {photo.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 未上传照片提示 */}
        {uploadedPhotos.length === 0 && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                请至少上传一张宠物照片才能继续
              </p>
            </div>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            上一步
          </button>
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              isNextDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#D2B48C] hover:bg-opacity-90'
            }`}
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadStep;