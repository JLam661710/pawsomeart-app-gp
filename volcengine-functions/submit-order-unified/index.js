const lark = require('@larksuiteoapi/node-sdk');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');

// 初始化飞书客户端
const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
});

// --- 工具函数 ---

/**
 * 安全解析JSON字符串
 */
const parseJSONSafe = (str) => {
    try { return JSON.parse(str); } catch { return null; }
};

/**
 * 上传文件到飞书
 */
const uploadFileToLark = async (file, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000 * Math.pow(2, retryCount); // 指数退避
    
    try {
        console.log(`[uploadFileToLark] 开始上传文件: ${file.originalFilename}, 大小: ${file.size} bytes, 重试次数: ${retryCount}`);
        
        // 创建文件流
        const fileStream = fs.createReadStream(file.path);
        
        // 使用简单的uploadAll方法
        const uploadResponse = await client.drive.media.uploadAll({
            data: {
                file_name: file.originalFilename,
                parent_type: 'bitable_image',
                parent_node: process.env.FEISHU_APP_TOKEN,
                size: file.size,
                file: fileStream,
            },
        });
        
        console.log(`[uploadFileToLark] 上传响应:`, uploadResponse);
        
        // 检查响应格式 - 飞书SDK可能直接返回data部分
        const fileToken = uploadResponse?.file_token || uploadResponse?.data?.file_token;
        
        if (!fileToken) {
            throw new Error(`文件上传失败: ${uploadResponse?.msg || uploadResponse?.message || '未知错误'}`);
        }
        
        console.log(`[uploadFileToLark] 文件上传成功: ${file.originalFilename}, token: ${fileToken}`);
        return fileToken;
        
    } catch (error) {
        console.error(`[uploadFileToLark] 文件上传失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error.message);
        
        if (retryCount < maxRetries) {
            console.log(`[uploadFileToLark] ${retryDelay}ms 后重试...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return uploadFileToLark(file, retryCount + 1);
        }
        
        throw new Error(`文件上传失败: ${file.originalFilename} - ${error.message}`);
    }
};

/**
 * 生成订单号
 */
