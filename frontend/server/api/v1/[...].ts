export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const apiBase = runtimeConfig.public.apiBase
  
  // 提取路径和查询参数
  const url = event.node.req.url || ''
  const [path, queryString] = url.split('?')
  const cleanPath = path.replace(/^\/api\/v1/, '') || ''
  
  // 构建完整的后端URL
  const targetUrl = `${apiBase}${cleanPath}${queryString ? `?${queryString}` : ''}`
  
  // 获取请求方法
  const method = getMethod(event)
  
  // 准备请求头，过滤掉可能有问题的头部
  const headers: Record<string, string> = {}
  const originalHeaders = getHeaders(event)
  
  // 只复制安全的头部
  const safeHeaders = ['content-type', 'authorization', 'accept', 'user-agent']
  for (const [key, value] of Object.entries(originalHeaders)) {
    if (safeHeaders.includes(key.toLowerCase()) && typeof value === 'string') {
      headers[key] = value
    }
  }
  
  try {
    let body: string | object | undefined = undefined
    
    // 处理请求体
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = headers['content-type'] || headers['Content-Type'] || ''
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // 对于form-urlencoded数据，直接读取原始body
        body = await readRawBody(event)
      } else {
        // 对于JSON数据，正常读取
        body = await readBody(event)
      }
    }
    
    // 转发请求到后端
    const response = await $fetch(targetUrl, {
      method,
      headers,
      body,
    })
    
    return response
  } catch (error: unknown) {
    // 处理错误响应
    const errorObj = error as { status?: number; statusCode?: number; statusText?: string; statusMessage?: string; data?: unknown; message?: string }
    
    throw createError({
      statusCode: errorObj.status || errorObj.statusCode || 500,
      statusMessage: errorObj.statusText || errorObj.statusMessage || 'Internal Server Error',
      data: errorObj.data || errorObj.message || 'API request failed'
    })
  }
}) 