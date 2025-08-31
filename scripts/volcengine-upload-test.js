/**
 * 火山引擎文件上传限制测试脚本
 * 用于验证 veFaaS 和 API 网关的实际文件上传大小限制
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const TEST_CONFIG = {
  // 火山引擎测试端点（需要替换为实际的测试环境）
  VOLCENGINE_ENDPOINT: 'https://your-volcengine-function.endpoint.com',
  
  // 测试文件大小（字节）
  TEST_SIZES: [
    1 * 1024 * 1024,      // 1MB
    4.5 * 1024 * 1024,    // 4.5MB (Vercel 限制)
    10 * 1024 * 1024,     // 10MB
    20 * 1024 * 1024,     // 20MB
    50 * 1024 * 1024,     // 50MB
    100 * 1024 * 1024,    // 100MB
  ],
  
  // 超时设置
  TIMEOUT: 180000, // 3分钟
};

/**
 * 生成指定大小的测试文件
 * @param {number} sizeInBytes 文件大小（字节）
 * @param {string} filename 文件名
 */
function generateTestFile(sizeInBytes, filename) {
  const buffer = Buffer.alloc(sizeInBytes, 'A'); // 填充字符 'A'
  const filePath = path.join(__dirname, 'temp', filename);
  
  // 确保临时目录存在
  const tempDir = path.dirname(filePath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

/**
 * 测试单个文件上传
 * @param {string} filePath 文件路径
 * @param {number} fileSize 文件大小
 */
async function testSingleUpload(filePath, fileSize) {
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('testSize', fileSize.toString());
    
    console.log(`\n🧪 测试上传 ${(fileSize / 1024 / 1024).toFixed(1)}MB 文件...`);
    
    const response = await axios.post(TEST_CONFIG.VOLCENGINE_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      timeout: TEST_CONFIG.TIMEOUT,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ 成功上传 ${(fileSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   响应状态: ${response.status}`);
    console.log(`   耗时: ${duration}ms`);
    console.log(`   响应大小: ${JSON.stringify(response.data).length} 字符`);
    
    return {
      success: true,
      fileSize,
      duration,
      status: response.status,
      responseSize: JSON.stringify(response.data).length,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.log(`❌ 上传失败 ${(fileSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   错误类型: ${error.code || error.name}`);
    console.log(`   错误信息: ${error.message}`);
    console.log(`   耗时: ${duration}ms`);
    
    if (error.response) {
      console.log(`   HTTP状态: ${error.response.status}`);
      console.log(`   响应头: ${JSON.stringify(error.response.headers)}`);
    }
    
    return {
      success: false,
      fileSize,
      duration,
      error: {
        code: error.code || error.name,
        message: error.message,
        status: error.response?.status,
        headers: error.response?.headers,
      },
    };
  }
}

/**
 * 测试多文件批量上传
 * @param {Array} filePaths 文件路径数组
 * @param {number} totalSize 总文件大小
 */
async function testBatchUpload(filePaths, totalSize) {
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    
    filePaths.forEach((filePath, index) => {
      formData.append(`file${index}`, fs.createReadStream(filePath));
    });
    
    formData.append('batchTest', 'true');
    formData.append('totalFiles', filePaths.length.toString());
    formData.append('totalSize', totalSize.toString());
    
    console.log(`\n🧪 测试批量上传 ${filePaths.length} 个文件，总大小 ${(totalSize / 1024 / 1024).toFixed(1)}MB...`);
    
    const response = await axios.post(TEST_CONFIG.VOLCENGINE_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
      timeout: TEST_CONFIG.TIMEOUT,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ 成功批量上传 ${filePaths.length} 个文件`);
    console.log(`   总大小: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   响应状态: ${response.status}`);
    console.log(`   耗时: ${duration}ms`);
    
    return {
      success: true,
      fileCount: filePaths.length,
      totalSize,
      duration,
      status: response.status,
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.log(`❌ 批量上传失败`);
    console.log(`   文件数量: ${filePaths.length}`);
    console.log(`   总大小: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   错误: ${error.message}`);
    console.log(`   耗时: ${duration}ms`);
    
    return {
      success: false,
      fileCount: filePaths.length,
      totalSize,
      duration,
      error: error.message,
    };
  }
}

/**
 * 清理临时文件
 */
function cleanup() {
  const tempDir = path.join(__dirname, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('\n🧹 清理临时文件完成');
  }
}

/**
 * 主测试函数
 */
async function runUploadTests() {
  console.log('🚀 开始火山引擎文件上传限制测试\n');
  console.log('测试端点:', TEST_CONFIG.VOLCENGINE_ENDPOINT);
  console.log('超时设置:', TEST_CONFIG.TIMEOUT / 1000, '秒\n');
  
  const results = [];
  
  try {
    // 1. 单文件上传测试
    console.log('=== 单文件上传测试 ===');
    
    for (const size of TEST_CONFIG.TEST_SIZES) {
      const filename = `test_${(size / 1024 / 1024).toFixed(1)}MB.txt`;
      const filePath = generateTestFile(size, filename);
      
      const result = await testSingleUpload(filePath, size);
      results.push({
        type: 'single',
        ...result,
      });
      
      // 如果上传失败，记录失败点并继续测试
      if (!result.success) {
        console.log(`⚠️  在 ${(size / 1024 / 1024).toFixed(1)}MB 处遇到限制`);
      }
      
      // 短暂延迟避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 2. 批量上传测试
    console.log('\n=== 批量上传测试 ===');
    
    // 测试多个小文件
    const smallFiles = [];
    let totalSize = 0;
    
    for (let i = 0; i < 5; i++) {
      const size = 2 * 1024 * 1024; // 2MB 每个文件
      const filename = `batch_test_${i + 1}.txt`;
      const filePath = generateTestFile(size, filename);
      smallFiles.push(filePath);
      totalSize += size;
    }
    
    const batchResult = await testBatchUpload(smallFiles, totalSize);
    results.push({
      type: 'batch',
      ...batchResult,
    });
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  } finally {
    cleanup();
  }
  
  // 3. 生成测试报告
  console.log('\n=== 测试结果汇总 ===');
  
  const successfulUploads = results.filter(r => r.success);
  const failedUploads = results.filter(r => !r.success);
  
  console.log(`\n✅ 成功上传: ${successfulUploads.length} 次`);
  console.log(`❌ 失败上传: ${failedUploads.length} 次`);
  
  if (successfulUploads.length > 0) {
    const maxSuccessfulSize = Math.max(...successfulUploads.map(r => r.fileSize || 0));
    console.log(`📊 最大成功上传大小: ${(maxSuccessfulSize / 1024 / 1024).toFixed(1)}MB`);
  }
  
  if (failedUploads.length > 0) {
    const minFailedSize = Math.min(...failedUploads.map(r => r.fileSize || Infinity));
    console.log(`⚠️  最小失败上传大小: ${(minFailedSize / 1024 / 1024).toFixed(1)}MB`);
  }
  
  // 保存详细结果到文件
  const reportPath = path.join(__dirname, 'volcengine-upload-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    endpoint: TEST_CONFIG.VOLCENGINE_ENDPOINT,
    results,
    summary: {
      totalTests: results.length,
      successfulUploads: successfulUploads.length,
      failedUploads: failedUploads.length,
      maxSuccessfulSize: successfulUploads.length > 0 ? Math.max(...successfulUploads.map(r => r.fileSize || 0)) : 0,
      minFailedSize: failedUploads.length > 0 ? Math.min(...failedUploads.map(r => r.fileSize || Infinity)) : null,
    },
  }, null, 2));
  
  console.log(`\n📄 详细测试报告已保存到: ${reportPath}`);
  
  return results;
}

// 如果直接运行此脚本
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('volcengine-upload-test.js')) {
  // 检查是否提供了测试端点
  if (process.argv[2]) {
    TEST_CONFIG.VOLCENGINE_ENDPOINT = process.argv[2];
  }
  
  if (TEST_CONFIG.VOLCENGINE_ENDPOINT.includes('your-volcengine-function')) {
    console.log('❌ 请先配置有效的火山引擎测试端点');
    console.log('使用方法: node volcengine-upload-test.js <your-endpoint-url>');
    process.exit(1);
  }
  
  runUploadTests().catch(console.error);
}

export {
  runUploadTests,
  generateTestFile,
  testSingleUpload,
  testBatchUpload,
};