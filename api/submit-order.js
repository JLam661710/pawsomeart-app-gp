import lark from '@larksuiteoapi/node-sdk';
import multiparty from 'multiparty';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Initialize Lark client
const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
});

// --- Helper Functions ---

// 优先使用 multer 解析（内存存储），失败时回退到 multiparty
const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 20 * 1024 * 1024, files: 20 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
    },
});

/**
 * Parses multipart form data from the request.
 * 先尝试 multer，若失败再使用 multiparty（保持兼容 Playwright 测试等场景）。
 */
const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        console.log('[submit-order] parseForm: Starting form parsing...');
        console.log('[submit-order] parseForm: Content-Type:', req.headers['content-type']);
        
        // 我们动态创建一个临时的 express 风格处理器来使用 multer.any()
        upload.any()(req, {}, (multerErr) => {
            if (multerErr) {
                console.log('[submit-order] parseForm: Multer error:', multerErr.message);
            }
            
            if (!multerErr && (req.files || req.body)) {
                try {
                    console.log('[submit-order] parseForm: Using multer parser');
                    console.log('[submit-order] parseForm: req.files count:', (req.files || []).length);
                    console.log('[submit-order] parseForm: req.body keys:', Object.keys(req.body || {}));
                    
                    // 统一输出结构：fields 与 files
                    const fields = req.body || {};
                    // 将 multer 的 req.files 转成与 multiparty 近似的数据结构
                    const mapByField = {};
                    for (const f of req.files || []) {
                        console.log(`[submit-order] parseForm: Processing file - fieldname: ${f.fieldname}, originalname: ${f.originalname}, size: ${f.size}`);
                        if (!mapByField[f.fieldname]) mapByField[f.fieldname] = [];
                        // 将 buffer 写入临时文件，便于后续以流形式上传至飞书
                        const tmpDir = path.join(process.cwd(), 'temp', 'uploads');
                        if (!fs.existsSync(tmpDir)) {
                            fs.mkdirSync(tmpDir, { recursive: true });
                        }
                        const tmpPath = path.join(tmpDir, `.tmp_upload_${Date.now()}_${Math.random().toString(36).slice(2)}`);
                        fs.writeFileSync(tmpPath, f.buffer);
                        mapByField[f.fieldname].push({
                            fieldName: f.fieldname,
                            originalFilename: f.originalname,
                            path: tmpPath,
                            headers: {},
                            size: f.size,
                        });
                    }
                    console.log('[submit-order] parseForm: Multer success - file fields:', Object.keys(mapByField));
                    return resolve({ fields, files: mapByField });
                } catch (e) {
                    console.log('[submit-order] parseForm: Multer processing error:', e.message);
                    // 如果处理中出错，继续退回 multiparty
                }
            }
            
            // fallback multiparty
            console.log('[submit-order] parseForm: Falling back to multiparty parser');
            const form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log('[submit-order] parseForm: Multiparty error:', err.message);
                    return reject(new Error(`Failed to parse form data: ${err.message}`));
                }
                
                console.log('[submit-order] parseForm: Multiparty success - field keys:', Object.keys(fields));
                console.log('[submit-order] parseForm: Multiparty success - file keys:', Object.keys(files));
                
                // Convert array fields to single values
                const singleFields = Object.entries(fields).reduce((acc, [key, value]) => {
                    acc[key] = value[0];
                    return acc;
                }, {});
                resolve({ fields: singleFields, files });
            });
        });
    });
};

/**
 * Safe JSON.parse
 */
const parseJSONSafe = (str) => {
    try { return JSON.parse(str); } catch { return null; }
};

/**
 * Uploads a file to Lark Drive.
 * @param {object} file - The file object from multiparty/multer-adapted.
 * @returns {Promise<string>} - The file token.
 */
