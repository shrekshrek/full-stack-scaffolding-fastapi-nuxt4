<script setup lang="ts">
import { useAuthApi } from '../composables/useAuthApi';

const { requestPasswordReset } = useAuthApi();
const loading = ref(false);
const success = ref(false);

const state = reactive({
  email: '',
});

const validate = (state: { email: string }) => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: '邮箱地址不能为空' })
  if (state.email && !state.email.includes('@')) errors.push({ path: 'email', message: '请输入有效的邮箱地址' })
  return errors
}

const onSubmit = async () => {
  loading.value = true
  try {
    await requestPasswordReset({ email: state.email })
    success.value = true
  } catch (error) {
    console.error('Password reset request failed:', error)
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  },
});
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">忘记密码？</h2>
      <p class="text-gray-600 mt-2">输入您的邮箱地址，我们将发送重置链接给您</p>
    </div>

    <div v-if="success" class="text-center space-y-6">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-900">邮件已发送</h3>
        <p class="text-gray-600 mt-2">
          如果该邮箱地址存在对应的账户，我们已经发送了密码重置链接。
          请检查您的邮箱。
        </p>
      </div>
      <div class="pt-4">
        <NuxtLink 
          to="/login" 
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          返回登录
        </NuxtLink>
      </div>
    </div>
    
    <UForm 
      v-else 
      :state="state" 
      :validate="validate" 
      class="space-y-6" 
      @submit="onSubmit"
    >
      <UFormField label="邮箱地址" name="email">
        <UInput 
          v-model="state.email" 
          type="email" 
          placeholder="请输入您的邮箱地址"
          size="lg"
          required 
        />
      </UFormField>

      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="loading"
        class="mt-8"
      >
        发送重置链接
      </UButton>
    </UForm>

    <div v-if="!success" class="mt-8 text-center">
      <div class="text-sm text-gray-600">
        记起密码了？
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
          立即登录
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 