<template>
  <div class="space-y-6">
    <!-- 欢迎信息 -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ getGreeting() }}，{{ session?.user?.username }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">
        {{ formatDate(new Date()) }}
      </p>
    </div>

    <!-- 用户基本信息 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">账户信息</h2>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            用户名
          </label>
          <p class="text-gray-900 dark:text-gray-100">{{ session?.user?.username }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            邮箱
          </label>
          <p class="text-gray-900 dark:text-gray-100">{{ session?.user?.email }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            角色
          </label>
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="role in session?.user?.roles || ['user']"
              :key="role"
              :color="getRoleColor(role)"
              variant="soft"
              size="sm"
            >
              {{ getRoleLabel(role) }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <!-- 数据概览 -->
    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
      <span>以下为演示数据，实际项目中可通过 API 获取真实统计</span>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard class="text-center">
        <div class="text-3xl font-bold text-blue-600">{{ stats.totalUsers }}</div>
        <div class="text-sm text-gray-500 mt-1">用户总数</div>
      </UCard>
      <UCard class="text-center">
        <div class="text-3xl font-bold text-green-600">{{ stats.activeToday }}</div>
        <div class="text-sm text-gray-500 mt-1">今日活跃</div>
      </UCard>
      <UCard class="text-center">
        <div class="text-3xl font-bold text-purple-600">{{ stats.totalRoles }}</div>
        <div class="text-sm text-gray-500 mt-1">角色数量</div>
      </UCard>
      <UCard class="text-center">
        <div class="text-3xl font-bold text-orange-600">{{ stats.totalPermissions }}</div>
        <div class="text-sm text-gray-500 mt-1">权限数量</div>
      </UCard>
    </div>

    <!-- 数据图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 用户活动趋势 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">用户活动趋势</h3>
            <UBadge color="info" variant="soft" size="sm">近7天</UBadge>
          </div>
        </template>

        <ClientOnly>
          <div ref="barChartRef" class="w-full h-64"/>
          <template #fallback>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <UIcon name="i-heroicons-chart-bar" class="text-4xl animate-pulse" />
              <p class="ml-2">图表加载中...</p>
            </div>
          </template>
        </ClientOnly>
      </UCard>

      <!-- 角色分布 -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">用户角色分布</h3>
            <UBadge color="success" variant="soft" size="sm">实时</UBadge>
          </div>
        </template>

        <ClientOnly>
          <div ref="pieChartRef" class="w-full h-64"/>
          <template #fallback>
            <div class="h-64 flex items-center justify-center text-gray-500">
              <UIcon name="i-heroicons-chart-pie" class="text-4xl animate-pulse" />
              <p class="ml-2">图表加载中...</p>
            </div>
          </template>
        </ClientOnly>
      </UCard>
    </div>

    <!-- 快捷操作 -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">快捷操作</h2>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink 
          to="/profile" 
          class="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <UIcon name="i-heroicons-user-circle" class="w-6 h-6 text-blue-600" />
          <div>
            <div class="font-medium">个人资料</div>
            <div class="text-sm text-gray-500">查看和编辑个人信息</div>
          </div>
        </NuxtLink>

        <NuxtLink 
          to="/settings" 
          class="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 text-gray-600" />
          <div>
            <div class="font-medium">账户设置</div>
            <div class="text-sm text-gray-500">管理安全设置</div>
          </div>
        </NuxtLink>

        <NuxtLink 
          v-if="permissions.canAccessUsersPage" 
          to="/users" 
          class="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <UIcon name="i-heroicons-users" class="w-6 h-6 text-red-600" />
          <div>
            <div class="font-medium">用户管理</div>
            <div class="text-sm text-gray-500">管理系统用户</div>
          </div>
        </NuxtLink>
      </div>
    </UCard>

    <!-- 退出登录 -->
    <div class="flex justify-end">
      <UButton color="error" variant="outline" @click="handleSignOut">
        <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 mr-2" />
        安全退出
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
// 认证保护已由全局认证守卫处理，无需重复定义
import { getRoleColor, getRoleLabel } from '~/layers/users/utils/ui-helpers'

const { session } = useUserSession()
const { logout } = useAuthApi()
const permissions = usePermissions()

// 数据概览统计（演示数据，实际项目中应从 API 获取）
const stats = reactive({
  totalUsers: 128,
  activeToday: 42,
  totalRoles: 5,
  totalPermissions: 24
})

// 图表容器引用
const barChartRef = ref()
const pieChartRef = ref()

// 初始化柱状图
const barChart = useCharts({
  autoResize: true,
  resizeDelay: 100
})

// 初始化饼图
const pieChart = useCharts({
  autoResize: true,
  resizeDelay: 100
})

// 生成最近7天的日期标签
const getLast7Days = (): string[] => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const result: string[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    result.push(days[date.getDay()]!)
  }
  return result
}

// 获取问候语
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const handleSignOut = async () => {
  await logout()
}

// 初始化图表的函数
const initCharts = () => {
  // 初始化用户活动趋势图（柱状图）
  if (barChartRef.value) {
    barChart.initChart(barChartRef.value)
    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}<br/>登录: {c0} 次<br/>操作: {c1} 次'
      },
      legend: {
        data: ['登录次数', '操作次数'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: getLast7Days()
      },
      yAxis: { 
        type: 'value',
        name: '次数'
      },
      series: [
        {
          name: '登录次数',
          type: 'bar',
          data: [35, 42, 38, 51, 46, 58, 42],
          itemStyle: { color: '#3B82F6' }
        },
        {
          name: '操作次数',
          type: 'bar',
          data: [120, 156, 132, 187, 165, 203, 178],
          itemStyle: { color: '#10B981' }
        }
      ]
    })
  }

  // 初始化角色分布图（饼图）
  if (pieChartRef.value) {
    pieChart.initChart(pieChartRef.value)
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c} 人 ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: ['超级管理员', '管理员', '运营人员', '普通用户', '访客']
      },
      series: [{
        name: '角色分布',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: { show: false },
        data: [
          { value: 2, name: '超级管理员', itemStyle: { color: '#EF4444' } },
          { value: 8, name: '管理员', itemStyle: { color: '#F59E0B' } },
          { value: 15, name: '运营人员', itemStyle: { color: '#8B5CF6' } },
          { value: 89, name: '普通用户', itemStyle: { color: '#3B82F6' } },
          { value: 14, name: '访客', itemStyle: { color: '#6B7280' } }
        ]
      }]
    })
  }
}

// 在客户端挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    // 延迟确保 ClientOnly 组件完全渲染
    setTimeout(() => {
      initCharts()
      // 初始化后再次触发 resize 确保自适应
      nextTick(() => {
        barChart.resize()
        pieChart.resize()
      })
    }, 100)
  })
})
</script> 