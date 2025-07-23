from pydantic import BaseModel, EmailStr
from typing import Optional
from src.auth.schemas import UserRead
from src.schemas import PaginatedResponse


class UserUpdate(BaseModel):
    """用户更新模型"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None


# 使用统一的分页响应格式
UserListResponse = PaginatedResponse[UserRead] 