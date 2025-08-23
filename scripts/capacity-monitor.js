/**
 * 飞书多维表格容量监控脚本
 * 
 * 功能：
 * 1. 检查当前表格的记录数量
 * 2. 发送容量预警通知
 * 3. 触发归档或切换备用表格
 * 
 * 使用方法：
 * node scripts/capacity-monitor.js
 */

import lark from '@larksuiteoapi/node-sdk';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 初始化飞书客户端
const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
});

// 配置参数
const CONFIG = {
    APP_TOKEN: process.env.FEISHU_APP_TOKEN,
    ORDERS_TABLE_ID: process.env.FEISHU_ORDERS_TABLE_ID,
    BACKUP_APP_TOKEN: process.env.FEISHU_BACKUP_APP_TOKEN,
    BACKUP_ORDERS_TABLE_ID: process.env.FEISHU_BACKUP_ORDERS_TABLE_ID,
    WARNING_THRESHOLD: parseInt(process.env.FEISHU_CAPACITY_WARNING_THRESHOLD) || 16000,
    MAX_THRESHOLD: parseInt(process.env.FEISHU_CAPACITY_MAX_THRESHOLD) || 18000,
    MAX_CAPACITY: 20000, // 个人版最大容量
};

/**
 * 获取表格记录总数
 * @param {string} appToken - 应用token
 * @param {string} tableId - 表格ID
 * @returns {Promise<number>} 记录总数
 */
async function getTableRecordCount(appToken, tableId) {
    try {
        console.log(`[容量监控] 检查表格容量: ${tableId}`);
        
        const response = await client.bitable.appTableRecord.list({
            path: {
                app_token: appToken,
                table_id: tableId,
            },
            params: {
                page_size: 1, // 只需要获取总数，不需要具体数据
            },
        });
        
        const totalRecords = response.data.total || 0;
        console.log(`[容量监控] 当前记录数: ${totalRecords}`);
        
        return totalRecords;
    } catch (error) {
        console.error(`[容量监控] 获取记录数失败:`, error.message);
        throw error;
    }
}

/**
 * 发送容量预警通知
 * @param {number} currentCount - 当前记录数
 * @param {number} threshold - 阈值
 * @param {string} level - 警告级别 (warning/critical)
 */
async function sendCapacityAlert(currentCount, threshold, level) {
    const message = {
        warning: `⚠️ 飞书多维表格容量预警\n当前记录数: ${currentCount}\n预警阈值: ${threshold}\n建议尽快执行归档操作`,
        critical: `🚨 飞书多维表格容量严重预警\n当前记录数: ${currentCount}\n最大阈值: ${threshold}\n请立即执行归档或切换备用表格`
    };
    
    console.log(`[容量监控] ${level.toUpperCase()}级别预警:`);
    console.log(message[level]);
    
    // TODO: 集成实际的通知系统（如邮件、钉钉、企业微信等）
    // 示例：发送邮件通知
    // await sendEmailNotification(message[level]);
    
    // 示例：发送飞书消息通知
    // await sendFeishuMessage(message[level]);
}

/**
 * 触发归档流程
 * @param {number} currentCount - 当前记录数
 */
async function triggerArchiveProcess(currentCount) {
    console.log(`[容量监控] 触发归档流程，当前记录数: ${currentCount}`);
    
    // TODO: 实现归档逻辑
    // 1. 查询需要归档的记录（如30天前的已完成订单）
    // 2. 将记录移动到归档表
    // 3. 验证归档成功
    // 4. 删除主表中的已归档记录
    
    console.log(`[容量监控] 归档流程待实现`);
}

/**
 * 切换到备用表格
 */
async function switchToBackupTable() {
    if (!CONFIG.BACKUP_APP_TOKEN || !CONFIG.BACKUP_ORDERS_TABLE_ID) {
        console.error(`[容量监控] 备用表格配置不完整，无法切换`);
        return false;
    }
    
    console.log(`[容量监控] 切换到备用表格: ${CONFIG.BACKUP_ORDERS_TABLE_ID}`);
    
    // TODO: 实现表格切换逻辑
    // 1. 更新环境变量或配置文件
    // 2. 重启应用服务
    // 3. 验证新表格可用性
    
    console.log(`[容量监控] 备用表格切换待实现`);
    return true;
}

