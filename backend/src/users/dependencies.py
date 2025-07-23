from fastapi import Depends, HTTPException, status, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from src.auth.models import User
from src.auth.dependencies import get_current_user
from src.database import get_async_db
from src.rbac.service import check_user_permission


async def require_user_read_or_self(
    user_id: Annotated[int, Path()],
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    权限检查：用户可以访问自己的信息，或者有user:read权限的用户可以访问任何用户
    """
    # 允许用户查看自己的信息
    if current_user.id == user_id:
        return current_user
    
    # 检查是否有查看用户权限
    has_permission = await check_user_permission(db, current_user.id, "user:read")
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return current_user


async def require_user_write_or_self(
    user_id: Annotated[int, Path()],
    db: AsyncSession = Depends(get_async_db),
    current_user: User = Depends(get_current_user)
) -> User:
    """
    权限检查：用户可以修改自己的信息，或者有user:write权限的用户可以修改任何用户
    """
    # 允许用户修改自己的信息
    if current_user.id == user_id:
        return current_user
    
    # 检查是否有编辑用户权限
    has_permission = await check_user_permission(db, current_user.id, "user:write")
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return current_user


async def require_user_delete_not_self(
    user_id: Annotated[int, Path()],
    current_user: User = Depends(get_current_user)
) -> User:
    """
    权限检查：不允许删除自己
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    return current_user 