const uploadFileToLark = async (file, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
        console.log(`[submit-order] Uploading file: ${file.originalFilename}, size: ${fs.statSync(file.path).size} bytes, attempt: ${retryCount + 1}`);
        
        const fileStream = fs.createReadStream(file.path);
        const stats = fs.statSync(file.path);
        
        // 检查文件大小限制 (20MB)
        if (stats.size > 20 * 1024 * 1024) {
            throw new Error(`File too large: ${stats.size} bytes (max 20MB)`);
        }
        
        const resp = await client.drive.media.uploadAll({
            data: {
                file_name: file.originalFilename,
                parent_type: 'bitable_file',
                parent_node: process.env.FEISHU_APP_TOKEN,
                size: stats.size,
                file: fileStream,
            },
        });
        
        // 兼容不同 SDK 返回结构：可能直接返回 data 对象，或 { data: {...} }
        const fileToken = resp?.data?.file_token || resp?.file_token;
        if (!fileToken) {
            console.error('Lark upload returned no file_token:', resp);
            throw new Error('Lark upload returned no file_token');
        }
        
        console.log(`[submit-order] File uploaded successfully: ${file.originalFilename}, token: ${fileToken}`);
        
        // 上传成功后删除临时文件
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log(`[submit-order] Cleaned up temp file: ${file.path}`);
            }
        } catch (cleanupError) {
            console.warn(`[submit-order] Failed to cleanup temp file ${file.path}:`, cleanupError.message);
        }
        
        return fileToken;
    } catch (error) {
        console.error(`[submit-order] Upload attempt ${retryCount + 1} failed for ${file.originalFilename}:`, {
            message: error?.message,
            code: error?.code || error?.response?.data?.code,
            detail: error?.response?.data || error,
        });
        
        // 如果还有重试次数，则重试
        if (retryCount < maxRetries) {
            console.log(`[submit-order] Retrying upload for ${file.originalFilename} (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // 递增延迟
            return uploadFileToLark(file, retryCount + 1);
        }
        
        // 上传失败时也尝试清理临时文件
        try {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
                console.log(`[submit-order] Cleaned up temp file after error: ${file.path}`);
            }
        } catch (cleanupError) {
            console.warn(`[submit-order] Failed to cleanup temp file after error ${file.path}:`, cleanupError.message);
        }
        
        throw new Error(`Failed to upload file: ${file.originalFilename}`);
    }
};

/**
 * Generates a unique order ID based on the defined format.
 * @param {string} phone - The user's phone number.
 * @returns {string} - The formatted order ID.
 */
const generateOrderId = (phone) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const last4 = (phone || '').slice(-4).padEnd(4, '0');
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PA-${year}${month}${day}-${last4}-${randomChars}`;
};

// Product mapping helpers
const getProductLine = (style) => {
    switch (style) {
        case '经典定制款':
        case '名画致敬款':
            return '全新艺术创作系列';
        case '姿态保留款':
        case '场景复刻款':
            return '参考照片创作系列';
        default:
            return '';
    }
};

const mapBackgroundMethod = (method) => {
    if (method === 'text') return '文字描述';
    if (method === 'upload') return '上传图片';
    if (method === 'recommendation') return '选择推荐背景';
    return '';
};

const mapMasterpieceMethod = (method) => {
    if (method === 'upload') return '上传图片';
    if (method === 'recommendation') return '选择推荐名画';
    if (method === 'text') return '请求客服推荐';
    return '';
};

/**
 * 清理临时文件目录中的旧文件
 */
const cleanupTempFiles = () => {
    try {
        const tempDir = path.join(process.cwd(), 'temp', 'uploads');
        if (!fs.existsSync(tempDir)) return;
        
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        
        files.forEach(file => {
            if (file.startsWith('.tmp_upload_')) {
                const filePath = path.join(tempDir, file);
                try {
                    const stats = fs.statSync(filePath);
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlinkSync(filePath);
                        console.log(`[submit-order] Cleaned up old temp file: ${file}`);
                    }
                } catch (err) {
                    console.warn(`[submit-order] Failed to cleanup old temp file ${file}:`, err.message);
                }
            }
        });
    } catch (error) {
        console.warn('[submit-order] Failed to cleanup temp files:', error.message);
    }
};

/**
 * Creates a record in the specified Feishu Bitable.
 * @param {string} tableId - The ID of the Bitable table.
 * @param {object} recordData - The data for the new record.
 * @returns {Promise<object>} - The API response from Lark.
 */
const createBitableRecord = async (tableId, recordData) => {
    try {
        console.log('[submit-order] createBitableRecord: Starting record creation...');
        console.log('[submit-order] createBitableRecord: app_token:', process.env.FEISHU_APP_TOKEN);
        console.log('[submit-order] createBitableRecord: table_id:', tableId);
        console.log('[submit-order] createBitableRecord: recordData keys:', Object.keys(recordData));
        
        const response = await client.bitable.appTableRecord.create({
            path: {
                app_token: process.env.FEISHU_APP_TOKEN,
                table_id: tableId,
            },
            data: { fields: recordData },
        });
        
        console.log('[submit-order] createBitableRecord: Full response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('[submit-order] createBitableRecord: Error creating record:', error);
        console.error('[submit-order] createBitableRecord: Error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
        throw error;
    }
};

// --- Main Handler ---

async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { fields, files } = await parseForm(req);

        // 增加关键入参与文件计数日志，便于定位“宠物照片为空”的问题
        const uploadCount = Array.isArray(files?.user_uploads) ? files.user_uploads.length : 0;
        const refImageCount = Array.isArray(files?.uploadedImage) ? files.uploadedImage.length : 0;
        console.log('[submit-order] parsed form summary', {
            fieldsKeys: Object.keys(fields || {}),
            uploadCount,
            refImageCount,
            firstUploadNames: (files?.user_uploads || []).slice(0, 3).map(f => f.originalFilename),
            firstRefUploadName: files?.uploadedImage?.[0]?.originalFilename,
        });

        const isMock = process.env.MOCK_FEISHU === '1' || process.env.MOCK_FEISHU === 'true';
        console.log('[submit-order] incoming', {
            mock: isMock,
            hasPhone: Boolean(fields.phone),
            hasStyle: Boolean(fields.customization_style),
        });

        // 从前端抽取关键字段（前置，便于 MOCK 模式下直接返回）
        const customizationStyle = fields.customization_style; // 产品款式中文名
        const phone = fields.phone || '';
        const email = fields.email || '';
        const notes = fields.notes || '';

        // 在 MOCK 模式下，跳过飞书上传与多维表格写入
        if (isMock) {
            if (!customizationStyle || !phone) {
                return res.status(400).json({ success: false, message: '缺少必要字段：customization_style、phone' });
            }
            const orderId = generateOrderId(phone);
            console.log('[submit-order] MOCK success', { orderId });
            return res.status(200).json({
                success: true,
                message: 'Order submitted successfully! [MOCK] ',
                orderId,
                data: { mock: true }
            });
        }

        // 环境变量前置校验，避免上传阶段因缺失而失败
        const appToken = process.env.FEISHU_APP_TOKEN;
        const ordersTableId = process.env.FEISHU_ORDERS_TABLE_ID;
        if (!appToken) {
            return res.status(500).json({ success: false, message: 'Server misconfigured: FEISHU_APP_TOKEN is missing' });
        }
        if (!ordersTableId) {
            return res.status(500).json({ success: false, message: 'Server misconfigured: FEISHU_ORDERS_TABLE_ID is missing' });
        }

        const petCount = fields.petCount ? Number(fields.petCount) : undefined;
        const size = fields.size || '';
        const price = fields.price ? Number(fields.price) : undefined;

        const selectionMethod = fields.selectionMethod || '';
        const textDescription = fields.textDescription || '';
        const selectedRecommendation = fields.selectedRecommendation ? parseJSONSafe(fields.selectedRecommendation) : null;

        // 增强手机号验证 - 支持多地区号码格式
        const validatePhone = (phone) => {
            // 移除所有空格、连字符和括号
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            
            // 基本格式检查: 至少7位数字，最多20位（包含国家代码）
            // 这个宽松的验证可以覆盖大部分合理的电话号码格式
            const basicFormatRegex = /^[\+]?\d{7,20}$/;
            
            // 如果基本格式通过，就认为是有效的
            if (basicFormatRegex.test(cleanPhone)) {
                return true;
            }
            
            // 如果基本格式不通过，再检查具体的地区格式
            // 中国大陆手机号: 1[3-9]xxxxxxxxx (11位)
            const chinaMainlandRegex = /^1[3-9]\d{9}$/;
            
            // 香港手机号: +852 或 852 开头，后跟8位数字
            const hongKongRegex = /^(\+?852)?[5-9]\d{7}$/;
            
            // 澳门手机号: +853 或 853 开头，后跟8位数字
            const macauRegex = /^(\+?853)?6\d{7}$/;
            
            // 台湾手机号: +886 或 886 开头，后跟9位数字
            const taiwanRegex = /^(\+?886)?9\d{8}$/;
            
            // 国际号码格式: +国家代码 + 号码 (最少7位，最多15位)
            const internationalRegex = /^\+\d{7,15}$/;
            
            return chinaMainlandRegex.test(cleanPhone) ||
                   hongKongRegex.test(cleanPhone) ||
                   macauRegex.test(cleanPhone) ||
                   taiwanRegex.test(cleanPhone) ||
                   internationalRegex.test(cleanPhone);
        };
        
        if (!customizationStyle || !phone) {
            return res.status(400).json({ success: false, message: '缺少必要字段：customization_style、phone' });
        }
        if (!validatePhone(phone)) {
            return res.status(400).json({ 
                success: false, 
                message: '手机号格式不正确，请输入有效的手机号码（支持中国大陆、港澳台及国际号码格式）' 
            });
        }

        const isMasterpiece = customizationStyle === '名画致敬款';

        // --- Generate Order ID ---
        const orderId = generateOrderId(phone);

        // --- File Uploads ---
        const petPhotoTokens = [];
        if (files.user_uploads) {
            console.log(`[submit-order] Starting upload of ${files.user_uploads.length} pet photos`);
            // 串行上传文件以避免并发问题
            for (const file of files.user_uploads) {
                try {
                    const token = await uploadFileToLark(file);
                    petPhotoTokens.push({ file_token: token });
                } catch (uploadError) {
                    console.error(`[submit-order] Failed to upload pet photo ${file.originalFilename}:`, uploadError.message);
                    // 返回详细的文件上传错误信息
                    return res.status(400).json({
                        success: false,
                        message: '图片上传失败',
                        error: {
                            type: 'FILE_UPLOAD_ERROR',
                            fileName: file.originalFilename || '未知文件',
                            fileSize: file.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : '未知大小',
                            details: uploadError.message,
                            suggestions: [
                                '请检查图片文件大小是否超过10MB',
                                '请确保图片格式为JPG或PNG',
                                '如果文件过大，请压缩后重试',
                                '检查网络连接是否稳定'
                            ]
                        }
                    });
                }
            }
            console.log(`[submit-order] Successfully uploaded ${petPhotoTokens.length} pet photos`);
        }

        let refImageToken = null; // 背景上传图片 / 名画上传图片
        if (files.uploadedImage && files.uploadedImage[0]) {
            try {
                refImageToken = await uploadFileToLark(files.uploadedImage[0]);
            } catch (uploadError) {
                console.error(`[submit-order] Failed to upload reference image:`, uploadError.message);
                return res.status(400).json({
                    success: false,
                    message: '参考图片上传失败',
                    error: {
                        type: 'REFERENCE_IMAGE_UPLOAD_ERROR',
                        fileName: files.uploadedImage[0].originalFilename || '未知文件',
                        fileSize: files.uploadedImage[0].size ? `${(files.uploadedImage[0].size / 1024 / 1024).toFixed(2)}MB` : '未知大小',
                        details: uploadError.message,
                        suggestions: [
                            '请检查图片文件大小是否超过10MB',
                            '请确保图片格式为JPG或PNG',
                            '如果文件过大，请压缩后重试',
                            '检查网络连接是否稳定'
                        ]
                    }
                });
            }
        }

        // --- Prepare Record Data ---
        const recordData = {
            '订单号': orderId,
            '产品系列': getProductLine(customizationStyle),
            '具体款式': customizationStyle,
            '宠物数量': typeof petCount === 'number' ? petCount : undefined,
            '画像尺寸': size || undefined,
            '预估价格': typeof price === 'number' ? price : undefined,
            '订单状态': '待处理',
            '客户手机号': phone || undefined,
            '客户邮箱': email || undefined,
            '客户备注': notes || undefined,
            '宠物照片': petPhotoTokens.length ? petPhotoTokens : undefined,
        };

        if (isMasterpiece) {
            recordData['名画选择方式'] = mapMasterpieceMethod(selectionMethod) || undefined;
            if (selectionMethod === 'text' && textDescription) {
                recordData['爱宠个性描述'] = textDescription;
            }
            if (selectionMethod === 'upload' && refImageToken) {
                recordData['名画-上传图片'] = [{ file_token: refImageToken }];
            }
            if (selectionMethod === 'recommendation' && selectedRecommendation) {
                // 飞书'文本'字段需要字符串格式
                const linkValue = selectedRecommendation.name || selectedRecommendation.id;
                if (linkValue) {
                    recordData['名画-推荐选择'] = linkValue;
                }
            }
        } else {
            recordData['背景设定方式'] = mapBackgroundMethod(selectionMethod) || undefined;
            if (selectionMethod === 'text' && textDescription) {
                recordData['背景-文字描述'] = textDescription;
            }
            if (selectionMethod === 'upload' && refImageToken) {
                recordData['背景-上传图片'] = [{ file_token: refImageToken }];
            }
            if (selectionMethod === 'recommendation' && selectedRecommendation) {
                // 飞书'文本'字段需要字符串格式
                const linkValue = selectedRecommendation.name || selectedRecommendation.id;
                if (linkValue) {
                    recordData['背景-推荐选择'] = linkValue;
                }
            }
        }

        // Remove null/empty
        Object.keys(recordData).forEach(key => {
            const val = recordData[key];
            if (val === null || val === undefined) delete recordData[key];
            if (Array.isArray(val) && val.length === 0) delete recordData[key];
        });

        // --- Create Bitable Record ---
        console.log('[submit-order] creating bitable record', { orderId });
        const response = await createBitableRecord(ordersTableId, recordData);
        const createdId = response?.data?.record?.record_id || response?.data?.record_id || response?.data?.id || null;
        console.log('[submit-order] bitable record created', { orderId, recordId: createdId });

        res.status(200).json({
            success: true,
            message: 'Order submitted successfully!',
            orderId: orderId,
            data: response.data,
        });

    } catch (error) {
        console.error('Error submitting order:', error);
        
        // 根据错误类型返回不同的错误信息
        let errorResponse = {
            success: false,
            message: '订单提交失败',
            error: {
                type: 'GENERAL_ERROR',
                details: error.message
            }
        };

        // 如果是网络相关错误
        if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
            errorResponse.error.type = 'NETWORK_ERROR';
            errorResponse.message = '网络连接异常';
            errorResponse.error.suggestions = [
                '请检查网络连接是否稳定',
                '稍后重试提交订单',
                '如果问题持续，请联系客服'
            ];
        }
        // 如果是飞书API相关错误
        else if (error.message.includes('lark') || error.message.includes('feishu') || error.message.includes('bitable')) {
            errorResponse.error.type = 'API_ERROR';
            errorResponse.message = '系统服务异常';
            errorResponse.error.suggestions = [
                '系统正在维护中，请稍后重试',
                '如果问题持续，请联系客服'
            ];
        }
        // 如果是文件相关错误
        else if (error.message.includes('file') || error.message.includes('upload')) {
            errorResponse.error.type = 'FILE_ERROR';
            errorResponse.message = '文件处理失败';
            errorResponse.error.suggestions = [
                '请检查上传的图片文件',
                '确保图片格式为JPG或PNG',
                '确保图片大小不超过10MB'
            ];
        }

        res.status(500).json(errorResponse);
    } finally {
        // 清理临时文件
        cleanupTempFiles();
    }
}



export default handler;