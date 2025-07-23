from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.auth.models import User
from src.database import get_async_db
from src.rbac import schemas, service
from src.rbac.dependencies import (
    require_role_read,
    require_role_write,
    require_role_delete,
    require_permission_read,
    require_permission_write,
    require_permission_delete,
    get_current_user_permissions,
    get_current_user_roles
)
from src.pagination import get_pagination_params, PaginationParams

router = APIRouter(
    prefix="/rbac",
    tags=["RBAC"],
)

# Permission endpoints
@router.get("/permissions", response_model=schemas.PermissionListResponse, status_code=status.HTTP_200_OK, summary="Get permissions list")
async def get_permissions(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_permission_read)
):
    """
    获取权限列表
    """
    permissions, total = await service.get_permissions(db, pagination)
    return schemas.PermissionListResponse.create(
        items=permissions,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.post("/permissions", response_model=schemas.PermissionRead, status_code=status.HTTP_201_CREATED, summary="Create permission")
async def create_permission(
    permission: schemas.PermissionCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_permission_write)
):
    """
    创建权限
    """
    try:
        db_permission = await service.create_permission(db, permission)
        return db_permission
    except service.PermissionAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/permissions/{permission_id}", response_model=schemas.PermissionRead, status_code=status.HTTP_200_OK, summary="Get permission by ID")
async def get_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_permission_read)
):
    """
    根据ID获取权限
    """
    permission = await service.get_permission_by_id(db, permission_id)
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    return permission


@router.put("/permissions/{permission_id}", response_model=schemas.PermissionRead, status_code=status.HTTP_200_OK, summary="Update permission")
async def update_permission(
    permission_id: int,
    permission: schemas.PermissionUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_permission_write)
):
    """
    更新权限
    """
    db_permission = await service.update_permission(db, permission_id, permission)
    if not db_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Permission not found"
        )
    return db_permission


@router.delete("/permissions/{permission_id}", response_model=schemas.PermissionRead, status_code=status.HTTP_200_OK, summary="Delete permission")
async def delete_permission(
    permission_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_permission_delete)
):
    """
    删除权限
    """
    try:
        # 先获取要删除的权限信息
        db_permission = await service.get_permission_by_id(db, permission_id)
        if not db_permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found"
            )
        
        # 构造返回数据
        permission_data = schemas.PermissionRead(
            id=db_permission.id,
            name=db_permission.name,
            display_name=db_permission.display_name,
            description=db_permission.description,
            resource=db_permission.resource,
            action=db_permission.action,
            is_system=db_permission.is_system,
            created_at=db_permission.created_at
        )
        
        # 执行删除操作
        success = await service.delete_permission(db, permission_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found"
            )
        
        # 返回被删除的权限信息
        return permission_data
    except service.PermissionNotDeletableException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Role endpoints
@router.get("/roles", response_model=schemas.RoleListResponse, status_code=status.HTTP_200_OK, summary="Get roles list")
async def get_roles(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_read)
):
    """
    获取角色列表
    """
    roles, total = await service.get_roles(db, pagination)
    
    # 转换为响应格式
    role_items = []
    for role in roles:
        permissions = [rp.permission for rp in role.role_permissions]
        role_data = schemas.RoleRead(
            id=role.id,
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            is_system=role.is_system,
            created_at=role.created_at,
            updated_at=role.updated_at,
            permissions=permissions
        )
        role_items.append(role_data)
    
    return schemas.RoleListResponse.create(
        items=role_items,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size
    )


@router.post("/roles", response_model=schemas.RoleRead, status_code=status.HTTP_201_CREATED, summary="Create role")
async def create_role(
    role: schemas.RoleCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_write)
):
    """
    创建角色
    """
    try:
        db_role = await service.create_role(db, role)
        
        # 重新获取角色信息（包含权限）
        db_role = await service.get_role_by_id(db, db_role.id)
        permissions = [rp.permission for rp in db_role.role_permissions]
        
        return schemas.RoleRead(
            id=db_role.id,
            name=db_role.name,
            display_name=db_role.display_name,
            description=db_role.description,
            is_system=db_role.is_system,
            created_at=db_role.created_at,
            updated_at=db_role.updated_at,
            permissions=permissions
        )
    except service.RoleAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/roles/{role_id}", response_model=schemas.RoleRead, status_code=status.HTTP_200_OK, summary="Get role by ID")
async def get_role(
    role_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_read)
):
    """
    根据ID获取角色
    """
    role = await service.get_role_by_id(db, role_id)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    permissions = [rp.permission for rp in role.role_permissions]
    return schemas.RoleRead(
        id=role.id,
        name=role.name,
        display_name=role.display_name,
        description=role.description,
        is_system=role.is_system,
        created_at=role.created_at,
        updated_at=role.updated_at,
        permissions=permissions
    )


