<template>
  <UCard v-if="permission" class="shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900 flex items-center justify-center">
            <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{{ permission.display_name }}</h2>
            <p class="text-gray-500 dark:text-gray-400">{{ permission.name }}</p>
            <div class="mt-1 flex items-center gap-2">
              <UBadge
                :color="permission.is_system ? 'warning' : 'neutral'"
                variant="soft"
                size="sm"
              >
                {{ permission.is_system ? '系统权限' : '自定义权限' }}
              </UBadge>
              <div class="flex items-center space-x-1">
                <UBadge color="primary" variant="soft" size="sm">
                  {{ permission.resource }}
                </UBadge>
                <span class="text-gray-400 text-xs">:</span>
                <UBadge color="success" variant="soft" size="sm">
                  {{ permission.action }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <UButton
            v-if="canEdit && !permission.is_system"
            icon="i-heroicons-pencil-square"
            variant="outline"
            size="sm"
            color="primary"
            @click="$emit('edit')"
          >
            编辑
          </UButton>
          
          <UButton
            v-if="canDelete && !permission.is_system"
            icon="i-heroicons-trash"
            variant="outline"
            size="sm"
            color="error"
            @click="$emit('delete')"
          >
            删除
          </UButton>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- 基本信息 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">权限名称</label>
          <p class="text-gray-900 dark:text-gray-100 font-medium">{{ permission.name }}</p>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">显示名称</label>
          <p class="text-gray-900 dark:text-gray-100 font-medium">{{ permission.display_name }}</p>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">资源</label>
          <UBadge color="primary" variant="soft">
            {{ permission.resource }}
          </UBadge>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">操作</label>
          <UBadge color="success" variant="soft">
            {{ permission.action }}
          </UBadge>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">类型</label>
          <UBadge
            :color="permission.is_system ? 'warning' : 'neutral'"
            variant="soft"
            size="sm"
          >
            {{ permission.is_system ? '系统权限' : '自定义权限' }}
          </UBadge>
        </div>
        
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">权限ID</label>
          <p class="text-gray-900 dark:text-gray-100 font-mono text-sm">{{ permission.id }}</p>
        </div>
      </div>

      <!-- 描述 -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">权限描述</label>
        <p class="text-gray-900 dark:text-gray-100">{{ permission.description || '-' }}</p>
      </div>

      <!-- 系统权限警告 -->
      <div v-if="permission.is_system" class="space-y-1">
        <UAlert
          color="warning"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          title="系统权限"
          description="系统权限由系统自动管理，删除或修改可能影响系统功能，请谨慎操作。"
        />
      </div>

      <!-- 时间信息 -->
      <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">创建时间</label>
            <p class="text-gray-900 dark:text-gray-100">{{ formatDate(permission.created_at) }}</p>
          </div>
          
          <div class="space-y-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">更新时间</label>
            <p class="text-gray-900 dark:text-gray-100">{{ formatDate(permission.updated_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
  
  <UCard v-else>
    <div class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">权限信息不存在</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Permission } from '../types'

// Props
interface Props {
  permission?: Permission | null
  canEdit?: boolean
  canDelete?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  permission: null,
  canEdit: false,
  canDelete: false
})

// Emits
const _emit = defineEmits<{
  'edit': []
  'delete': []
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 