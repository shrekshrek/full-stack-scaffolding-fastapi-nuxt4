import secrets
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.auth import models, schemas
from src.auth.exceptions import UserAlreadyExistsException
from src.auth.security import verify_password, pwd_context


async def get_user_by_username(db: AsyncSession, username: str):
    """
    根据用户名获取用户
    """
    result = await db.execute(select(models.User).where(models.User.username == username))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str):
    """
    根据邮箱获取用户
    """
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, username: str, password: str) -> models.User | None:
    """
    验证用户身份
    """
    user = await get_user_by_username(db, username=username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def create_user(db: AsyncSession, user: schemas.UserCreate):
    """
    创建新用户
    """
    # Check if user already exists
    db_user = await get_user_by_username(db, username=user.username)
    if db_user:
        raise UserAlreadyExistsException(f"User with username '{user.username}' already exists")
    
    db_user = await get_user_by_email(db, email=user.email)
    if db_user:
        raise UserAlreadyExistsException(f"User with email '{user.email}' already exists")

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create user instance
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )

    # Add to database
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


async def create_password_reset_token(db: AsyncSession, email: str) -> str | None:
    """
    为用户创建密码重置token
    """
    # 查找用户
    user = await get_user_by_email(db, email)
    if not user:
        return None

    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    
    # Set expiration time (1 hour from now)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    # Create token instance
    db_token = models.PasswordResetToken(
        token=token,
        user_id=user.id,
        expires_at=expires_at,
    )
    
    # Add to database
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)

    return token


async def reset_password(db: AsyncSession, token: str, new_password: str) -> bool:
    """
    使用有效token重置用户密码
    """
    # 查找重置token
    result = await db.execute(
        select(models.PasswordResetToken).where(models.PasswordResetToken.token == token)
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token or reset_token.is_used or reset_token.expires_at < datetime.utcnow():
        return False

    # 查找用户
    user_result = await db.execute(
        select(models.User).where(models.User.id == reset_token.user_id)
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        # This should not happen if DB integrity is maintained
        return False
    
    # Hash new password and update user
    hashed_password = pwd_context.hash(new_password)
    user.hashed_password = hashed_password
    
    # Mark token as used
    reset_token.is_used = True
    
    await db.commit()
    
    return True


async def change_password(db: AsyncSession, user: models.User, current_password: str, new_password: str) -> bool:
    """
    修改用户密码
    
    Args:
        db: 数据库会话
        user: 当前用户
        current_password: 当前密码
        new_password: 新密码
        
    Returns:
        bool: 修改是否成功
    """
    # 验证当前密码
    if not verify_password(current_password, user.hashed_password):
        return False
    
    # 检查新密码是否与当前密码相同
    if verify_password(new_password, user.hashed_password):
        return False
    
    # Hash new password and update user
    hashed_password = pwd_context.hash(new_password)
    user.hashed_password = hashed_password
    
    await db.commit()
    await db.refresh(user)
    
    return True
