import lark from '@larksuiteoapi/node-sdk';

// 初始化飞书客户端
const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
});

// 生成订单ID（复用原有逻辑）
const generateOrderId = (phone) => {
    const timestamp = Date.now().toString();
    const phoneLastFour = phone.slice(-4);
    const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${timestamp}${phoneLastFour}${randomSuffix}`;
};

// 获取产品线（复用原有逻辑）
const getProductLine = (style) => {
    const styleMap = {
        '经典款': '经典款',
        '豪华款': '豪华款',
        '至尊款': '至尊款'
    };
    return styleMap[style] || '未知款式';
};

// 映射背景方法（复用原有逻辑）
const mapBackgroundMethod = (method) => {
    const methodMap = {
        'ai': 'AI智能推荐',
        'upload': '上传参考图',
        'text': '文字描述'
    };
    return methodMap[method] || method;
};

// 映射杰作方法（复用原有逻辑）
const mapMasterpieceMethod = (method) => {
    const methodMap = {
        'ai': 'AI智能推荐',
        'upload': '上传参考图'
    };
    return methodMap[method] || method;
};

// 创建多维表格记录（复用原有逻辑）
const createBitableRecord = async (tableId, recordData) => {
    try {
        const response = await client.bitable.appTableRecord.create({
            path: {
                app_token: process.env.FEISHU_APP_TOKEN,
                table_id: tableId,
            },
            data: {
                fields: recordData,
            },
        });
        
        if (response.code === 0) {
            console.log('[submit-order-batch] 多维表格记录创建成功:', response.data.record.record_id);
            return { success: true, recordId: response.data.record.record_id };
        } else {
            throw new Error(`创建记录失败: ${response.msg}`);
        }
    } catch (error) {
        console.error('[submit-order-batch] 创建多维表格记录失败:', error);
        throw error;
    }
};

// 增强手机号验证（复用原有逻辑）
const validatePhone = (phone) => {
    // 移除所有空格、连字符和括号
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // 基本格式检查: 至少7位数字，最多20位（包含国家代码）
    const basicFormatRegex = /^[\+]?\d{7,20}$/;
    
    if (basicFormatRegex.test(cleanPhone)) {
        return true;
    }
    
    // 中国大陆手机号: 1[3-9]xxxxxxxxx (11位)
    const chinaMainlandRegex = /^1[3-9]\d{9}$/;
    
    // 香港手机号: +852 或 852 开头，后跟8位数字
    const hongKongRegex = /^(\+?852)?[5-9]\d{7}$/;
    
    // 澳门手机号: +853 或 853 开头，后跟8位数字
    const macauRegex = /^(\+?853)?6\d{7}$/;
    
    // 台湾手机号: +886 或 886 开头，后跟9位数字
    const taiwanRegex = /^(\+?886)?9\d{8}$/;
    
    // 美国手机号: +1 或 1 开头，后跟10位数字
    const usRegex = /^(\+?1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    
    return chinaMainlandRegex.test(cleanPhone) ||
           hongKongRegex.test(cleanPhone) ||
           macauRegex.test(cleanPhone) ||
           taiwanRegex.test(cleanPhone) ||
           usRegex.test(cleanPhone);
};

// 解析JSON安全函数（复用原有逻辑）
const parseJSONSafe = (str) => {
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
};

// 主处理函数
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const {
            batchId,
            userUploads = [],
            referenceImages = [],
            orderData
        } = req.body;
        
        console.log('[submit-order-batch] 接收到分批订单提交请求:', {
            batchId,
            userUploadsCount: userUploads.length,
            referenceImagesCount: referenceImages.length,
            hasOrderData: Boolean(orderData)
        });
        
        // 验证必要参数
        if (!batchId) {
            return res.status(400).json({
                success: false,
                message: '缺少批次ID'
            });
        }
        
        if (!orderData) {
            return res.status(400).json({
                success: false,
                message: '缺少订单数据'
            });
        }
        
        // 验证文件tokens
        if (!userUploads || userUploads.length === 0) {
            return res.status(400).json({
                success: false,
                message: '缺少宠物照片文件',
                errorType: 'MISSING_PET_PHOTOS'
            });
        }
        
        // 提取订单数据
        const {
            phone,
            email,
            customization_style,
            petCount,
            size,
            price,
            selectionMethod,
            textDescription,
            selectedRecommendation,
            notes
        } = orderData;
        
        // 验证必要字段
        if (!customization_style || !phone) {
            return res.status(400).json({
                success: false,
                message: '缺少必要字段：customization_style、phone'
            });
        }
        
        // 验证手机号
        if (!validatePhone(phone)) {
            return res.status(400).json({
                success: false,
                message: '手机号格式不正确',
                errorType: 'INVALID_PHONE'
            });
        }
        
        // 检查是否为MOCK模式
        const isMock = process.env.MOCK_FEISHU === '1' || process.env.MOCK_FEISHU === 'true';
        
        if (isMock) {
            const orderId = generateOrderId(phone);
            console.log('[submit-order-batch] MOCK模式 - 订单提交成功:', { orderId, batchId });
            return res.status(200).json({
                success: true,
                message: 'Order submitted successfully! [MOCK BATCH]',
                orderId,
                batchId,
                data: { mock: true }
            });
        }
        
        // 环境变量验证
        const appToken = process.env.FEISHU_APP_TOKEN;
        const ordersTableId = process.env.FEISHU_ORDERS_TABLE_ID;
        
        if (!appToken) {
            return res.status(500).json({
                success: false,
                message: 'Server misconfigured: FEISHU_APP_TOKEN is missing'
            });
        }
        
        if (!ordersTableId) {
            return res.status(500).json({
                success: false,
                message: 'Server misconfigured: FEISHU_ORDERS_TABLE_ID is missing'
            });
        }
        
        // 生成订单ID
        const orderId = generateOrderId(phone);
        
        // 构建多维表格记录数据
        const recordData = {
            '订单编号': orderId,
            '手机号': phone,
            '邮箱': email || '',
            '产品款式': customization_style,
            '产品线': getProductLine(customization_style),
            '宠物数量': petCount ? Number(petCount) : 1,
            '尺寸': size || '',
            '价格': price ? Number(price) : 0,
            '背景选择方式': mapBackgroundMethod(selectionMethod),
            '文字描述': textDescription || '',
            '选择的推荐': selectedRecommendation ? JSON.stringify(selectedRecommendation) : '',
            '备注': notes || '',
            '提交时间': new Date().toISOString(),
            '上传方式': '分批上传',
            '批次ID': batchId,
            '宠物照片数量': userUploads.length,
            '参考图数量': referenceImages.length
        };
        
        // 添加文件tokens到记录
        if (userUploads.length > 0) {
            recordData['宠物照片tokens'] = JSON.stringify(userUploads);
        }
        
        if (referenceImages.length > 0) {
            recordData['参考图tokens'] = JSON.stringify(referenceImages);
        }
        
        console.log('[submit-order-batch] 准备创建多维表格记录:', {
            orderId,
            batchId,
            recordFields: Object.keys(recordData)
        });
        
        // 创建多维表格记录
        const createResult = await createBitableRecord(ordersTableId, recordData);
        
        if (!createResult.success) {
            throw new Error('创建订单记录失败');
        }
        
        console.log('[submit-order-batch] 分批订单提交成功:', {
            orderId,
            batchId,
            recordId: createResult.recordId,
            userUploadsCount: userUploads.length,
            referenceImagesCount: referenceImages.length
        });
        
        return res.status(200).json({
            success: true,
            message: 'Batch order submitted successfully!',
            orderId,
            batchId,
            recordId: createResult.recordId,
            data: {
                userUploadsCount: userUploads.length,
                referenceImagesCount: referenceImages.length,
                uploadMethod: 'batch'
            }
        });
        
    } catch (error) {
        console.error('[submit-order-batch] 处理请求时发生错误:', error);
        return res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: error.message
        });
    }
}

export default handler;