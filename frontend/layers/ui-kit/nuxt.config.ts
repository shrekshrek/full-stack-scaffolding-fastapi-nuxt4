export default defineNuxtConfig({
  // UI组件库 - 组件虽然全局注册，但在开发ui-kit时也需要内部自动导入
  components: [
    { path: './components', pathPrefix: false }
  ]
}) 