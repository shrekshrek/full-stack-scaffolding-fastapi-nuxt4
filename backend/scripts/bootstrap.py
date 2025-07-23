#!/usr/bin/env python3
"""
项目启动脚本 (Bootstrap Script)
用于初始化项目所需的基础数据

功能：
- 初始化 RBAC 权限和角色数据
- 创建默认管理员用户
- 项目首次部署时的数据准备
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import AsyncSessionLocal
from src.rbac.init_data import init_rbac_data
from src.rbac import service as rbac_service
from src.auth import service as auth_service
from src.auth import schemas as auth_schemas


async def create_admin_user(db: AsyncSession) -> None:
    """创建默认管理员用户"""
    print("Creating admin user...")
    
    # 检查管理员用户是否已存在
    admin_user = await auth_service.get_user_by_username(db, "admin")
    if admin_user:
        print("✅ Admin user already exists")
        return
    
    # 创建管理员用户
    admin_data = auth_schemas.UserCreate(
        username="admin",
        email="admin@example.com",
        password="admin123"
    )
    
    try:
        admin_user = await auth_service.create_user(db, admin_data)
        print(f"✅ Created admin user: {admin_user.username}")
        
        # 获取超级管理员角色
        super_admin_role = await rbac_service.get_role_by_name(db, "super_admin")
        if super_admin_role:
            # 为管理员分配超级管理员角色
            await rbac_service.assign_user_roles(db, admin_user.id, [super_admin_role.id])
            print("✅ Assigned super_admin role to admin user")
        else:
            print("⚠️  Warning: super_admin role not found")
            
    except auth_service.UserAlreadyExistsException:
        print("ℹ️  Admin user already exists")


async def bootstrap_project():
    """启动项目初始化流程"""
    print("🚀 Starting project bootstrap...")
    print("=" * 50)
    
    async with AsyncSessionLocal() as db:
        try:
            # 步骤1: 初始化 RBAC 数据
            print("📋 Step 1: Initializing RBAC data...")
            await init_rbac_data(db)
            
            # 步骤2: 创建管理员用户
            print("\n👤 Step 2: Creating admin user...")
            await create_admin_user(db)
            
            print("\n" + "=" * 50)
            print("🎉 Project bootstrap completed successfully!")
            print("\n📖 Next steps:")
            print("   1. Start the development server: pnpm be:dev")
            print("   2. Access API docs: http://localhost:8000/docs")
            print("   3. Login with admin/admin123")
            
        except Exception as e:
            print(f"\n❌ Error during bootstrap: {e}")
            print("💡 Please check your database connection and try again.")
            raise


if __name__ == "__main__":
    asyncio.run(bootstrap_project()) 