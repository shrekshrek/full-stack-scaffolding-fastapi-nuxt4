export default defineNuxtConfig({
  // RBAC 权限管理模块
  // 提供角色和权限的管理功能
  imports: {
    dirs: ['composables/**', 'stores/**', 'types/**']
  },
  // 组件自动导入（仅在本layer内可用）
  components: [
    { path: './components', pathPrefix: false }
  ]
}) 