<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">编辑权限</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">修改权限信息</p>
      </div>
      
      <div class="flex items-center gap-3">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="outline"
          size="sm"
          @click="handleCancel"
        >
          返回
        </UButton>
      </div>
    </div>

    <!-- 编辑表单卡片 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">权限信息</h2>
          <UBadge
            v-if="permission"
            :color="permission.is_system ? 'warning' : 'neutral'"
            variant="soft"
          >
            {{ permission.is_system ? '系统权限' : '自定义权限' }}
          </UBadge>
        </div>
      </template>

      <PermissionForm
        v-if="permission"
        :permission="permission"
        :loading="loading"
        :is-edit="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      
      <div v-else class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin h-6 w-6" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { PermissionCreate, PermissionUpdate } from '../../../../types'
import { useRbacApi } from '../../../../composables/useRbacApi'
import PermissionForm from '../../../../components/PermissionForm.vue'

// 页面元数据
definePageMeta({
  title: '编辑权限'
})

// 路由参数
const route = useRoute()
const permissionId = computed(() => Number(route.params.id))

// 状态
const loading = ref(false)

// API
const rbacApi = useRbacApi()

// 获取权限数据
const { data: permission } = await rbacApi.getPermission(permissionId.value)

// 如果权限不存在，跳转到404
if (!permission.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '权限不存在'
  })
}

// 处理表单提交
const handleSubmit = async (data: PermissionCreate | PermissionUpdate) => {
  loading.value = true
  try {
    await rbacApi.updatePermission(permissionId.value, data as PermissionUpdate)
    
    // 显示成功消息
    const toast = useToast()
    toast.add({
      title: '更新成功',
      description: `权限 "${data.display_name}" 已更新`,
      color: 'success'
    })
    
    navigateTo(`/rbac/permissions/${permissionId.value}`)
  } catch (error) {
    console.error('更新权限失败:', error)
    
    // 显示错误消息
    const toast = useToast()
    toast.add({
      title: '更新失败',
      description: '无法更新权限，请稍后重试',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 处理取消
const handleCancel = () => {
  navigateTo(`/rbac/permissions/${permissionId.value}`)
}
</script> 