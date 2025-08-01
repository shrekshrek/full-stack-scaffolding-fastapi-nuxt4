# 全栈脚手架：FastAPI + Nuxt 4

这是一个功能强大、开箱即用的全栈Web应用脚手架，基于 **FastAPI (后端)** 和 **Nuxt 4 (前端)** 构建。它旨在为需要快速启动新项目的开发者提供一个坚实、现代化的起点。

[![在 Gitpod 中打开](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt3)

---

## ✨ 核心特性

-   **现代化技术栈**:
    -   **后端**: FastAPI, PostgreSQL, SQLAlchemy (异步), Celery, Redis
    -   **前端**: Nuxt 4, Vue 3, Pinia, `@nuxt/ui`, Tailwind CSS
-   **完全容器化**: 使用 Docker 和 Docker Compose 提供一致、可复现的开发与生产环境。
-   **动态RBAC权限系统**:
    -   通过UI界面动态管理角色和权限，无需修改代码。
    -   前端 `usePermissions` 组合式函数和 `<PermissionGuard>` 组件，轻松实现细粒度权限控制。
-   **Nuxt Layers 架构**: 前端采用领域驱动设计，模块化、可扩展性强。
-   **统一的API与错误处理**: 全局 `useApi` 组合式函数，简化API调用，自动处理加载状态、错误和认证。
-   **类型安全**: 从数据库到API，再到前端组件，全程使用 TypeScript 和 Pydantic，提供端到端的类型安全。
-   **清晰的工作流与部署方案**: 提供了从开发到部署的完整文档和脚本。

---

## 🚀 快速开始

### 1. 环境准备

-   安装 [Docker](https://www.docker.com/products/docker-desktop/) 和 [pnpm](https://pnpm.io/installation)。
-   克隆本项目：`git clone https://github.com/shrekshrek/full-stack-scaffolding-fastapi-nuxt3.git`
-   进入项目目录：`cd full-stack-scaffolding-fastapi-nuxt3`

### 2. 初始化设置

1.  **复制环境变量文件**:
    ```bash
    cp .env.example .env
    cp frontend/.env.example frontend/.env
    ```
2.  **一键安装与构建**:
    ```bash
    pnpm setup
    ```
    *此命令会安装所有前后端依赖，并首次构建 Docker 镜像。*

### 3. 启动开发环境

执行以下命令，一键启动所有服务：

```bash
pnpm dev
```

启动后：
-   **前端应用** 访问: `http://localhost:3000`
-   **后端API文档** 访问: `http://localhost:8000/docs`
-   **邮件服务 (MailHog)** 访问: `http://localhost:8025`

---

## 📚 主要命令

所有命令都应在项目**根目录**下执行。

| 命令 | 描述 |
| :--- | :--- |
| `pnpm setup` | **首次安装**：安装所有依赖并预构建Docker镜像。|
| `pnpm dev` | **日常开发**：一键启动整个开发环境。 |
| `pnpm stop` | **停止服务**：停止并移除所有开发容器。 |

### 后端命令 (`be:*`)

| 命令 | 描述 |
| :--- | :--- |
| `pnpm be:install` | 安装后端的 Python 依赖。 |
| `pnpm be:add <包名>` | 向后端添加一个新的 Python 依赖。 |
| `pnpm be:migrate:make "<信息>"` | **(常用)** 生成一个新的数据库迁移脚本。 |
| `pnpm be:migrate:up` | **(常用)** 应用所有数据库迁移。 |
| `pnpm be:shell` | 进入正在运行的后端容器的 Shell 环境。 |

### 生产部署命令 (`prod:*`)

| 命令 | 描述 |
| :--- | :--- |
| `pnpm build` | 构建用于生产环境的前后端 Docker 镜像。 |
| `pnpm prod:deploy`| **(推荐)** 执行部署脚本，在生产服务器上启动应用。|
| `pnpm prod:up` | 在生产模式下（后台）启动所有服务。 |
| `pnpm prod:down`| 停止并移除所有生产模式下的服务。 |

---

## 🧭 深入了解

想要更深入地理解本项目的设计和工作流程？请查阅以下文档：

-   **部署指南**: [`DEPLOYMENT.md`](./DEPLOYMENT.md) - **(必读)** 获取生产环境部署、配置和维护的详细步骤。
-   **开发工作流**: [`docs/WORKFLOW.md`](./docs/WORKFLOW.md) - 了解如何从零开始开发一个新功能。
-   **前端架构**: [`docs/frontend-architecture.md`](./docs/frontend-architecture.md) - 深入理解前端 Nuxt Layers 架构。
-   **后端架构**: [`docs/backend-architecture.md`](./docs/backend-architecture.md) - 深入理解后端 FastAPI 模块化设计。
-   **动态权限系统**: [`docs/dynamic-rbac-guide.md`](./docs/dynamic-rbac-guide.md) - 学习如何使用和管理动态权限。
-   **权限工作流**: [`docs/rbac-workflow-guide.md`](./docs/rbac-workflow-guide.md) - 理解动态权限的开发模式。 