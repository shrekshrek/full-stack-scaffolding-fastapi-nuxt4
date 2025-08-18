# 工作流规则

## 核心原则：目录优先
执行任何命令前，**必须**确认当前工作目录

## 前端操作规则
- **工作目录**: 必须在 `/frontend`
- **包管理器**: 使用 `pnpm`
- **优先使用根目录命令**:
  - `pnpm fe:install` - 安装依赖
  - `pnpm fe:add <pkg>` - 添加依赖
  - `pnpm fe:dev` - 启动开发

## 后端操作规则
- **工作目录**: 必须在 `/backend`
- **包管理器**: 使用 `Poetry`
- **优先使用根目录命令**:
  - `pnpm be:install` - 安装依赖
  - `pnpm be:add <pkg>` - 添加依赖
  - `pnpm be:dev` - 启动开发
  - `pnpm be:migrate:up` - 执行迁移

## 全局命令（在根目录执行）
- `pnpm setup` - 首次安装
- `pnpm dev` - 启动所有服务
- `pnpm stop` - 停止所有服务
- `pnpm build` - 构建生产版本

## 重要提醒
1. 不要在错误的目录执行包管理命令
2. 前端用 pnpm，后端用 Poetry
3. 优先使用根目录的 pnpm 脚本命令