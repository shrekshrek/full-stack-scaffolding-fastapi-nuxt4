# Claude Code 项目配置

本项目是一个全栈Web应用，基于 FastAPI (后端) 和 Nuxt 4 (前端) 构建。

## 项目结构
- `/backend` - FastAPI后端应用
- `/frontend` - Nuxt前端应用  
- `/docs` - 项目文档
- `/.claude` - Claude AI专用规则

## 核心开发规则
- **后端规则**: 见 `.claude/backend-rules.md`
- **前端规则**: 见 `.claude/frontend-rules.md`
- **工作流规则**: 见 `.claude/workflow-rules.md`

## 详细开发文档
- **后端详细规范**: `backend/CONTRIBUTING.md`
- **前端详细规范**: `frontend/CONTRIBUTING.md`

## 核心配置文件

### 环境配置 (v2.0 统一管理)
- **开发环境**: `.env` - 本地开发配置
- **生产环境**: `.env.production` - 所有服务统一配置 ⭐
- **配置文档**: `docs/CONFIGURATION.md` - 详细配置管理指南

### 前端配置
- **API认证配置**: `frontend/config/api-auth.ts` - 集中管理API路径认证需求
- **路由权限配置**: `frontend/config/routes.ts` - 页面路由的认证和权限要求
- **权限定义**: `frontend/config/permissions.ts` - 细粒度权限定义

### 新模块添加
添加新业务模块时，只需调整 2-3 个配置文件：
1. `config/routes.ts` - 添加页面路由配置
2. `config/api-auth.ts` - 添加公开API路径（如需要）
3. `config/permissions.ts` - 添加权限定义（如需要）

## Claude 特定指令

### 代码修改原则
1. **优先编辑现有文件**，避免创建新文件
2. **不主动创建文档文件** (*.md) 除非明确要求
3. **遵循现有代码风格**，查看相邻文件了解规范
4. **保持简单** (KISS原则)，避免过度工程化

### 必需执行的检查
完成代码修改后，必须运行以下检查命令：

#### 后端检查
```bash
# Lint和格式化
pnpm be:lint    # 或 cd backend && poetry run ruff check --fix && poetry run ruff format

# 测试
pnpm be:test    # 或 cd backend && poetry run pytest
```

#### 前端检查
```bash
# 类型检查
pnpm fe:typecheck   # 或 cd frontend && pnpm typecheck

# Lint检查
pnpm fe:lint        # 或 cd frontend && pnpm lint
```

### 常用开发命令

#### 环境管理
- `pnpm setup` - 首次安装所有依赖
- `pnpm dev` - 启动完整开发环境
- `pnpm stop` - 停止所有服务

#### 数据库操作
- `pnpm be:migrate:make "描述"` - 创建数据库迁移
- `pnpm be:migrate:up` - 执行数据库迁移

#### 依赖管理
- `pnpm be:add <package>` - 添加后端依赖
- `pnpm fe:add <package>` - 添加前端依赖