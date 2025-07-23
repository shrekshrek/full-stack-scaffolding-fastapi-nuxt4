interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'error' | 'info' | 'success'
}

declare module '#app' {
  interface NuxtApp {
    $confirm: (options: ConfirmOptions | string) => Promise<boolean>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $confirm: (options: ConfirmOptions | string) => Promise<boolean>
  }
}

export {} 