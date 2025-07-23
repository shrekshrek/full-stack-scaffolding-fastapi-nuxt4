#!/usr/bin/env node

/**
 * Nuxt 4 升级验证脚本
 * 用于检查升级后的应用是否正常工作
 */

import { execSync } from 'child_process'
import { existsSync, statSync } from 'fs'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function checkFile(path, description) {
  const exists = existsSync(path)
  log(`${exists ? '✅' : '❌'} ${description}: ${path}`, exists ? colors.green : colors.red)
  return exists
}

function checkDirectory(path, description) {
  const exists = existsSync(path) && statSync(path).isDirectory()
  log(`${exists ? '✅' : '❌'} ${description}: ${path}`, exists ? colors.green : colors.red)
  return exists
}

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, colors.blue)
    execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    log(`✅ ${description} 成功`, colors.green)
    return true
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`, colors.red)
    return false
  }
}

async function main() {
  log('🚀 开始验证 Nuxt 4 升级...', colors.blue)
  
  let passed = 0
  let total = 0
  
  // 检查目录结构
  log('\n📁 检查目录结构:', colors.yellow)
  const directoryChecks = [
    ['app', 'app 目录'],
    ['app/assets', 'assets 目录'],
    ['app/components', 'components 目录'],
    ['app/composables', 'composables 目录'],
    ['app/layouts', 'layouts 目录'],
    ['app/middleware', 'middleware 目录'],
    ['app/pages', 'pages 目录'],
    ['app/plugins', 'plugins 目录'],
    ['app/utils', 'utils 目录'],
    ['layers', 'layers 目录'],
    ['layers/ui-kit', 'ui-kit layer'],
    ['layers/auth', 'auth layer'],
    ['layers/users', 'users layer'],
    ['layers/rbac', 'rbac layer'],
    ['server', 'server 目录'],
    ['public', 'public 目录']
  ]
  
  for (const [path, desc] of directoryChecks) {
    total++
    if (checkDirectory(path, desc)) passed++
  }
  
  // 检查关键文件
  log('\n📄 检查关键文件:', colors.yellow)
  const fileChecks = [
    ['app/app.vue', 'app.vue'],
    ['app/app.config.ts', 'app.config.ts'],
    ['app/error.vue', 'error.vue'],
    ['nuxt.config.ts', 'nuxt.config.ts'],
    ['package.json', 'package.json'],
    ['tsconfig.json', 'tsconfig.json']
  ]
  
  for (const [path, desc] of fileChecks) {
    total++
    if (checkFile(path, desc)) passed++
  }
  
  // 检查 layer 配置文件
  log('\n⚙️ 检查 Layer 配置:', colors.yellow)
  const layerConfigs = [
    ['layers/ui-kit/nuxt.config.ts', 'ui-kit layer config'],
    ['layers/auth/nuxt.config.ts', 'auth layer config'],
    ['layers/users/nuxt.config.ts', 'users layer config'],
    ['layers/rbac/nuxt.config.ts', 'rbac layer config']
  ]
  
  for (const [path, desc] of layerConfigs) {
    total++
    if (checkFile(path, desc)) passed++
  }
  
  // 运行基本命令测试
  log('\n🧪 运行基本测试:', colors.yellow)
  const commandTests = [
    ['pnpm nuxt prepare', '准备 Nuxt 应用'],
    ['pnpm nuxt typecheck', 'TypeScript 类型检查']
  ]
  
  for (const [command, desc] of commandTests) {
    total++
    if (runCommand(command, desc)) passed++
  }
  
  // 输出结果
  log('\n📊 验证结果:', colors.yellow)
  const percentage = Math.round((passed / total) * 100)
  const resultColor = percentage >= 90 ? colors.green : percentage >= 70 ? colors.yellow : colors.red
  
  log(`通过: ${passed}/${total} (${percentage}%)`, resultColor)
  
  if (percentage >= 90) {
    log('\n🎉 恭喜！Nuxt 4 升级验证通过！', colors.green)
    log('你可以继续进行功能测试和部署。', colors.green)
  } else if (percentage >= 70) {
    log('\n⚠️ 升级基本完成，但有一些问题需要解决。', colors.yellow)
    log('请检查上面失败的项目并修复。', colors.yellow)
  } else {
    log('\n❌ 升级可能存在问题，请检查并修复失败的项目。', colors.red)
  }
  
  log('\n📋 下一步:', colors.blue)
  log('1. 启动开发服务器: pnpm dev', colors.blue)
  log('2. 测试所有页面和功能', colors.blue)
  log('3. 运行完整的测试套件', colors.blue)
  log('4. 检查控制台是否有错误或警告', colors.blue)
}

main().catch(console.error) 