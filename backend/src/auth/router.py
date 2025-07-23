from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import schemas, service, models
from src.auth.dependencies import get_current_user
from src.database import get_async_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED, summary="Register new user")
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_async_db)):
    """
    Register a new user.
    """
    try:
        db_user = await service.create_user(db=db, user=user)
        
        # TODO: 发送欢迎邮件 (暂时禁用)
        # send_welcome_email.delay(db_user.email, db_user.username)
        print(f"用户注册成功: {db_user.email}")
        
        return db_user
    except service.UserAlreadyExistsException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/token", response_model=schemas.Token, status_code=status.HTTP_200_OK, summary="User login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_async_db)):
    """
    Login and get an access token.
    """
    user = await service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = service.create_access_token(subject=user.username)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout", response_model=schemas.Msg, status_code=status.HTTP_200_OK, summary="User logout")
async def logout(current_user: schemas.UserRead = Depends(get_current_user)):
    """
    Logout and invalidate the current token.
    """
    # In a real application, you would add the token to a blacklist.
    # For now, we'll just return a success message.
    return {"msg": "Successfully logged out"}


@router.post("/request-password-reset", response_model=schemas.Msg, status_code=status.HTTP_200_OK, summary="Request password reset")
async def request_password_reset(
    request: schemas.PasswordResetRequest, db: AsyncSession = Depends(get_async_db)
):
    """
    Request a password reset. Sends an email with a reset token.
    """
    token = await service.create_password_reset_token(db=db, email=request.email)
    
    # TODO: 发送密码重置邮件 (暂时禁用)
    if token:
        print(f"密码重置token生成: {request.email} -> {token}")
        print(f"重置链接: http://localhost:3000/reset-password?token={token}")
        # send_password_reset_email.delay(request.email, token)
    
    # Always return a success message to prevent user enumeration.
    return {"msg": "If an account with that email exists, a password reset link has been sent."}


@router.post("/reset-password", response_model=schemas.Msg, status_code=status.HTTP_200_OK, summary="Reset password")
async def reset_password_endpoint(
    request: schemas.PasswordReset, db: AsyncSession = Depends(get_async_db)
):
    """
    Reset password with a valid token.
    """
    success = await service.reset_password(
        db=db, token=request.token, new_password=request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token.",
        )
    return {"msg": "Password has been reset successfully."}


@router.post("/change-password", response_model=schemas.Msg, status_code=status.HTTP_200_OK, summary="Change password")
async def change_password_endpoint(
    request: schemas.ChangePassword,
    db: AsyncSession = Depends(get_async_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Change user password with current password verification.
    """
    success = await service.change_password(
        db=db,
        user=current_user,
        current_password=request.current_password,
        new_password=request.new_password
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect or new password is the same as current password.",
        )
    return {"msg": "Password has been changed successfully."}
