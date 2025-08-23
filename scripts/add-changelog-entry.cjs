#!/usr/bin/env node

/**
 * 开发日志条目添加脚本
 * 使用方法: node scripts/add-changelog-entry.js "标题" "描述" "修改的文件"
 */

const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../prd_and_plan/development_changelog.md');

function addChangelogEntry(title, description, files) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  
  const entry = `
#### ${title}

- **时间**: ${dateStr} ${timeStr}
- **描述**: ${description}
- **修改文件**: ${files}
- **状态**: 🔄 进行中

`;

  try {
    let content = fs.readFileSync(changelogPath, 'utf8');
    
    // 在 "## 开发环境信息" 前插入新条目
    const insertPoint = content.indexOf('## 开发环境信息');
    if (insertPoint !== -1) {
      const insertPosition = insertPoint;
      
      content = content.slice(0, insertPosition) + entry + '\n' + content.slice(insertPosition);
      
      fs.writeFileSync(changelogPath, content, 'utf8');
      console.log('✅ 开发日志条目已添加');
      console.log(`📝 标题: ${title}`);
      console.log(`📄 文件: ${changelogPath}`);
    } else {
      console.error('❌ 无法找到插入位置');
    }
  } catch (error) {
    console.error('❌ 添加日志条目失败:', error.message);
  }
}

function updateEntryStatus(title, newStatus) {
  try {
    let content = fs.readFileSync(changelogPath, 'utf8');
    
    // 查找并更新状态
    const titleRegex = new RegExp(`#### ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    const titleMatch = content.match(titleRegex);
    
    if (titleMatch) {
      const statusRegex = /- \*\*状态\*\*: [^\n]+/;
      const statusReplacement = `- **状态**: ${newStatus}`;
      
      content = content.replace(statusRegex, statusReplacement);
      fs.writeFileSync(changelogPath, content, 'utf8');
      
      console.log(`✅ 状态已更新: ${title} -> ${newStatus}`);
    } else {
      console.error(`❌ 未找到标题: ${title}`);
    }
  } catch (error) {
    console.error('❌ 更新状态失败:', error.message);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📖 开发日志管理脚本');
  console.log('');
  console.log('使用方法:');
  console.log('  添加新条目: node scripts/add-changelog-entry.cjs "标题" "描述" "修改的文件"');
  console.log('  更新状态:   node scripts/add-changelog-entry.cjs --status "标题" "新状态"');
  console.log('');
  console.log('状态选项:');
  console.log('  🔄 进行中');
  console.log('  ✅ 已完成');
  console.log('  ❌ 已取消');
  console.log('  ⚠️ 需要注意');
  process.exit(0);
}

if (args[0] === '--status' && args.length === 3) {
  updateEntryStatus(args[1], args[2]);
} else if (args.length === 3) {
  addChangelogEntry(args[0], args[1], args[2]);
} else {
  console.error('❌ 参数错误，请查看使用说明');
  process.exit(1);
}