from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import status

from src.auth.router import router as auth_router
from src.users.router import router as users_router
from src.rbac.router import router as rbac_router
from src.config import settings
from src.middleware import (
    RequestLoggingMiddleware,
    GlobalExceptionHandlerMiddleware,
    SecurityHeadersMiddleware
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for the full-stack starter project.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


# 响应模型定义
class HealthResponse(BaseModel):
    status: str
    service: str


class RootResponse(BaseModel):
    message: str
    version: str

# 添加中间件（注意顺序很重要）
# 1. 安全头中间件
app.add_middleware(SecurityHeadersMiddleware)

# 2. 全局异常处理中间件
app.add_middleware(GlobalExceptionHandlerMiddleware)

# 3. 请求日志中间件
app.add_middleware(RequestLoggingMiddleware)

# 4. CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 健康检查端点
@app.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK, tags=["Health"], summary="Health check")
async def health_check():
    """健康检查端点"""
    return HealthResponse(
        status="healthy",
        service="Full-Stack Starter API"
    )

# 根路径
@app.get("/", response_model=RootResponse, status_code=status.HTTP_200_OK, tags=["Root"], summary="Root endpoint")
async def read_root():
    """根路径欢迎信息"""
    return RootResponse(
        message=f"Welcome to the {settings.PROJECT_NAME}",
        version=settings.VERSION
    )

# API路由
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(rbac_router, prefix=settings.API_PREFIX)

# Here we will include routers from different modules
# For example:
# from .auth.router import router as auth_router
# app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"]) 