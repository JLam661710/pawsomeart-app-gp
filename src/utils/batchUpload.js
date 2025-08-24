// 分批上传工具函数

/**
 * 生成批次ID
 */
export const generateBatchId = () => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 计算文件总大小
 * @param {File[]} files - 文件数组
 * @returns {number} 总大小（字节）
 */
export const calculateTotalSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
};

/**
 * 判断是否需要使用分批上传
 * @param {File[]} files - 文件数组
 * @returns {boolean} 是否需要分批上传
 */
export const shouldUseBatchUpload = (files) => {
    const totalSize = calculateTotalSize(files);
    const fileCount = files.length;
    
    // 判断条件：
    // 1. 文件总大小超过 15MB
    // 2. 文件数量超过 10 个
    // 3. 单个文件超过 8MB
    const SIZE_THRESHOLD = 15 * 1024 * 1024; // 15MB
    const COUNT_THRESHOLD = 10;
    const SINGLE_FILE_THRESHOLD = 8 * 1024 * 1024; // 8MB
    
    if (totalSize > SIZE_THRESHOLD) {
        console.log('[batchUpload] 触发分批上传：总大小超过阈值', {
            totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
            threshold: `${(SIZE_THRESHOLD / 1024 / 1024).toFixed(2)}MB`
        });
        return true;
    }
    
    if (fileCount > COUNT_THRESHOLD) {
        console.log('[batchUpload] 触发分批上传：文件数量超过阈值', {
            fileCount,
            threshold: COUNT_THRESHOLD
        });
        return true;
    }
    
    const hasLargeFile = files.some(file => file.size > SINGLE_FILE_THRESHOLD);
    if (hasLargeFile) {
        console.log('[batchUpload] 触发分批上传：存在大文件', {
            largeFiles: files.filter(f => f.size > SINGLE_FILE_THRESHOLD).map(f => ({
                name: f.name,
                size: `${(f.size / 1024 / 1024).toFixed(2)}MB`
            }))
        });
        return true;
    }
    
    return false;
};

/**
 * 将文件分组为批次
 * @param {File[]} files - 文件数组
 * @returns {File[][]} 分组后的文件批次数组
 */
export const groupFilesIntoBatches = (files) => {
    const batches = [];
    let currentBatch = [];
    let currentBatchSize = 0;
    
    const MAX_BATCH_SIZE = 8 * 1024 * 1024; // 8MB per batch
    const MAX_BATCH_FILES = 4; // 每批最多4个文件
    
    for (const file of files) {
        // 如果单个文件就超过批次大小限制，单独成为一个批次
        if (file.size > MAX_BATCH_SIZE) {
            // 先处理当前批次
            if (currentBatch.length > 0) {
                batches.push([...currentBatch]);
                currentBatch = [];
                currentBatchSize = 0;
            }
            // 大文件单独成批
            batches.push([file]);
            continue;
        }
        
        // 检查是否可以加入当前批次
        const wouldExceedSize = currentBatchSize + file.size > MAX_BATCH_SIZE;
        const wouldExceedCount = currentBatch.length >= MAX_BATCH_FILES;
        
        if (wouldExceedSize || wouldExceedCount) {
            // 当前批次已满，开始新批次
            if (currentBatch.length > 0) {
                batches.push([...currentBatch]);
            }
            currentBatch = [file];
            currentBatchSize = file.size;
        } else {
            // 加入当前批次
            currentBatch.push(file);
            currentBatchSize += file.size;
        }
    }
    
    // 处理最后一个批次
    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }
    
    console.log('[batchUpload] 文件分组完成:', {
        totalFiles: files.length,
        totalBatches: batches.length,
        batchSizes: batches.map((batch, index) => ({
            batch: index + 1,
            files: batch.length,
            size: `${(calculateTotalSize(batch) / 1024 / 1024).toFixed(2)}MB`
        }))
    });
    
    return batches;
};

/**
 * 上传单个批次
 * @param {File[]} batchFiles - 批次文件
 * @param {string} batchId - 批次ID
 * @param {number} batchIndex - 批次索引（从1开始）
 * @param {number} totalBatches - 总批次数
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} 上传结果
 */
