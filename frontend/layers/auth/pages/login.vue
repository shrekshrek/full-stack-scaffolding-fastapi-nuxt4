<template>
  <div>
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900">登录</h2>
      <p class="text-gray-600 mt-2">请登录您的账户</p>
    </div>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleLogin"
    >
      <UFormField label="用户名" name="username">
        <UInput
          v-model="state.username"
          type="text"
          placeholder="请输入用户名"
          size="lg"
          required
        />
      </UFormField>

      <UFormField label="密码" name="password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="请输入密码"
          size="lg"
          required
        />
      </UFormField>

      <UButton type="submit" block size="lg" :loading="isLoading" class="mt-6">
        {{ isLoading ? "登录中..." : "登录" }}
      </UButton>
    </UForm>

    <div class="mt-8 text-center space-y-4">
      <NuxtLink
        to="/request-password-reset"
        class="text-sm text-blue-600 hover:text-blue-500 block"
      >
        忘记密码？
      </NuxtLink>
      <div class="text-sm text-gray-600">
        还没有账户？
        <NuxtLink
          to="/register"
          class="text-blue-600 hover:text-blue-500 font-medium"
        >
          立即注册
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

definePageMeta({
  layout: "auth",
  // 认证保护已由全局认证守卫处理，无需重复定义
});

const { signIn } = useAuth();
const toast = useToast();
const isLoading = ref(false);

const schema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(6, "密码至少需要6位"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  username: "",
  password: "",
});

async function handleLogin(event: FormSubmitEvent<Schema>) {
  isLoading.value = true;
  try {
    // 修正：直接调用 signIn，不使用其返回值来判断错误
    await signIn("credentials", {
      username: event.data.username,
      password: event.data.password,
      redirect: false, // 关键：我们自己处理重定向和错误
    });

    // signIn 成功后，useAuth() 的状态会更新
    const { status } = useAuth();

    // 检查认证状态来判断是否成功
    if (status.value === "authenticated") {
      toast.add({
        title: "登录成功",
        description: "即将跳转到工作台...",
        color: "success",
      });
      // 使用 await 确保导航完成后再执行后续操作
      await navigateTo("/dashboard");
    } else {
      // 如果没有重定向且状态不是 authenticated，则表示失败
      throw new Error("Authentication failed");
    }
  } catch (error) {
    // 统一的错误处理
    toast.add({
      title: "登录失败",
      description: "用户名或密码错误，请重试。",
      color: "error",
    });
    console.error("Login error:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>
