import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from typing import List, Optional

from src.config import settings


class EmailService:
    """邮件发送服务"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        发送邮件
        
        Args:
            to_emails: 收件人邮箱列表
            subject: 邮件主题
            html_content: HTML内容
            text_content: 纯文本内容（可选）
            
        Returns:
            bool: 发送是否成功
        """
        try:
            # 创建邮件消息
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = ", ".join(to_emails)

            # 添加纯文本内容
            if text_content:
                text_part = MIMEText(text_content, "plain", "utf-8")
                message.attach(text_part)

            # 添加HTML内容
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)

            # 发送邮件
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username if self.smtp_username else None,
                password=self.smtp_password if self.smtp_password else None,
                use_tls=False,  # MailHog 不使用TLS
                start_tls=False,  # MailHog 不使用STARTTLS
            )
            
            print(f"邮件发送成功: {subject} -> {to_emails}")
            return True
            
        except Exception as e:
            print(f"邮件发送失败: {e}")
            return False

    async def send_password_reset_email(self, email: str, token: str) -> bool:
        """
        发送密码重置邮件
        
        Args:
            email: 用户邮箱
            token: 重置token
            
        Returns:
            bool: 发送是否成功
        """
        # 构建重置链接
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        
        # HTML邮件模板
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>密码重置</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: #4f46e5; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>密码重置</h1>
                </div>
                <div class="content">
                    <p>您好！</p>
                    <p>您请求重置您的密码。请点击下面的按钮来重置您的密码：</p>
                    <p style="text-align: center;">
                        <a href="{{ reset_url }}" class="button">重置密码</a>
                    </p>
                    <p>如果按钮不起作用，您也可以复制以下链接到浏览器中：</p>
                    <p style="word-break: break-all; background: #eee; padding: 10px;">{{ reset_url }}</p>
                    <p><strong>注意：</strong>此链接将在1小时后过期。</p>
                    <p>如果您没有请求重置密码，请忽略此邮件。</p>
                </div>
                <div class="footer">
                    <p>© 2024 全栈项目脚手架. 保留所有权利。</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        # 纯文本版本
        text_content = f"""
        密码重置

        您好！

        您请求重置您的密码。请访问以下链接来重置您的密码：

        {reset_url}

        注意：此链接将在1小时后过期。

        如果您没有请求重置密码，请忽略此邮件。

        © 2024 全栈项目脚手架. 保留所有权利。
        """
        
        # 渲染HTML内容
        html_content = html_template.render(reset_url=reset_url)
        
        # 发送邮件
        return await self.send_email(
            to_emails=[email],
            subject="密码重置 - 全栈项目脚手架",
            html_content=html_content,
            text_content=text_content
        )

    async def send_welcome_email(self, email: str, username: str) -> bool:
        """
        发送欢迎邮件
        
        Args:
            email: 用户邮箱
            username: 用户名
            
        Returns:
            bool: 发送是否成功
        """
        # HTML邮件模板
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>欢迎加入</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>欢迎加入！</h1>
                </div>
                <div class="content">
                    <p>亲爱的 {{ username }}，</p>
                    <p>欢迎加入全栈项目脚手架！您的账户已成功创建。</p>
                    <p>您现在可以使用您的账户登录并开始使用我们的服务。</p>
                    <p>如果您有任何问题，请随时联系我们。</p>
                    <p>祝您使用愉快！</p>
                </div>
                <div class="footer">
                    <p>© 2024 全栈项目脚手架. 保留所有权利。</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        # 纯文本版本
        text_content = f"""
        欢迎加入！

        亲爱的 {username}，

        欢迎加入全栈项目脚手架！您的账户已成功创建。

        您现在可以使用您的账户登录并开始使用我们的服务。

        如果您有任何问题，请随时联系我们。

        祝您使用愉快！

        © 2024 全栈项目脚手架. 保留所有权利。
        """
        
        # 渲染HTML内容
        html_content = html_template.render(username=username)
        
        # 发送邮件
        return await self.send_email(
            to_emails=[email],
            subject="欢迎加入 - 全栈项目脚手架",
            html_content=html_content,
            text_content=text_content
        )


# 全局邮件服务实例
email_service = EmailService() 