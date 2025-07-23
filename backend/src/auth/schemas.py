from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List


# --- User Schemas ---

class UserCreate(BaseModel):
    """
    Schema for user creation.
    Used for request body validation when creating a new user.
    """
    username: str
    email: EmailStr
    password: str


class UserRead(BaseModel):
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

    class Config:
        from_attributes = True


# --- Token Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


# --- Password Reset Schemas ---

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str


class ChangePassword(BaseModel):
    """修改密码请求模型"""
    current_password: str
    new_password: str

class Msg(BaseModel):
    msg: str