const generateOrderId = (phone) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const phoneLastFour = phone.slice(-4).padStart(4, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PA-${year}${month}${day}-${hour}${minute}-${phoneLastFour}${randomSuffix}`;
};

/**
 * 获取产品系列
 */
const getProductLine = (style) => {
    if (!style) return '未知系列';
    if (style.includes('经典定制款')) return '全新艺术创作系列';
    if (style.includes('名画致敬款')) return '全新艺术创作系列';
    if (style.includes('节日主题款')) return '节日主题系列';
    if (style.includes('卡通风格款')) return '卡通风格系列';
    return '全新艺术创作系列';
};

/**
 * 映射背景设定方式
 */
const mapBackgroundMethod = (method) => {
    const mapping = { 'text': '文字描述', 'upload': '上传图片', 'recommendation': '推荐图库' };
    return mapping[method] || method;
};

/**
 * 映射名画选择方式
 */
const mapMasterpieceMethod = (method) => {
    const mapping = { 'text': '个性描述', 'upload': '上传图片', 'recommendation': '推荐图库' };
    return mapping[method] || method;
};

/**
 * 清理临时文件
 */
const cleanupTempFiles = () => {
    try {
        const tempDir = '/tmp';
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            files.forEach(file => {
                if (file.startsWith('.tmp_upload_')) {
                    const filePath = path.join(tempDir, file);
                    try {
                        fs.unlinkSync(filePath);
                        console.log(`[cleanupTempFiles] 已删除临时文件: ${filePath}`);
                    } catch (err) {
                        console.warn(`[cleanupTempFiles] 删除临时文件失败: ${filePath}`, err.message);
                    }
                }
            });
        }
    } catch (error) {
        console.warn('[cleanupTempFiles] 清理临时文件时出错:', error.message);
    }
};

/**
 * 创建飞书多维表格记录
 */
const createBitableRecord = async (tableId, recordData) => {
    try {
        console.log('[createBitableRecord] 创建记录:', { tableId, recordKeys: Object.keys(recordData) });
        
        const response = await client.bitable.appTableRecord.create({
            path: {
                app_token: process.env.FEISHU_APP_TOKEN,
                table_id: tableId,
            },
            data: {
                fields: recordData,
            },
        });
        
        console.log('[createBitableRecord] 记录创建成功:', response.data?.record?.record_id);
        return response;
        
    } catch (error) {
        console.error('[createBitableRecord] 创建记录失败:', error.message);
        throw error;
    }
};

/**
 * 解析multipart/form-data
 */
const parseFormData = (event) => {
    return new Promise((resolve, reject) => {
        console.log('[parseFormData] 开始解析表单数据');
        console.log('[parseFormData] Event结构:', {
            hasBody: !!event.body,
            bodyType: typeof event.body,
            isBase64: event.isBase64Encoded,
            headers: Object.keys(event.headers || {})
        });
        
        // 火山引擎函数服务的event结构
        const body = event.body;
        const headers = event.headers || {};
        const contentType = headers['content-type'] || headers['Content-Type'] || '';
        
        console.log('[parseFormData] Content-Type:', contentType);
        
        // 支持JSON格式的数据
        if (contentType.includes('application/json')) {
            try {
                const jsonData = typeof body === 'string' ? JSON.parse(body) : body;
                console.log('[parseFormData] JSON格式解析成功');
                return resolve({ fields: jsonData, files: {} });
            } catch (error) {
                console.error('[parseFormData] JSON解析失败:', error.message);
                return reject(new Error(`JSON数据解析失败: ${error.message}`));
            }
        }
        
        // 支持multipart/form-data格式
        if (!contentType.includes('multipart/form-data')) {
            console.error('[parseFormData] 不支持的Content-Type:', contentType);
            return reject(new Error(`不支持的Content-Type: ${contentType}，需要application/json或multipart/form-data`));
        }
        
        if (!body) {
            console.error('[parseFormData] 请求体为空');
            return reject(new Error('请求体为空'));
        }
        
        // 创建临时文件来模拟请求
        const tempFilePath = `/tmp/request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.tmp`;
        
        try {
            // 处理body数据
            let bodyBuffer;
            if (event.isBase64Encoded) {
                console.log('[parseFormData] 解码Base64数据');
                bodyBuffer = Buffer.from(body, 'base64');
            } else if (Buffer.isBuffer(body)) {
                bodyBuffer = body;
            } else if (typeof body === 'string') {
                bodyBuffer = Buffer.from(body, 'utf8');
            } else {
                throw new Error('无法处理的body格式');
            }
            
            console.log('[parseFormData] Body大小:', bodyBuffer.length, 'bytes');
            
            // 将body写入临时文件
            fs.writeFileSync(tempFilePath, bodyBuffer);
            
            // 使用Node.js的Readable stream来模拟请求
            const { Readable } = require('stream');
            
            const mockReq = new Readable({
                read() {
                    // 不需要实现，因为我们会直接推送数据
                }
            });
            
            // 设置headers
            mockReq.headers = headers;
            
            // 推送数据并结束流
            mockReq.push(bodyBuffer);
            mockReq.push(null); // 结束流
            
            const form = new multiparty.Form({
                maxFilesSize: 50 * 1024 * 1024, // 50MB
                maxFields: 100,
                maxFieldsSize: 10 * 1024 * 1024 // 10MB
            });
            
            form.parse(mockReq, (err, fields, files) => {
                // 清理临时文件
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                } catch (cleanupErr) {
                    console.warn('[parseFormData] 清理临时文件失败:', cleanupErr.message);
                }
                
                if (err) {
                    console.error('[parseFormData] 解析失败:', err.message);
                    console.error('[parseFormData] 错误详情:', err);
                    return reject(new Error(`表单数据解析失败: ${err.message}`));
                }
                
                console.log('[parseFormData] 解析成功 - 字段:', Object.keys(fields));
                console.log('[parseFormData] 解析成功 - 文件:', Object.keys(files));
                
                // 转换字段格式
                const singleFields = Object.entries(fields).reduce((acc, [key, value]) => {
                    acc[key] = Array.isArray(value) ? value[0] : value;
                    return acc;
                }, {});
                
                console.log('[parseFormData] 字段转换完成:', Object.keys(singleFields));
                
                resolve({ fields: singleFields, files });
            });
            
        } catch (error) {
            console.error('[parseFormData] 处理异常:', error.message);
            console.error('[parseFormData] 错误堆栈:', error.stack);
            
            // 清理临时文件
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupErr) {
                console.warn('[parseFormData] 清理临时文件失败:', cleanupErr.message);
            }
            reject(new Error(`表单数据处理失败: ${error.message}`));
        }
    });
};

/**
 * 验证手机号格式
 */
const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    const basicFormatRegex = /^[+]?\d{7,20}$/;
    
    if (basicFormatRegex.test(cleanPhone)) {
        return true;
    }
    
    const chinaMainlandRegex = /^1[3-9]\d{9}$/;
    const hongKongRegex = /^(\+?852)?[5-9]\d{7}$/;
    const macauRegex = /^(\+?853)?6\d{7}$/;
    const taiwanRegex = /^(\+?886)?9\d{8}$/;
    const internationalRegex = /^\+\d{7,15}$/;
    
    return chinaMainlandRegex.test(cleanPhone) ||
           hongKongRegex.test(cleanPhone) ||
           macauRegex.test(cleanPhone) ||
           taiwanRegex.test(cleanPhone) ||
           internationalRegex.test(cleanPhone);
};

// --- 主处理函数 ---

const handler = async (event) => {
    const startTime = Date.now();
    
    try {
        console.log('[handler] 开始处理统一订单提交请求');
        console.log('[handler] Event:', JSON.stringify(event, null, 2));
        
        // 解析表单数据
        const { fields, files } = await parseFormData(event);
        
        // 记录关键信息
        const uploadCount = Array.isArray(files?.user_uploads) ? files.user_uploads.length : 0;
        const refImageCount = Array.isArray(files?.uploadedImage) ? files.uploadedImage.length : 0;
        console.log('[handler] 表单解析摘要:', {
            fieldsKeys: Object.keys(fields || {}),
            uploadCount,
            refImageCount,
            firstUploadNames: (files?.user_uploads || []).slice(0, 3).map(f => f.originalFilename),
            firstRefUploadName: files?.uploadedImage?.[0]?.originalFilename,
        });
        
        // 检查MOCK模式
        const isMock = process.env.MOCK_FEISHU === '1' || process.env.MOCK_FEISHU === 'true';
        console.log('[handler] 运行模式:', { mock: isMock });
        
        // 提取关键字段
        const customizationStyle = fields.customization_style;
        const phone = fields.phone || '';
        const email = fields.email || '';
        const notes = fields.notes || '';
        
        // MOCK模式处理
        if (isMock) {
            if (!customizationStyle || !phone) {
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        success: false,
                        message: '缺少必要字段：customization_style、phone'
                    })
                };
            }
            
            const orderId = generateOrderId(phone);
            console.log('[handler] MOCK模式成功:', { orderId });
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: true,
                    message: 'Order submitted successfully! [MOCK]',
                    orderId,
                    data: { mock: true },
                    processingTime: Date.now() - startTime
                })
            };
        }
        
        // 环境变量验证
        const appToken = process.env.FEISHU_APP_TOKEN;
        const ordersTableId = process.env.FEISHU_ORDERS_TABLE_ID;
        
        if (!appToken) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Server misconfigured: FEISHU_APP_TOKEN is missing'
                })
            };
        }
        
        if (!ordersTableId) {
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Server misconfigured: FEISHU_ORDERS_TABLE_ID is missing'
                })
            };
        }
        
        // 字段验证和转换
        const petCount = fields.petCount ? Number(fields.petCount) : undefined;
        const size = fields.size || '';
        const price = fields.price ? Number(fields.price) : undefined;
        const selectionMethod = fields.selectionMethod || '';
        const textDescription = fields.textDescription || '';
        const selectedRecommendation = fields.selectedRecommendation ? parseJSONSafe(fields.selectedRecommendation) : null;
        
        // 验证必要字段
        if (!customizationStyle || !phone) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: '缺少必要字段：customization_style、phone'
                })
            };
        }
        
        // 验证手机号
        if (!validatePhone(phone)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: '手机号格式不正确，请输入有效的手机号码（支持中国大陆、港澳台及国际号码格式）'
                })
            };
        }
        
        const isMasterpiece = customizationStyle === '名画致敬款';
        
        // 生成订单号
        const orderId = generateOrderId(phone);
        
        // 上传宠物照片
        const petPhotoTokens = [];
        if (files.user_uploads) {
            console.log(`[handler] 开始上传 ${files.user_uploads.length} 张宠物照片`);
            
            for (const file of files.user_uploads) {
                try {
                    const token = await uploadFileToLark(file);
                    petPhotoTokens.push({ file_token: token });
                } catch (uploadError) {
                    console.error(`[handler] 宠物照片上传失败 ${file.originalFilename}:`, uploadError.message);
                    
                    return {
                        statusCode: 400,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify({
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
                        })
                    };
                }
            }
            
            console.log(`[handler] 成功上传 ${petPhotoTokens.length} 张宠物照片`);
        }
        
        // 上传参考图片
        let refImageToken = null;
        if (files.uploadedImage && files.uploadedImage[0]) {
            try {
                refImageToken = await uploadFileToLark(files.uploadedImage[0]);
            } catch (uploadError) {
                console.error('[handler] 参考图片上传失败:', uploadError.message);
                
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
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
                    })
                };
            }
        }
        
        // 准备记录数据
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
        
        // 根据产品类型添加特定字段
        if (isMasterpiece) {
            recordData['名画选择方式'] = mapMasterpieceMethod(selectionMethod) || undefined;
            if (selectionMethod === 'text' && textDescription) {
                recordData['爱宠个性描述'] = textDescription;
            }
            if (selectionMethod === 'upload' && refImageToken) {
                recordData['名画-上传图片'] = [{ file_token: refImageToken }];
            }
            if (selectionMethod === 'recommendation' && selectedRecommendation) {
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
                const linkValue = selectedRecommendation.name || selectedRecommendation.id;
                if (linkValue) {
                    recordData['背景-推荐选择'] = linkValue;
                }
            }
        }
        
        // 清理空值
        Object.keys(recordData).forEach(key => {
            const val = recordData[key];
            if (val === null || val === undefined) delete recordData[key];
            if (Array.isArray(val) && val.length === 0) delete recordData[key];
        });
        
        // 创建多维表格记录
        console.log('[handler] 创建多维表格记录:', { orderId });
        const response = await createBitableRecord(ordersTableId, recordData);
        const createdId = response?.data?.record?.record_id || response?.data?.record_id || response?.data?.id || null;
        console.log('[handler] 多维表格记录创建成功:', { orderId, recordId: createdId });
        
        const processingTime = Date.now() - startTime;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                message: 'Order submitted successfully!',
                orderId: orderId,
                data: response.data,
                processingTime
            })
        };
        
    } catch (error) {
        console.error('[handler] 订单处理失败:', error);
        
        // 错误分类处理
        const errorResponse = {
            success: false,
            message: '订单提交失败',
            error: {
                type: 'GENERAL_ERROR',
                details: error.message
            },
            processingTime: Date.now() - startTime
        };
        
        // 网络相关错误
        if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('ECONNRESET')) {
            errorResponse.error.type = 'NETWORK_ERROR';
            errorResponse.message = '网络连接异常';
            errorResponse.error.suggestions = [
                '请检查网络连接是否稳定',
                '稍后重试提交订单',
                '如果问题持续，请联系客服'
            ];
        }
        // 飞书API相关错误
        else if (error.message.includes('lark') || error.message.includes('feishu') || error.message.includes('bitable')) {
            errorResponse.error.type = 'API_ERROR';
            errorResponse.message = '系统服务异常';
            errorResponse.error.suggestions = [
                '系统正在维护中，请稍后重试',
                '如果问题持续，请联系客服'
            ];
        }
        // 文件相关错误
        else if (error.message.includes('file') || error.message.includes('upload')) {
            errorResponse.error.type = 'FILE_ERROR';
            errorResponse.message = '文件处理失败';
            errorResponse.error.suggestions = [
                '请检查上传的图片文件',
                '确保图片格式为JPG或PNG',
                '确保图片大小不超过10MB'
            ];
        }
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(errorResponse)
        };
        
    } finally {
        // 清理临时文件
        cleanupTempFiles();
    }
};

// 导出处理函数
module.exports = { handler };