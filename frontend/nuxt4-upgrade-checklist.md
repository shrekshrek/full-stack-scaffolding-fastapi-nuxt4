# Nuxt 4 升级检查清单

## ✅ 已完成的步骤

### 1. 准备工作
- [x] 创建备份分支 `nuxt4-upgrade`
- [x] 启用Nuxt 4兼容模式
- [x] 移动文件到 `app/` 目录

### 2. 目录结构迁移
- [x] 创建 `app/` 目录
- [x] 移动以下文件/目录到 `app/`：
  - [x] `assets/`
  - [x] `components/`
  - [x] `composables/`
  - [x] `layouts/`
  - [x] `middleware/`
  - [x] `pages/`
  - [x] `plugins/`
  - [x] `utils/`
  - [x] `app.vue`
  - [x] `app.config.ts`
  - [x] `error.vue`

### 3. 配置更新
- [x] 更新 `nuxt.config.ts` 中的路径引用
- [x] 更新 CSS 路径：`~/app/assets/css/main.css`
- [x] 更新组件路径：`./app/components`

## 🔄 需要验证的功能

### 核心功能测试
- [ ] 应用启动正常
- [ ] 页面路由工作正常
- [ ] 组件自动导入功能
- [ ] Composables自动导入
- [ ] 中间件执行正常
- [ ] 插件加载正常
- [ ] 静态资源访问正常

### Layers功能测试
- [ ] `ui-kit` layer 正常工作
- [ ] `auth` layer 正常工作  
- [ ] `users` layer 正常工作
- [ ] `rbac` layer 正常工作
- [ ] Layer间组件互相访问正常

### 数据获取测试
- [ ] `useFetch` 工作正常
- [ ] `useAsyncData` 工作正常
- [ ] API代理配置正常 (`/api/v1`)
- [ ] 错误处理正常

### UI和样式测试
- [ ] Nuxt UI 组件正常显示
- [ ] 深色/浅色模式切换正常
- [ ] 自定义CSS样式正常
- [ ] 图标显示正常

### 认证功能测试
- [ ] 登录功能正常
- [ ] 路由守卫正常
- [ ] 权限控制正常
- [ ] 会话管理正常

## 🚨 常见问题和解决方案

### 1. 导入路径问题
如果遇到导入路径错误，检查：
- 是否使用了旧的路径 `~/components/` 而不是 `~/app/components/`
- Layer内部的相对路径是否正确

### 2. 类型错误
- 重新生成类型：`pnpm nuxt prepare`
- 重启TypeScript服务

### 3. 开发服务器问题
- 清除缓存：`rm -rf .nuxt`
- 重新安装依赖：`pnpm install`

## 📝 升级后的优化建议

### 1. 利用Nuxt 4新特性
- [ ] 检查是否可以移除深度响应式配置
- [ ] 利用改进的TypeScript支持
- [ ] 使用改进的数据获取功能

### 2. 性能优化
- [ ] 检查构建大小变化
- [ ] 测试开发服务器启动速度
- [ ] 验证热重载性能

### 3. 代码清理
- [ ] 移除不必要的兼容性配置
- [ ] 更新依赖到兼容版本
- [ ] 清理过时的workaround代码

## 🔧 测试命令

```bash
# 开发模式测试
pnpm dev

# 构建测试
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm nuxt typecheck

# ESLint检查
pnpm lint
```

## 📞 需要关注的模块兼容性

检查以下模块是否需要更新：
- [ ] `@nuxt/ui` - 当前版本 3.1.3
- [ ] `@sidebase/nuxt-auth` - 当前版本 0.7.1
- [ ] `@pinia/nuxt` - 当前版本 0.11.1
- [ ] `@nuxt/eslint` - 当前版本 1.4.1
- [ ] `@nuxt/icon` - 当前版本 1.14.0

## ✨ 升级完成后
- [ ] 更新文档
- [ ] 通知团队成员
- [ ] 部署到测试环境验证
- [ ] 合并到主分支 