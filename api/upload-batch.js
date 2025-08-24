import lark from '@larksuiteoapi/node-sdk';
import multiparty from 'multiparty';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// 初始化飞书客户端
const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
});

// 配置 multer 用于内存存储
const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024, files: 5 }, // 单批次限制：10MB，5个文件
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只支持图片文件格式 (JPEG, PNG, GIF, WebP)'));
        }
    },
});

// 解析表单数据（复用原有逻辑）
const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        // 首先尝试使用 multer
        upload.any()(req, {}, (multerErr) => {
            if (!multerErr && req.files && req.files.length > 0) {
                // multer 成功解析
                const files = {};
                const fields = req.body || {};
                
                req.files.forEach(file => {
                    if (!files[file.fieldname]) {
                        files[file.fieldname] = [];
                    }
                    files[file.fieldname].push({
                        originalFilename: file.originalname,
                        mimetype: file.mimetype,
                        buffer: file.buffer,
                        size: file.size
                    });
                });
                
                return resolve({ fields, files });
            }
            
            // multer 失败，回退到 multiparty
            const form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }
                
                // 处理 multiparty 的字段格式
                const processedFields = {};
                Object.keys(fields).forEach(key => {
                    processedFields[key] = Array.isArray(fields[key]) ? fields[key][0] : fields[key];
                });
                
                // 处理文件，将其转换为 buffer
                const processedFiles = {};
                Object.keys(files).forEach(key => {
                    processedFiles[key] = files[key].map(file => {
                        const buffer = fs.readFileSync(file.path);
                        // 清理临时文件
                        fs.unlinkSync(file.path);
                        return {
                            originalFilename: file.originalFilename,
                            mimetype: file.headers['content-type'],
                            buffer: buffer,
                            size: file.size
                        };
                    });
                });
                
                resolve({ fields: processedFields, files: processedFiles });
            });
        });
    });
};

// 上传文件到飞书（复用原有逻辑）
const uploadFileToLark = async (file, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // 指数退避
    
    try {
        console.log(`[upload-batch] 开始上传文件: ${file.originalFilename}, 大小: ${file.size} bytes`);
        
        const response = await client.drive.media.uploadAll({
            data: {
                file_name: file.originalFilename,
                parent_type: 'bitable_image',
                parent_node: process.env.FEISHU_APP_TOKEN,
                size: file.size,
                file: file.buffer,
            },
        });
        
        if (response.code === 0 && response.data && response.data.file_token) {
            console.log(`[upload-batch] 文件上传成功: ${file.originalFilename}, token: ${response.data.file_token}`);
            return {
                success: true,
                fileToken: response.data.file_token,
                fileName: file.originalFilename,
                fileSize: file.size
            };
        } else {
            throw new Error(`飞书上传失败: ${response.msg || '未知错误'}`);
        }
    } catch (error) {
        console.error(`[upload-batch] 文件上传失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, {
            fileName: file.originalFilename,
            error: error.message
        });
        
        if (retryCount < maxRetries) {
            console.log(`[upload-batch] ${retryDelay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return uploadFileToLark(file, retryCount + 1);
        } else {
            return {
                success: false,
                error: error.message,
                fileName: file.originalFilename,
                fileSize: file.size
            };
        }
    }
};

// 生成批次ID
const generateBatchId = () => {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 主处理函数
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { fields, files } = await parseForm(req);
        
        // 验证必要参数
        const batchId = fields.batchId || generateBatchId();
        const batchIndex = parseInt(fields.batchIndex) || 1;
        const totalBatches = parseInt(fields.totalBatches) || 1;
        
        console.log('[upload-batch] 接收到分批上传请求:', {
            batchId,
            batchIndex,
            totalBatches,
            filesCount: Object.keys(files).reduce((total, key) => total + (files[key]?.length || 0), 0)
        });
        
        // 检查是否有文件
        const allFiles = [];
        Object.keys(files).forEach(key => {
            if (files[key] && Array.isArray(files[key])) {
                files[key].forEach(file => {
                    allFiles.push({ ...file, fieldName: key });
                });
            }
        });
        
        if (allFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有检测到文件',
                batchId
            });
        }
        
        // 验证文件大小和数量
        const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 10 * 1024 * 1024) { // 10MB
            return res.status(400).json({
                success: false,
                message: '单批次文件总大小不能超过10MB',
                batchId,
                totalSize
            });
        }
        
        if (allFiles.length > 5) {
            return res.status(400).json({
                success: false,
                message: '单批次文件数量不能超过5个',
                batchId,
                filesCount: allFiles.length
            });
        }
        
        // 并发上传文件到飞书
        const uploadPromises = allFiles.map(file => uploadFileToLark(file));
        const uploadResults = await Promise.all(uploadPromises);
        
        // 分析上传结果
        const successResults = uploadResults.filter(result => result.success);
        const failedResults = uploadResults.filter(result => !result.success);
        
        if (failedResults.length > 0) {
            console.error('[upload-batch] 部分文件上传失败:', failedResults);
            return res.status(500).json({
                success: false,
                message: `${failedResults.length} 个文件上传失败`,
                batchId,
                failedFiles: failedResults.map(r => ({ fileName: r.fileName, error: r.error })),
                successCount: successResults.length,
                failedCount: failedResults.length
            });
        }
        
        // 构建返回结果
        const fileTokens = {};
        successResults.forEach((result, index) => {
            const fieldName = allFiles[index].fieldName;
            if (!fileTokens[fieldName]) {
                fileTokens[fieldName] = [];
            }
            fileTokens[fieldName].push({
                fileToken: result.fileToken,
                fileName: result.fileName,
                fileSize: result.fileSize
            });
        });
        
        console.log('[upload-batch] 批次上传成功:', {
            batchId,
            batchIndex,
            totalBatches,
            uploadedCount: successResults.length
        });
        
        return res.status(200).json({
            success: true,
            message: `批次 ${batchIndex}/${totalBatches} 上传成功`,
            batchId,
            batchIndex,
            totalBatches,
            fileTokens,
            uploadedCount: successResults.length,
            totalSize
        });
        
    } catch (error) {
        console.error('[upload-batch] 处理请求时发生错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
}

export default handler;