export const uploadBatch = async (batchFiles, batchId, batchIndex, totalBatches, onProgress) => {
    try {
        console.log(`[batchUpload] 开始上传批次 ${batchIndex}/${totalBatches}:`, {
            batchId,
            filesCount: batchFiles.length,
            totalSize: `${(calculateTotalSize(batchFiles) / 1024 / 1024).toFixed(2)}MB`
        });
        
        // 创建 FormData
        const formData = new FormData();
        formData.append('batchId', batchId);
        formData.append('batchIndex', batchIndex.toString());
        formData.append('totalBatches', totalBatches.toString());
        
        // 添加文件到 FormData
        batchFiles.forEach((file, index) => {
            formData.append('user_uploads', file);
        });
        
        // 发送请求
        const response = await fetch('/api/upload-batch', {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || `批次 ${batchIndex} 上传失败`);
        }
        
        console.log(`[batchUpload] 批次 ${batchIndex}/${totalBatches} 上传成功:`, {
            batchId: result.batchId,
            uploadedCount: result.uploadedCount
        });
        
        // 调用进度回调
        if (onProgress) {
            onProgress({
                batchIndex,
                totalBatches,
                completedBatches: batchIndex,
                currentBatchProgress: 100,
                overallProgress: Math.round((batchIndex / totalBatches) * 100)
            });
        }
        
        return result;
        
    } catch (error) {
        console.error(`[batchUpload] 批次 ${batchIndex}/${totalBatches} 上传失败:`, error);
        throw error;
    }
};

/**
 * 执行分批上传
 * @param {File[]} userUploads - 用户上传的文件
 * @param {File[]} referenceImages - 参考图片
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} 上传结果
 */
export const executeBatchUpload = async (userUploads = [], referenceImages = [], onProgress) => {
    try {
        const batchId = generateBatchId();
        const allFiles = [...userUploads, ...referenceImages];
        
        if (allFiles.length === 0) {
            throw new Error('没有文件需要上传');
        }
        
        console.log('[batchUpload] 开始分批上传:', {
            batchId,
            userUploadsCount: userUploads.length,
            referenceImagesCount: referenceImages.length,
            totalFiles: allFiles.length
        });
        
        // 分组文件
        const batches = groupFilesIntoBatches(allFiles);
        const totalBatches = batches.length;
        
        // 初始化进度
        if (onProgress) {
            onProgress({
                batchIndex: 0,
                totalBatches,
                completedBatches: 0,
                currentBatchProgress: 0,
                overallProgress: 0
            });
        }
        
        // 逐批上传
        const batchResults = [];
        for (let i = 0; i < batches.length; i++) {
            const batchIndex = i + 1;
            const batchFiles = batches[i];
            
            const result = await uploadBatch(
                batchFiles,
                batchId,
                batchIndex,
                totalBatches,
                onProgress
            );
            
            batchResults.push(result);
        }
        
        // 整理所有文件tokens
        const allUserUploads = [];
        const allReferenceImages = [];
        
        batchResults.forEach(result => {
            if (result.fileTokens) {
                if (result.fileTokens.user_uploads) {
                    allUserUploads.push(...result.fileTokens.user_uploads);
                }
                if (result.fileTokens.uploadedImage) {
                    allReferenceImages.push(...result.fileTokens.uploadedImage);
                }
            }
        });
        
        console.log('[batchUpload] 分批上传完成:', {
            batchId,
            totalBatches,
            userUploadsCount: allUserUploads.length,
            referenceImagesCount: allReferenceImages.length
        });
        
        return {
            success: true,
            batchId,
            userUploads: allUserUploads,
            referenceImages: allReferenceImages,
            totalBatches,
            batchResults
        };
        
    } catch (error) {
        console.error('[batchUpload] 分批上传失败:', error);
        throw error;
    }
};

/**
 * 提交分批上传的订单
 * @param {string} batchId - 批次ID
 * @param {Array} userUploads - 用户上传文件tokens
 * @param {Array} referenceImages - 参考图片tokens
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} 提交结果
 */
