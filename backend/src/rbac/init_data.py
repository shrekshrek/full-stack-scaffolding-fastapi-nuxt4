"""
RBAC 初始化数据脚本
用于创建基础的权限和角色数据
"""

from sqlalchemy.ext.asyncio import AsyncSession
from src.rbac import models, service, schemas

# 系统级权限（不可删除）
SYSTEM_PERMISSIONS = [
    'user:read',
    'user:write', 
    'user:delete',
    'role:read',
    'role:write',
    'role:delete',
    'permission:read',
    'permission:write',
    'permission:delete'
]

# 系统级角色（不可删除）
SYSTEM_ROLES = [
    'super_admin',  # 拥有所有权限
    'admin',        # 拥有管理权限
    'user'          # 基础用户权限
]

# 基础权限定义
BASE_PERMISSIONS = [
    # 用户管理权限（系统级）
    {
        "name": "user:read",
        "display_name": "查看用户",
        "resource": "user",
        "action": "read",
        "description": "查看用户信息",
        "is_system": True
    },
    {
        "name": "user:write",
        "display_name": "编辑用户",
        "resource": "user",
        "action": "write",
        "description": "创建和编辑用户信息",
        "is_system": True
    },
    {
        "name": "user:delete",
        "display_name": "删除用户",
        "resource": "user",
        "action": "delete",
        "description": "删除用户",
        "is_system": True
    },
    
    # 角色管理权限（系统级）
    {
        "name": "role:read",
        "display_name": "查看角色",
        "resource": "role",
        "action": "read",
        "description": "查看角色信息",
        "is_system": True
    },
    {
        "name": "role:write",
        "display_name": "编辑角色",
        "resource": "role",
        "action": "write",
        "description": "创建和编辑角色",
        "is_system": True
    },
    {
        "name": "role:delete",
        "display_name": "删除角色",
        "resource": "role",
        "action": "delete",
        "description": "删除角色",
        "is_system": True
    },
    
    # 权限管理权限（系统级）
    {
        "name": "permission:read",
        "display_name": "查看权限",
        "resource": "permission",
        "action": "read",
        "description": "查看权限信息",
        "is_system": True
    },
    {
        "name": "permission:write",
        "display_name": "编辑权限",
        "resource": "permission",
        "action": "write",
        "description": "创建和编辑权限",
        "is_system": True
    },
    {
        "name": "permission:delete",
        "display_name": "删除权限",
        "resource": "permission",
        "action": "delete",
        "description": "删除权限",
        "is_system": True
    },
    
    # 页面访问权限
    {
        "name": "page:dashboard",
        "display_name": "访问工作台",
        "resource": "page",
        "action": "access",
        "description": "访问工作台页面",
        "is_system": False  # 工作台是业务展示，非RBAC核心
    },
    {
        "name": "page:users",
        "display_name": "访问用户管理",
        "resource": "page",
        "action": "access",
        "description": "访问用户管理页面",
        "is_system": True   # 用户管理是RBAC核心功能
    },
    {
        "name": "page:roles",
        "display_name": "访问角色管理",
        "resource": "page",
        "action": "access",
        "description": "访问角色管理页面",
        "is_system": True   # 角色管理是RBAC核心功能
    },
    {
        "name": "page:permissions",
        "display_name": "访问权限管理",
        "resource": "page",
        "action": "access",
        "description": "访问权限管理页面",
        "is_system": True   # 权限管理是RBAC核心功能
    },
]

# 基础角色定义
BASE_ROLES = [
    {
        "name": "super_admin",
        "display_name": "超级管理员",
        "description": "超级管理员，拥有所有权限",
        "is_system": True,
        "permissions": [
            "user:read", "user:write", "user:delete",
            "role:read", "role:write", "role:delete",
            "permission:read", "permission:write", "permission:delete",
            "page:dashboard", "page:users", "page:roles", "page:permissions"
        ]
    },
    {
        "name": "admin",
        "display_name": "管理员",
        "description": "系统管理员，拥有管理权限",
        "is_system": True,
        "permissions": [
            "user:read", "user:write", "user:delete",
            "role:read", "role:write",
            "permission:read",
            "page:dashboard", "page:users", "page:roles", "page:permissions"
        ]
    },
    {
        "name": "user",
        "display_name": "普通用户",
        "description": "普通用户，只能访问基础功能",
        "is_system": True,
        "permissions": [
            "page:dashboard"
        ]
    }
]


async def init_permissions(db: AsyncSession) -> dict[str, models.Permission]:
    """初始化权限数据"""
    permissions = {}
    
    for perm_data in BASE_PERMISSIONS:
        # 检查权限是否已存在
        existing = await service.get_permission_by_name(db, perm_data["name"])
        if existing:
            # 更新现有权限的is_system字段
            existing.is_system = perm_data["is_system"]
            await db.commit()
            await db.refresh(existing)
            permissions[perm_data["name"]] = existing
            continue
        
        # 创建新权限
        try:
            permission = await service.create_permission(
                db, 
                schemas.PermissionCreate(**perm_data)
            )
            permissions[perm_data["name"]] = permission
            print(f"Created permission: {perm_data['name']}")
        except service.PermissionAlreadyExistsException:
            # 如果在并发情况下权限已被创建，重新获取
            existing = await service.get_permission_by_name(db, perm_data["name"])
            permissions[perm_data["name"]] = existing
    
    return permissions


async def init_roles(db: AsyncSession, permissions: dict[str, models.Permission]) -> dict[str, models.Role]:
    """初始化角色数据"""
    roles = {}
    
    for role_data in BASE_ROLES:
        # 检查角色是否已存在
        existing = await service.get_role_by_name(db, role_data["name"])
        if existing:
            roles[role_data["name"]] = existing
            continue
        
        # 获取权限ID列表
        permission_ids = []
        for perm_name in role_data["permissions"]:
            if perm_name in permissions:
                permission_ids.append(permissions[perm_name].id)
        
        # 创建角色
        try:
            role_create_data = {
                "name": role_data["name"],
                "display_name": role_data["display_name"],
                "description": role_data["description"],
                "permission_ids": permission_ids
            }
            
            role = await service.create_role(
                db, 
                schemas.RoleCreate(**role_create_data)
            )
            
            # 设置系统角色标志
            if role_data["is_system"]:
                role.is_system = True
                await db.commit()
                await db.refresh(role)
            
            roles[role_data["name"]] = role
            print(f"Created role: {role_data['name']}")
        except service.RoleAlreadyExistsException:
            # 如果在并发情况下角色已被创建，重新获取
            existing = await service.get_role_by_name(db, role_data["name"])
            roles[role_data["name"]] = existing
    
    return roles


async def init_rbac_data(db: AsyncSession) -> None:
    """初始化RBAC数据"""
    print("Initializing RBAC data...")
    
    # 初始化权限
    permissions = await init_permissions(db)
    print(f"Initialized {len(permissions)} permissions")
    
    # 初始化角色
    roles = await init_roles(db, permissions)
    print(f"Initialized {len(roles)} roles")
    
    print("RBAC data initialization completed!") 