import asyncio

from src.celery_app import celery_app
from src.auth.email import email_service


@celery_app.task
def send_welcome_email(user_email: str, username: str):
    """
    发送欢迎邮件给新用户
    """
    print(f"开始发送欢迎邮件给 {user_email}...")
    
    # 在Celery任务中运行异步函数
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        success = loop.run_until_complete(
            email_service.send_welcome_email(user_email, username)
        )
        
        if success:
            print(f"欢迎邮件发送成功: {user_email}")
            return {"status": "success", "email": user_email}
        else:
            print(f"欢迎邮件发送失败: {user_email}")
            return {"status": "failed", "email": user_email}
            
    except Exception as e:
        print(f"欢迎邮件发送异常: {e}")
        return {"status": "error", "email": user_email, "error": str(e)}
    finally:
        loop.close()


@celery_app.task
def send_password_reset_email(user_email: str, token: str):
    """
    发送密码重置邮件
    """
    print(f"开始发送密码重置邮件给 {user_email}...")
    
    # 在Celery任务中运行异步函数
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        success = loop.run_until_complete(
            email_service.send_password_reset_email(user_email, token)
        )
        
        if success:
            print(f"密码重置邮件发送成功: {user_email}")
            return {"status": "success", "email": user_email}
        else:
            print(f"密码重置邮件发送失败: {user_email}")
            return {"status": "failed", "email": user_email}
            
    except Exception as e:
        print(f"密码重置邮件发送异常: {e}")
        return {"status": "error", "email": user_email, "error": str(e)}
    finally:
        loop.close() 