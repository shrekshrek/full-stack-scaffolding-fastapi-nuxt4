from pydantic import EmailStr
from datetime import datetime
from typing import List
from src.schemas import CustomBaseModel


# --- User Schemas ---

class UserCreate(CustomBaseModel):
    """
    Schema for user creation.
    Used for request body validation when creating a new user.
    """
    username: str
    email: EmailStr
    password: str


class UserRead(CustomBaseModel):
    """
    Schema for reading user information.
    Used for response bodies to avoid exposing sensitive data like password.
    """
    id: int
    username: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    roles: List[str] = []  # 用户的角色名称列表


# --- Token Schemas ---

class Token(CustomBaseModel):
    access_token: str
    token_type: str


class TokenData(CustomBaseModel):
    username: str | None = None


# --- Password Reset Schemas ---

class PasswordResetRequest(CustomBaseModel):
    email: EmailStr

class PasswordReset(CustomBaseModel):
    token: str
    new_password: str


class ChangePassword(CustomBaseModel):
    """修改密码请求模型"""
    current_password: str
    new_password: str

class Msg(CustomBaseModel):
    msg: str

