<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">权限详情</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">查看权限详细信息</p>
      </div>
      
      <UButton
        icon="i-heroicons-arrow-left"
        variant="outline"
        size="sm"
        @click="navigateTo('/rbac/permissions')"
      >
        返回列表
      </UButton>
    </div>

    <!-- 加载状态 -->
    <UCard v-if="pending">
      <div class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">加载权限信息中...</p>
      </div>
    </UCard>

    <!-- 错误状态 -->
    <UCard v-else-if="error">
      <div class="text-center py-8">
        <p class="text-red-500 mb-4">{{ error.message || '加载权限信息失败' }}</p>
        <UButton size="sm" @click="refresh()">重试</UButton>
      </div>
    </UCard>
    
    <!-- 权限详情 -->
    <PermissionDetail
      v-else-if="data"
      :permission="data"
      :can-edit="canEdit"
      :can-delete="canDelete"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
// 页面元数据
definePageMeta({
  title: "权限详情",
  description: "查看权限详细信息",
});

// 路由参数
const route = useRoute();
const permissionId = computed(() => Number(route.params.id));

// API 调用
const rbacApi = useRbacApi();
const { data, pending, error, refresh } = await rbacApi.getPermission(permissionId.value);

// 权限检查
const permissions = usePermissions();

const canEdit = computed(() => {
  if (!data.value) return false;
  return permissions.hasPermission('permission:write') && !data.value.is_system;
});

const canDelete = computed(() => {
  if (!data.value) return false;
  return permissions.hasPermission('permission:delete') && !data.value.is_system;
});

// 事件处理
const handleEdit = () => {
  navigateTo(`/rbac/permissions/${permissionId.value}/edit`);
};

const handleDelete = async () => {
  if (!data.value) return;
  
  const { $confirm } = useNuxtApp();
  const confirmed = await $confirm(`确定要删除权限 "${data.value.display_name}" 吗？此操作不可撤销。`);
  if (!confirmed) return;
  
  try {
    await rbacApi.deletePermission(data.value.id);
    
    // 显示成功消息
    const toast = useToast();
    toast.add({
      title: '删除成功',
      description: `权限 "${data.value.display_name}" 已被删除`,
      color: 'success'
    });
    
    navigateTo('/rbac/permissions');
  } catch {
    // 显示错误消息
    const toast = useToast();
    toast.add({
      title: '删除失败',
      description: '无法删除权限，请稍后重试',
      color: 'error'
    });
  }
};

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await refresh();
  }
});
</script> 