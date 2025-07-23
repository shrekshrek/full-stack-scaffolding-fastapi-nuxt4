#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./scripts/deploy-production.sh

set -e  # 遇到错误立即退出

echo "🚀 Starting production deployment..."
echo "=================================="

# 检查必要文件是否存在
if [ ! -f "backend/.env.production" ]; then
    echo "❌ Error: backend/.env.production not found!"
    echo "💡 Please create production environment configuration first."
    exit 1
fi

if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found!"
    exit 1
fi

# 停止现有的生产环境容器（如果存在）
echo "🛑 Stopping existing production containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# 构建生产环境镜像
echo "🏗️ Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# 启动生产环境
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ Waiting for services to start..."
sleep 10

# 检查服务状态
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# 检查后端健康状态
echo "🏥 Checking backend health..."
if curl -f -s http://localhost/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️ Backend health check failed. Checking logs..."
    docker-compose -f docker-compose.prod.yml logs backend
fi

echo "=================================="
echo "🎉 Production deployment completed!"
echo ""
echo "📍 Services:"
echo "   🌐 Application: http://localhost"
echo "   🔧 API: http://localhost/api/v1"
echo "   📖 API Docs: http://localhost/api/v1/docs"
echo "   📧 MailHog: http://localhost:8025"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop:"
echo "   pnpm prod:down" 