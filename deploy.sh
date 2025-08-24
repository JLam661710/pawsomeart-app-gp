#!/bin/bash

# PawsomeArt 项目自动部署脚本
# 使用方法: ./deploy.sh [commit-message]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PawsomeArt 自动部署开始...${NC}"

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 检测到未提交的更改${NC}"
    
    # 添加所有更改
    echo -e "${BLUE}📦 添加所有更改到 Git...${NC}"
    git add .
    
    # 提交更改
    if [ -n "$1" ]; then
        COMMIT_MSG="$1"
    else
        COMMIT_MSG="自动部署: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    echo -e "${BLUE}💾 提交更改: ${COMMIT_MSG}${NC}"
    git commit -m "$COMMIT_MSG"
    
    # 推送到远程仓库
    echo -e "${BLUE}⬆️  推送到 GitHub...${NC}"
    git push
else
    echo -e "${GREEN}✅ 没有未提交的更改${NC}"
fi

# 部署到 Vercel
echo -e "${BLUE}🌐 部署到 Vercel 生产环境...${NC}"
npx vercel --prod

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${YELLOW}💡 提示: 你可以使用 'npx vercel ls' 查看所有部署${NC}"
echo -e "${YELLOW}💡 提示: 你可以使用 'npx vercel logs' 查看部署日志${NC}"