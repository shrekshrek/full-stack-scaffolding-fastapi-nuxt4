from typing import List, Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.rbac import models, schemas
from src.auth.models import User
from src.pagination import PaginationParams


class RoleAlreadyExistsException(Exception):
    pass


class RoleNotDeletableException(Exception):
    pass


class PermissionAlreadyExistsException(Exception):
    pass


class PermissionNotDeletableException(Exception):
    pass


# Permission service functions
async def get_permission_by_id(db: AsyncSession, permission_id: int) -> Optional[models.Permission]:
    """根据ID获取权限"""
    result = await db.execute(select(models.Permission).where(models.Permission.id == permission_id))
    return result.scalar_one_or_none()


async def get_permission_by_name(db: AsyncSession, name: str) -> Optional[models.Permission]:
    """根据名称获取权限"""
    result = await db.execute(select(models.Permission).where(models.Permission.name == name))
    return result.scalar_one_or_none()


async def get_permissions(db: AsyncSession, pagination: PaginationParams) -> tuple[List[models.Permission], int]:
    """获取权限列表"""
    # 获取总数
    count_result = await db.execute(select(func.count(models.Permission.id)))
    total = count_result.scalar()
    
    # 获取分页数据
    result = await db.execute(
        select(models.Permission)
        .order_by(models.Permission.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    permissions = result.scalars().all()
    
    return list(permissions), total


async def create_permission(db: AsyncSession, permission: schemas.PermissionCreate) -> models.Permission:
    """创建权限"""
    # 检查权限是否已存在
    existing = await get_permission_by_name(db, permission.name)
    if existing:
        raise PermissionAlreadyExistsException(f"Permission with name '{permission.name}' already exists")
    
    db_permission = models.Permission(**permission.dict())
    db.add(db_permission)
    await db.commit()
    await db.refresh(db_permission)
    return db_permission


async def update_permission(db: AsyncSession, permission_id: int, permission: schemas.PermissionUpdate) -> Optional[models.Permission]:
    """更新权限"""
    db_permission = await get_permission_by_id(db, permission_id)
    if not db_permission:
        return None
    
    # 系统权限只能修改显示名称和描述，不能修改核心字段
    if db_permission.is_system:
        # 只允许修改显示名称和描述
        if permission.display_name is not None:
            db_permission.display_name = permission.display_name
        if permission.description is not None:
            db_permission.description = permission.description
    else:
        # 非系统权限可以修改所有字段
        for field, value in permission.dict(exclude_unset=True).items():
            setattr(db_permission, field, value)
    
    await db.commit()
    await db.refresh(db_permission)
    return db_permission


async def delete_permission(db: AsyncSession, permission_id: int) -> bool:
    """删除权限"""
    db_permission = await get_permission_by_id(db, permission_id)
    if not db_permission:
        return False
    
    # 检查是否为系统权限
    if db_permission.is_system:
        raise PermissionNotDeletableException("System permissions cannot be deleted")
    
    await db.delete(db_permission)
    await db.commit()
    return True


# Role service functions
async def get_role_by_id(db: AsyncSession, role_id: int) -> Optional[models.Role]:
    """根据ID获取角色"""
    result = await db.execute(
        select(models.Role)
        .options(selectinload(models.Role.role_permissions).selectinload(models.RolePermission.permission))
        .where(models.Role.id == role_id)
    )
    return result.scalar_one_or_none()


async def get_role_by_name(db: AsyncSession, name: str) -> Optional[models.Role]:
    """根据名称获取角色"""
    result = await db.execute(select(models.Role).where(models.Role.name == name))
    return result.scalar_one_or_none()


async def get_roles(db: AsyncSession, pagination: PaginationParams) -> tuple[List[models.Role], int]:
    """获取角色列表"""
    # 获取总数
    count_result = await db.execute(select(func.count(models.Role.id)))
    total = count_result.scalar()
    
    # 获取分页数据
    result = await db.execute(
        select(models.Role)
        .options(selectinload(models.Role.role_permissions).selectinload(models.RolePermission.permission))
        .order_by(models.Role.created_at.desc())
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    roles = result.scalars().all()
    
    return list(roles), total


async def create_role(db: AsyncSession, role: schemas.RoleCreate) -> models.Role:
    """创建角色"""
    # 检查角色是否已存在
    existing = await get_role_by_name(db, role.name)
    if existing:
        raise RoleAlreadyExistsException(f"Role with name '{role.name}' already exists")
    
    # 创建角色
    role_data = role.dict(exclude={'permission_ids'})
    db_role = models.Role(**role_data)
    db.add(db_role)
    await db.flush()  # 获取角色ID
    
    # 添加权限关联
    for permission_id in role.permission_ids:
        role_permission = models.RolePermission(role_id=db_role.id, permission_id=permission_id)
        db.add(role_permission)
    
    await db.commit()
    await db.refresh(db_role)
    return db_role


async def update_role(db: AsyncSession, role_id: int, role: schemas.RoleUpdate) -> Optional[models.Role]:
    """更新角色"""
    db_role = await get_role_by_id(db, role_id)
    if not db_role:
        return None
    
    # 系统角色只能修改显示名称和描述，不能修改权限
    if db_role.is_system:
        # 只允许修改显示名称和描述
        if role.display_name is not None:
            db_role.display_name = role.display_name
        if role.description is not None:
            db_role.description = role.description
    else:
        # 非系统角色可以修改所有字段
        for field, value in role.dict(exclude_unset=True, exclude={'permission_ids'}).items():
            setattr(db_role, field, value)
        
        # 更新权限关联
        if role.permission_ids is not None:
            # 删除现有权限关联
            await db.execute(
                delete(models.RolePermission).where(models.RolePermission.role_id == role_id)
            )
            
            # 添加新的权限关联
            for permission_id in role.permission_ids:
                role_permission = models.RolePermission(role_id=role_id, permission_id=permission_id)
                db.add(role_permission)
    
    await db.commit()
    await db.refresh(db_role)
    return db_role


async def delete_role(db: AsyncSession, role_id: int) -> bool:
    """删除角色"""
    db_role = await get_role_by_id(db, role_id)
    if not db_role:
        return False
    
    # 检查是否为系统角色
    if db_role.is_system:
        raise RoleNotDeletableException("System roles cannot be deleted")
    
    await db.delete(db_role)
    await db.commit()
    return True


# User Role service functions
async def get_user_roles(db: AsyncSession, user_id: int) -> List[models.Role]:
    """获取用户的角色列表"""
    result = await db.execute(
        select(models.Role)
        .join(models.UserRole)
        .where(models.UserRole.user_id == user_id)
        .options(selectinload(models.Role.role_permissions).selectinload(models.RolePermission.permission))
    )
    return list(result.scalars().all())


async def assign_user_roles(db: AsyncSession, user_id: int, role_ids: List[int]) -> bool:
    """为用户分配角色"""
    # 检查用户是否存在
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return False
    
    # 删除现有角色关联
    await db.execute(
        delete(models.UserRole).where(models.UserRole.user_id == user_id)
    )
    
    # 添加新的角色关联
    for role_id in role_ids:
        user_role = models.UserRole(user_id=user_id, role_id=role_id)
        db.add(user_role)
    
    await db.commit()
    return True


async def get_user_permissions(db: AsyncSession, user_id: int) -> List[models.Permission]:
    """获取用户的所有权限"""
    result = await db.execute(
        select(models.Permission)
        .join(models.RolePermission)
        .join(models.Role)
        .join(models.UserRole)
        .where(models.UserRole.user_id == user_id)
        .distinct()
    )
    return list(result.scalars().all())


async def check_user_permission(db: AsyncSession, user_id: int, permission_name: str) -> bool:
    """检查用户是否有指定权限"""
    result = await db.execute(
        select(models.Permission)
        .join(models.RolePermission)
        .join(models.Role)
        .join(models.UserRole)
        .where(
            models.UserRole.user_id == user_id,
            models.Permission.name == permission_name
        )
    )
    return result.scalar_one_or_none() is not None


# Role Permission service functions
async def get_role_permissions(db: AsyncSession, role_id: int) -> List[models.Permission]:
    """获取角色的权限列表"""
    result = await db.execute(
        select(models.Permission)
        .join(models.RolePermission)
        .where(models.RolePermission.role_id == role_id)
        .order_by(models.Permission.created_at.desc())
    )
    return list(result.scalars().all())


async def assign_role_permissions(db: AsyncSession, role_id: int, permission_ids: List[int]) -> bool:
    """为角色分配权限（替换式）"""
    # 检查角色是否存在
    db_role = await get_role_by_id(db, role_id)
    if not db_role:
        return False
    
    # 删除现有权限关联
    await db.execute(
        delete(models.RolePermission).where(models.RolePermission.role_id == role_id)
    )
    
    # 添加新的权限关联
    for permission_id in permission_ids:
        role_permission = models.RolePermission(role_id=role_id, permission_id=permission_id)
        db.add(role_permission)
    
    await db.commit()
    return True 