export const submitBatchOrder = async (batchId, userUploads, referenceImages, orderData) => {
    try {
        console.log('[batchUpload] 提交分批订单:', {
            batchId,
            userUploadsCount: userUploads.length,
            referenceImagesCount: referenceImages.length
        });
        
        const response = await fetch('/api/submit-order-batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                batchId,
                userUploads,
                referenceImages,
                orderData
            }),
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || '订单提交失败');
        }
        
        console.log('[batchUpload] 分批订单提交成功:', {
            orderId: result.orderId,
            batchId: result.batchId
        });
        
        return result;
        
    } catch (error) {
        console.error('[batchUpload] 分批订单提交失败:', error);
        throw error;
    }
};

/**
 * 传统上传方式（降级方案）
 * @param {FormData} formData - 表单数据
 * @returns {Promise<Object>} 上传结果
 */
export const traditionalUpload = async (finalData, product, onProgress) => {
    try {
        console.log('[batchUpload] 使用传统上传方式');
        
        // 构建 FormData
        const formData = new FormData();
        
        // 添加用户上传的照片
        if (finalData.photos && finalData.photos.length > 0) {
            finalData.photos.forEach((photo, index) => {
                if (photo.file instanceof File) {
                    formData.append('user_uploads', photo.file);
                    console.log(`[batchUpload] 添加用户照片 ${index}:`, photo.file.name);
                }
            });
        }
        
        // 添加联系信息
        if (finalData.contactInfo?.phone) {
            formData.append('phone', finalData.contactInfo.phone);
        }
        if (finalData.contactInfo?.email) {
            formData.append('email', finalData.contactInfo.email);
        }
        if (finalData.contactInfo?.notes) {
            formData.append('notes', finalData.contactInfo.notes);
        }
        
        // 添加参考图
        if (finalData.uploadedImage) {
            if (finalData.uploadedImage instanceof File) {
                formData.append('uploadedImage', finalData.uploadedImage);
            } else if (finalData.uploadedImage.file instanceof File) {
                formData.append('uploadedImage', finalData.uploadedImage.file);
            }
        }
        
        // 添加其他定制化数据
        formData.append('customization_style', product.name);
        formData.append('petCount', finalData.petCount);
        formData.append('size', finalData.size);
        formData.append('price', finalData.price);
        formData.append('selectionMethod', finalData.selectionMethod);
        formData.append('textDescription', finalData.textDescription || '');
        formData.append('selectedRecommendation', JSON.stringify(finalData.selectedRecommendation || null));
        
        // 更新进度
        if (onProgress) onProgress(25);
        
        const response = await fetch('/api/submit-order', {
            method: 'POST',
            body: formData,
        });
        
        // 更新进度
        if (onProgress) onProgress(75);
        
        if (!response.ok) {
            // 处理非200状态码
            let errorMessage;
            if (response.status === 500) {
                errorMessage = '服务器错误 (500): server error';
            } else {
                try {
                    const result = await response.json();
                    errorMessage = result.message || `请求失败 (${response.status})`;
                } catch {
                    errorMessage = `请求失败 (${response.status})`;
                }
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '传统上传失败');
        }
        
        // 完成进度
        if (onProgress) onProgress(100);
        
        console.log('[batchUpload] 传统上传成功:', {
            orderId: result.orderId
        });
        
        return result;
        
    } catch (error) {
        console.error('[batchUpload] 传统上传失败:', error);
        throw error;
    }
};

/**
 * 传统上传方式（兼容旧版本）
 * @param {FormData} formData - 表单数据
 * @returns {Promise<Object>} 上传结果
 */
export const traditionalUploadLegacy = async (formData) => {
    try {
        console.log('[batchUpload] 使用传统上传方式（兼容版本）');
        
        const response = await fetch('/api/submit-order', {
            method: 'POST',
            body: formData,
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.message || '传统上传失败');
        }
        
        console.log('[batchUpload] 传统上传成功:', {
            orderId: result.orderId
        });
        
        return result;
        
    } catch (error) {
        console.error('[batchUpload] 传统上传失败:', error);
        throw error;
    }
};