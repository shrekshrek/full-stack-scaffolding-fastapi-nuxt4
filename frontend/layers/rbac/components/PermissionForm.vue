<template>
  <UForm 
    :schema="schema" 
    :state="formState" 
    class="space-y-6"
    @submit="handleSubmit"
  >
    <!-- 基本信息 -->
    <div class="space-y-4">
      <!-- 权限名称和显示名称在一行 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="权限名称" name="name">
          <UInput 
            v-model="formState.name" 
            placeholder="请输入权限名称（英文）"
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="显示名称" name="display_name">
          <UInput 
            v-model="formState.display_name" 
            placeholder="请输入显示名称（中文）"
            :disabled="loading"
          />
        </UFormField>
      </div>

      <!-- 资源和操作选择 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="资源" name="resource">
          <USelect 
            v-model="formState.resource" 
            :items="resourceOptions"
            placeholder="选择资源"
            :disabled="loading"
          />
        </UFormField>

        <UFormField label="操作" name="action">
          <USelect 
            v-model="formState.action" 
            :items="actionOptions"
            placeholder="选择操作"
            :disabled="loading"
          />
        </UFormField>
      </div>

      <UFormField label="权限描述" name="description">
        <UTextarea 
          v-model="formState.description" 
          placeholder="请输入权限描述（可选）"
          :disabled="loading"
          :rows="3"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
      <UButton 
        variant="outline" 
        :disabled="loading"
        @click="$emit('cancel')"
      >
        取消
      </UButton>
      
      <UButton 
        type="submit" 
        :loading="loading"
        color="primary"
      >
        {{ isEdit ? '更新权限' : '创建权限' }}
      </UButton>
    </div>
  </UForm>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { Permission, PermissionCreate, PermissionUpdate } from '../types'

// Props
interface Props {
  permission?: Permission | null
  loading?: boolean
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  permission: null,
  loading: false,
  isEdit: false
})

// Emits
const emit = defineEmits<{
  'submit': [data: PermissionCreate | PermissionUpdate]
  'cancel': []
}>()

// 表单状态
const formState = reactive({
  name: '',
  display_name: '',
  resource: '',
  action: '',
  description: ''
})

// 预定义选项（与后端保持一致）
const resourceOptions = [
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '权限管理', value: 'permission' },
  { label: '页面访问', value: 'page' }
]

const actionOptions = [
  { label: '查看', value: 'read' },
  { label: '编辑', value: 'write' },
  { label: '删除', value: 'delete' },
  { label: '访问', value: 'access' }
]

// 表单验证规则
const schema = z.object({
  name: z.string().min(2, '权限名称至少2个字符').max(100, '权限名称最多100个字符').regex(/^[a-zA-Z0-9_:-]+$/, '权限名称只能包含字母、数字、下划线、冒号和横线'),
  display_name: z.string().min(2, '显示名称至少2个字符').max(50, '显示名称最多50个字符'),
  resource: z.string().min(1, '请选择资源'),
  action: z.string().min(1, '请选择操作'),
  description: z.string().max(200, '描述最多200个字符').optional()
})

// 初始化表单数据
watch(() => props.permission, (permission) => {
  if (permission) {
    formState.name = permission.name
    formState.display_name = permission.display_name
    formState.resource = permission.resource
    formState.action = permission.action
    formState.description = permission.description || ''
  }
}, { immediate: true })

// 提交处理
const handleSubmit = async () => {
  try {
    if (props.isEdit) {
      // 编辑模式：只提交有变化的字段
      const updateData: PermissionUpdate = {}
      
      if (formState.name !== props.permission?.name) {
        updateData.name = formState.name
      }
      
      if (formState.display_name !== props.permission?.display_name) {
        updateData.display_name = formState.display_name
      }
      
      if (formState.resource !== props.permission?.resource) {
        updateData.resource = formState.resource
      }
      
      if (formState.action !== props.permission?.action) {
        updateData.action = formState.action
      }
      
      if (formState.description !== (props.permission?.description || '')) {
        updateData.description = formState.description || undefined
      }
      
      emit('submit', updateData)
    } else {
      // 创建模式：提交所有字段
      const createData: PermissionCreate = {
        name: formState.name,
        display_name: formState.display_name,
        resource: formState.resource,
        action: formState.action,
        description: formState.description || undefined
      }
      
      emit('submit', createData)
    }
  } catch (error) {
    console.error('表单提交失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  formState.name = ''
  formState.display_name = ''
  formState.resource = ''
  formState.action = ''
  formState.description = ''
}

// 暴露方法
defineExpose({
  resetForm
})
</script> 