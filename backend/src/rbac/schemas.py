from pydantic import Field
from typing import Optional, List
from datetime import datetime
from src.schemas import CustomBaseModel, PaginatedResponse


# Permission schemas
class PermissionBase(CustomBaseModel):
    name: str = Field(..., description="权限名称，如：user:read, page:dashboard")
    display_name: str = Field(..., description="权限显示名称")
    resource: str = Field(..., description="资源类型，如：user, page, system")
    action: str = Field(..., description="操作类型，如：read, write, delete, access")
    description: Optional[str] = Field(None, description="权限描述")


class PermissionCreate(PermissionBase):
    is_system: bool = Field(default=False, description="是否为系统权限（不可删除）")


class PermissionUpdate(CustomBaseModel):
    display_name: Optional[str] = Field(None, description="权限显示名称")
    resource: Optional[str] = Field(None, description="资源类型")
    action: Optional[str] = Field(None, description="操作类型")
    description: Optional[str] = Field(None, description="权限描述")


class PermissionRead(PermissionBase):
    id: int
    is_system: bool
    created_at: datetime
    updated_at: datetime


# Role schemas
class RoleBase(CustomBaseModel):
    name: str = Field(..., description="角色名称")
    display_name: str = Field(..., description="角色显示名称")
    description: Optional[str] = Field(None, description="角色描述")


class RoleCreate(RoleBase):
    permission_ids: List[int] = Field(default=[], description="权限ID列表")


class RoleUpdate(CustomBaseModel):
    display_name: Optional[str] = Field(None, description="角色显示名称")
    description: Optional[str] = Field(None, description="角色描述")
    permission_ids: Optional[List[int]] = Field(None, description="权限ID列表")


class RoleRead(RoleBase):
    id: int
    is_system: bool
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionRead] = Field(default=[], description="角色拥有的权限列表")


# User Role schemas
class UserRoleAssign(CustomBaseModel):
    role_ids: List[int] = Field(..., description="要分配的角色ID列表")


# Role Permission schemas
class RolePermissionAssign(CustomBaseModel):
    permission_ids: List[int] = Field(..., description="要分配的权限ID列表")


# Response schemas
class UserRoleResponse(CustomBaseModel):
    """用户角色响应模型"""
    message: str


class RolePermissionResponse(CustomBaseModel):
    """角色权限响应模型"""
    message: str


# 使用统一的分页响应格式
RoleListResponse = PaginatedResponse[RoleRead]
PermissionListResponse = PaginatedResponse[PermissionRead] 