@router.put("/roles/{role_id}", response_model=schemas.RoleRead, status_code=status.HTTP_200_OK, summary="Update role")
async def update_role(
    role_id: int,
    role: schemas.RoleUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_write)
):
    """
    更新角色
    """
    db_role = await service.update_role(db, role_id, role)
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # 重新获取角色信息（包含权限）
    db_role = await service.get_role_by_id(db, role_id)
    permissions = [rp.permission for rp in db_role.role_permissions]
    
    return schemas.RoleRead(
        id=db_role.id,
        name=db_role.name,
        display_name=db_role.display_name,
        description=db_role.description,
        is_system=db_role.is_system,
        created_at=db_role.created_at,
        updated_at=db_role.updated_at,
        permissions=permissions
    )


@router.delete("/roles/{role_id}", response_model=schemas.RoleRead, status_code=status.HTTP_200_OK, summary="Delete role")
async def delete_role(
    role_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_delete)
):
    """
    删除角色
    """
    try:
        # 先获取要删除的角色信息（包含权限）
        db_role = await service.get_role_by_id(db, role_id)
        if not db_role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # 构造返回数据
        permissions = [rp.permission for rp in db_role.role_permissions]
        role_data = schemas.RoleRead(
            id=db_role.id,
            name=db_role.name,
            display_name=db_role.display_name,
            description=db_role.description,
            is_system=db_role.is_system,
            created_at=db_role.created_at,
            updated_at=db_role.updated_at,
            permissions=permissions
        )
        
        # 执行删除操作
        success = await service.delete_role(db, role_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )
        
        # 返回被删除的角色信息
        return role_data
    except service.RoleNotDeletableException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# Role Permission endpoints
@router.get("/roles/{role_id}/permissions", response_model=List[schemas.PermissionRead], status_code=status.HTTP_200_OK, summary="Get role permissions")
async def get_role_permissions(
    role_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_read)
):
    """
    获取角色的权限列表
    """
    permissions = await service.get_role_permissions(db, role_id)
    return permissions


@router.post("/roles/{role_id}/permissions", response_model=schemas.RolePermissionResponse, status_code=status.HTTP_200_OK, summary="Assign permissions to role")
async def assign_role_permissions(
    role_id: int,
    permission_assign: schemas.RolePermissionAssign,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_write)
):
    """
    为角色分配权限（替换式）
    """
    success = await service.assign_role_permissions(db, role_id, permission_assign.permission_ids)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return schemas.RolePermissionResponse(message="Permissions assigned successfully")


# User Role endpoints
@router.post("/users/{user_id}/roles", response_model=schemas.UserRoleResponse, status_code=status.HTTP_200_OK, summary="Assign roles to user")
async def assign_user_roles(
    user_id: int,
    role_assign: schemas.UserRoleAssign,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_write)
):
    """
    为用户分配角色
    """
    success = await service.assign_user_roles(db, user_id, role_assign.role_ids)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return schemas.UserRoleResponse(message="Roles assigned successfully")


@router.get("/users/{user_id}/roles", response_model=List[schemas.RoleRead], status_code=status.HTTP_200_OK, summary="Get user roles")
async def get_user_roles(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_read)
):
    """
    获取用户的角色列表
    """
    roles = await service.get_user_roles(db, user_id)
    
    # 转换为响应格式
    role_items = []
    for role in roles:
        permissions = [rp.permission for rp in role.role_permissions]
        role_data = schemas.RoleRead(
            id=role.id,
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            is_system=role.is_system,
            created_at=role.created_at,
            updated_at=role.updated_at,
            permissions=permissions
        )
        role_items.append(role_data)
    
    return role_items


@router.get("/users/{user_id}/permissions", response_model=List[schemas.PermissionRead], status_code=status.HTTP_200_OK, summary="Get user permissions")
async def get_user_permissions(
    user_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(require_role_read)
):
    """
    获取用户的所有权限
    """
    permissions = await service.get_user_permissions(db, user_id)
    return permissions


# Current user endpoints
@router.get("/me/permissions", response_model=List[str], status_code=status.HTTP_200_OK, summary="Get current user permissions")
async def get_my_permissions(
    permissions: List[str] = Depends(get_current_user_permissions)
):
    """
    获取当前用户的权限列表
    """
    return permissions


@router.get("/me/roles", response_model=List[dict], status_code=status.HTTP_200_OK, summary="Get current user roles")
async def get_my_roles(
    roles: List[dict] = Depends(get_current_user_roles)
):
    """
    获取当前用户的角色列表
    """
    return roles 