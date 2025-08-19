# 功能设计文档：用户认证、注册与密码重置

- **版本**: `v0.1`
- **状态**: `Draft`
- **日期**: `2025-07-03`
- **负责人**: `shrek`
- **主要 AI 协作者**: `Gemini Pro`

---

## 1. 背景与目标 (Background & Goals)

### 1.1. 要解决的问题 (Problem Statement)
> 应用需要一个完整的用户生命周期管理系统，包括用户如何加入（注册）、如何恢复访问（忘记密码），以及如何登录，这是所有个性化和安全功能的基础。

### 1.2. 功能目标 (Goals)
1.  提供一个安全的登录机制，允许用户通过邮箱和密码登录。
2.  允许新用户通过邮箱和密码自行注册。
3.  为用户提供一个通过邮箱重置密码的流程。
4.  能够区分不同用户角色（为后续的用户管理功能做准备）。

### 1.3. 非目标 (Non-Goals)
- 本期不做社交媒体登录（如 Google, GitHub）。
- 本期不做复杂的邮箱验证流程（例如，注册后必须点击激活链接才能登录）。

---

## 2. AI 探索与技术选型 (AI Exploration & Tech Decisions)

### 2.1. 核心交互与方案 (Key Interactions & Solutions)
- **认证**:
    - **后端**: 使用 `passlib` 的 `bcrypt` 算法安全地哈希和验证密码。
    - **前端**: 使用 `nuxt-auth-utils` 模块来处理前端的会话状态和认证流程。
- **密码重置**:
    1.  用户在"忘记密码"页面输入邮箱。
    2.  后端生成一个有时效性的、唯一的重置令牌 (token)，并存储到数据库。
    3.  后端通过邮件服务将包含重置链接的邮件发送给用户。
- **开发环境邮件模拟**:
    - 在 `docker-compose.yml` 中集成 `MailHog` 服务，用于在本地开发时捕获和查看所有外发邮件，无需配置真实 SMTP 服务。

### 2.2. 技术风险与应对 (Tech Risks & Mitigations)
| 风险点 | 可能性 (高/中/低) | 影响程度 (高/中/低) | 应对措施 |
| :--- | :--- | :--- | :--- |
| 密码明文暴露 | 高 | 严重 | **绝不**在数据库中存储明文密码，所有密码在入库前必须使用 `bcrypt` 哈希。 |
| 邮件服务依赖 | 中 | 中 | 开发时使用 `MailHog` 解耦，生产环境需配置健壮的 SMTP 服务并做好监控。 |

---

## 3. 功能设计 (Feature Design)

### 3.1. 后端设计 (Backend Design)

#### 数据库模型 (Data Models)
*（**[阶段1 更新]** 以下为最终的 SQLAlchemy 模型结构，包含了为ORM层定义的双向关系。）*

- **`User` 模型 (`backend/src/auth/models.py`)**:
    - `id`, `username`, `email`, `hashed_password`, `role`
    - `password_reset_tokens`: 与 `PasswordResetToken` 建立的一对多关系。
- **`PasswordResetToken` 模型 (`backend/src/auth/models.py`)**:
    - `id`, `token`, `user_id` (外键), `expires_at`, `is_used`
    - `user`: 与 `User` 建立的多对一关系。

```python
# backend/src/auth/models.py - 核心结构

class User(Base):
    # ... columns ...
    password_reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(back_populates="user")

class PasswordResetToken(Base):
    # ... columns ...
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="password_reset_tokens")
```

#### API 接口定义 (API Endpoints)
- **`POST /api/auth/register`**
  - **职责**: 用户注册。
  - **请求体**: `{ "email": "...", "password": "...", "username": "..." }`
  - **成功响应**: `201 Created`
- **`POST /api/auth/forgot-password`**
  - **职责**: 发起密码重置流程，发送邮件。
  - **请求体**: `{ "email": "..." }`
  - **成功响应**: `200 OK` (为安全起见，无论邮箱是否存在都返回成功)
- **`POST /api/auth/reset-password`**
  - **职责**: 使用令牌重置密码。
  - **请求体**: `{ "token": "...", "new_password": "..." }`
  - **成功响应**: `200 OK`

### 3.2. 前端设计 (Frontend Design)

#### 核心组件 (Core Components)
- **`AuthForm.vue` (`/layers/auth/components/`)**:
  - 一个可复用的表单组件，用于登录和注册，可通过 props 控制显示的字段。

#### 页面与路由 (Pages & Routes in `layers/auth`)
- **`/login`**: 登录页。
- **`/register`**: 注册页。
- **`/forgot-password`**: 忘记密码请求页。
- **`/reset-password`**: 密码重置页 (URL中需包含token, e.g., `/reset-password?token=...`)。

---

## 4. 测试要点 (Testing Points)
- **[ ]** 用户可以使用正确的凭据成功登录。
- **[ ]** 用户可以使用错误的凭据登录失败。
- **[ ]** 新用户可以成功注册，且密码在数据库中是哈希存储的。
- **[ ]** 使用已存在的邮箱注册会失败。
- **[ ]** "忘记密码"流程能成功触发邮件发送（在 MailHog 中能看到邮件）。
- **[ ]** 用户可以点击邮件中的链接，并成功重置密码。
- **[ ]** 使用过期或已用过的令牌重置密码会失败。 