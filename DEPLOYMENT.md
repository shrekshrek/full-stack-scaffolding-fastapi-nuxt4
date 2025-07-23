# 🚀 部署指南

本项目支持开发环境和生产环境的分离部署。

## 📁 环境配置文件

```
项目根目录/
├── .env                          # 开发环境配置 (前端+Docker基础设施)
├── backend/.env                  # 后端开发环境配置
├── backend/.env.production       # 后端生产环境配置 ⭐ 新增
├── docker-compose.yml            # 开发环境 Docker 配置
├── docker-compose.prod.yml       # 生产环境 Docker 配置
└── scripts/deploy-production.sh  # 生产环境部署脚本 ⭐ 新增
```

## 🔧 开发环境

### 启动开发环境
```bash
# 一键启动开发环境
pnpm dev

# 这会启动：
# - 后端容器 (FastAPI + 数据库 + Redis)
# - 前端本地服务器 (Nuxt.js)
```

### 开发环境访问
- 🌐 前端: http://localhost:3000
- 🔧 后端API: http://localhost:8000
- 📖 API文档: http://localhost:8000/docs
- 📧 邮件测试: http://localhost:8025

## 🚀 生产环境

### 首次部署准备

1. **检查生产环境配置**
   ```bash
   # 编辑生产环境配置
   nano backend/.env.production
   
   # 重要：修改以下配置
   # - SECRET_KEY: 使用安全的密钥
   # - DATABASE_URL: 生产数据库连接
   # - SMTP配置: 生产邮件服务器
   ```

2. **部署到生产环境**
   ```bash
   # 方式1: 使用部署脚本 (推荐)
   pnpm prod:deploy
   
   # 方式2: 手动部署
   pnpm prod:up
   ```

### 生产环境管理

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
pnpm prod:logs

# 重启服务
pnpm prod:restart

# 停止服务
pnpm prod:down
```

### 生产环境访问
- 🌐 应用: http://localhost (通过Nginx代理)
- 🔧 API: http://localhost/api/v1
- 📖 API文档: http://localhost/api/v1/docs
- 📧 邮件管理: http://localhost:8025

## 🔐 安全配置

### 生产环境密钥生成
```bash
# 生成新的安全密钥
openssl rand -hex 32

# 将生成的密钥更新到 backend/.env.production 中的 SECRET_KEY
```

### 环境变量说明

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| `ENVIRONMENT` | development | production | 环境标识 |
| `SECRET_KEY` | 弱密钥(开发用) | 强密钥(生产用) | JWT签名密钥 |
| `DATABASE_URL` | localhost:5432 | postgres_db:5432 | 数据库连接 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | 15 | Token过期时间 |

## 🛠️ 故障排除

### 常见问题

1. **生产环境无法访问**
   ```bash
   # 检查容器状态
   docker-compose -f docker-compose.prod.yml ps
   
   # 查看后端日志
   docker-compose -f docker-compose.prod.yml logs backend
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器
   docker-compose -f docker-compose.prod.yml logs postgres_db
   ```

3. **前端无法访问后端API**
   ```bash
   # 检查Nginx配置
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

## 📊 监控和维护

### 健康检查
```bash
# 检查后端健康状态
curl http://localhost/api/v1/health

# 检查前端状态
curl http://localhost
```

### 数据备份
```bash
# 备份生产数据库
docker-compose -f docker-compose.prod.yml exec postgres_db pg_dump -U postgres fastapi_db > backup.sql
```

## 🎯 最佳实践

1. **安全性**
   - 生产环境使用强密钥
   - 定期更新依赖包
   - 监控安全漏洞

2. **性能**
   - 定期清理Docker镜像
   - 监控资源使用情况
   - 优化数据库查询

3. **维护**
   - 定期备份数据
   - 监控日志异常
   - 及时更新配置 