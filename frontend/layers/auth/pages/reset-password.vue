<script setup lang="ts">
import { useAuthApi } from '~/layers/auth/composables/useAuthApi';

const route = useRoute();
const router = useRouter();
const { resetPassword } = useAuthApi();

const loading = ref(false);
const token = route.query.token as string;

const state = reactive({
  password: '',
  passwordConfirm: '',
});

const validate = (state: { password: string; passwordConfirm: string }) => {
  const errors = []
  if (!state.password) errors.push({ path: 'password', message: '密码不能为空' })
  if (!state.passwordConfirm) errors.push({ path: 'passwordConfirm', message: '确认密码不能为空' })
  if (state.password && state.password.length < 8) errors.push({ path: 'password', message: '密码至少需要8个字符' })
  if (state.password !== state.passwordConfirm) errors.push({ path: 'passwordConfirm', message: '两次输入的密码不匹配' })
  return errors
}

const onSubmit = async () => {
  if (!token) {
    const { showWarning } = useApi()
    showWarning('无效的重置令牌')
    return;
  }

  loading.value = true;
  try {
    await resetPassword({
      token,
      new_password: state.password
    });
    await router.push('/login');
  } catch (error) {
    console.error('Password reset failed:', error);
  } finally {
    loading.value = false;
  }
}

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  },
})
</script>

<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">重置密码</h2>
      <p class="text-gray-600 mt-2">请输入您的新密码</p>
    </div>

    <UForm :state="state" :validate="validate" class="space-y-6" @submit="onSubmit">
      <div class="grid grid-cols-1 gap-6">
        <UFormField label="新密码" name="password">
          <UInput 
            v-model="state.password" 
            type="password" 
            placeholder="请输入新密码"
            size="lg"
            required 
          />
        </UFormField>
        
        <UFormField label="确认新密码" name="passwordConfirm">
          <UInput 
            v-model="state.passwordConfirm" 
            type="password" 
            placeholder="请再次输入新密码"
            size="lg"
            required 
          />
        </UFormField>
      </div>

      <div v-if="!token" class="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
        无效或缺失的重置令牌。
      </div>

      <UButton 
        type="submit" 
        block 
        size="lg"
        :loading="loading" 
        :disabled="!token"
        class="mt-8"
      >
        重置密码
      </UButton>
    </UForm>

    <div class="mt-8 text-center">
      <div class="text-sm text-gray-600">
        记起密码了？
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-500 font-medium">
          立即登录
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 