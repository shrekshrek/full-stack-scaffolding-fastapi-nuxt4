export default defineNuxtConfig({
  // 自动导入
  imports: {
    dirs: ['composables/**', 'stores/**']
  },
  // 组件自动导入（仅在本layer内可用）
  components: [
    { path: './components', pathPrefix: false }
  ]
}) 