/**
 * 主监控函数
 */
async function monitorCapacity() {
    try {
        console.log(`[容量监控] 开始容量检查 - ${new Date().toISOString()}`);
        
        // 检查主表格容量
        const currentCount = await getTableRecordCount(CONFIG.APP_TOKEN, CONFIG.ORDERS_TABLE_ID);
        
        // 计算容量使用率
        const usageRate = (currentCount / CONFIG.MAX_CAPACITY * 100).toFixed(2);
        console.log(`[容量监控] 容量使用率: ${usageRate}%`);
        
        // 容量预警检查
        if (currentCount >= CONFIG.MAX_THRESHOLD) {
            // 严重预警：接近最大容量
            await sendCapacityAlert(currentCount, CONFIG.MAX_THRESHOLD, 'critical');
            
            // 尝试归档或切换备用表格
            await triggerArchiveProcess(currentCount);
            
            // 如果归档后仍然超过阈值，切换到备用表格
            const newCount = await getTableRecordCount(CONFIG.APP_TOKEN, CONFIG.ORDERS_TABLE_ID);
            if (newCount >= CONFIG.MAX_THRESHOLD) {
                await switchToBackupTable();
            }
            
        } else if (currentCount >= CONFIG.WARNING_THRESHOLD) {
            // 一般预警：达到预警阈值
            await sendCapacityAlert(currentCount, CONFIG.WARNING_THRESHOLD, 'warning');
            
        } else {
            console.log(`[容量监控] 容量正常，当前记录数: ${currentCount}`);
        }
        
        console.log(`[容量监控] 容量检查完成`);
        
    } catch (error) {
        console.error(`[容量监控] 监控过程出错:`, error);
        
        // 发送错误通知
        console.log(`🚨 容量监控系统异常: ${error.message}`);
    }
}

/**
 * 生成容量报告
 */
async function generateCapacityReport() {
    try {
        console.log(`[容量报告] 生成容量使用报告`);
        
        const currentCount = await getTableRecordCount(CONFIG.APP_TOKEN, CONFIG.ORDERS_TABLE_ID);
        const usageRate = (currentCount / CONFIG.MAX_CAPACITY * 100).toFixed(2);
        
        const report = {
            timestamp: new Date().toISOString(),
            currentRecords: currentCount,
            maxCapacity: CONFIG.MAX_CAPACITY,
            usageRate: `${usageRate}%`,
            warningThreshold: CONFIG.WARNING_THRESHOLD,
            maxThreshold: CONFIG.MAX_THRESHOLD,
            status: currentCount >= CONFIG.MAX_THRESHOLD ? 'CRITICAL' : 
                   currentCount >= CONFIG.WARNING_THRESHOLD ? 'WARNING' : 'NORMAL'
        };
        
        console.log(`[容量报告] 报告生成完成:`);
        console.table(report);
        
        return report;
        
    } catch (error) {
        console.error(`[容量报告] 生成报告失败:`, error);
        throw error;
    }
}

// 命令行参数处理
const command = process.argv[2];

switch (command) {
    case 'monitor':
        monitorCapacity();
        break;
    case 'report':
        generateCapacityReport();
        break;
    case 'check':
        getTableRecordCount(CONFIG.APP_TOKEN, CONFIG.ORDERS_TABLE_ID)
            .then(count => {
                console.log(`当前记录数: ${count}`);
                console.log(`容量使用率: ${(count / CONFIG.MAX_CAPACITY * 100).toFixed(2)}%`);
            })
            .catch(console.error);
        break;
    default:
        console.log(`
飞书多维表格容量监控工具

使用方法:
  node scripts/capacity-monitor.js monitor  # 执行容量监控
  node scripts/capacity-monitor.js report   # 生成容量报告
  node scripts/capacity-monitor.js check    # 快速检查当前容量

配置说明:
  请确保 .env.local 文件中包含必要的飞书配置信息
  可选配置容量阈值和备用表格信息
`);
}

export {
    monitorCapacity,
    generateCapacityReport,
    getTableRecordCount,
    triggerArchiveProcess,
    switchToBackupTable
};