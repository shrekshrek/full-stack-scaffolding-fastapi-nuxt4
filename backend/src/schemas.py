"""
通用Schema定义
包含所有模块共用的基础数据结构
"""
from typing import Generic, List, TypeVar
from pydantic import BaseModel, Field

# 泛型类型变量，用于分页响应
T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """统一的分页响应格式
    
    标准格式：
    {
        "items": [...],      // 数据项数组
        "total": 100,        // 总记录数
        "page": 1,           // 当前页码
        "page_size": 10      // 每页大小
    }
    """
    items: List[T] = Field(..., description="数据项列表")
    total: int = Field(..., description="总记录数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页大小")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        page_size: int
    ) -> "PaginatedResponse[T]":
        """创建分页响应"""
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size
        )


class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str = Field(..., description="响应消息") 