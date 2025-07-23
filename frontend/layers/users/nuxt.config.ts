export default defineNuxtConfig({
  // 只配置必要的模块和导入
  imports: {
    dirs: ['composables/**', 'stores/**', 'types/**']
  },
  // 组件自动导入（仅在本layer内可用）
  components: [
    { path: './components', pathPrefix: false }
  ]
}) 