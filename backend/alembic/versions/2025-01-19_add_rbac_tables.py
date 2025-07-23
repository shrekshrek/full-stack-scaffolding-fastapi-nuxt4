"""add rbac tables

Revision ID: 2025_01_19_add_rbac_tables
Revises: 2025-07-03_create_user_and_password_reset_token_
Create Date: 2025-01-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '2025_01_19_add_rbac_tables'
down_revision = 'b188292b5463'
branch_labels = None
depends_on = None


def upgrade():
    # Create roles table
    op.create_table('roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=50), nullable=False),
    sa.Column('display_name', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('is_system', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_roles')),
    sa.UniqueConstraint('name', name=op.f('uq_roles_name'))
    )
    op.create_index(op.f('ix_roles_name'), 'roles', ['name'], unique=False)
    
    # Create permissions table
    op.create_table('permissions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('display_name', sa.String(length=100), nullable=False),
    sa.Column('resource', sa.String(length=50), nullable=False),
    sa.Column('action', sa.String(length=50), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_permissions')),
    sa.UniqueConstraint('name', name=op.f('uq_permissions_name'))
    )
    op.create_index(op.f('ix_permissions_name'), 'permissions', ['name'], unique=False)
    
    # Create role_permissions table
    op.create_table('role_permissions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('permission_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], name=op.f('fk_role_permissions_permission_id_permissions')),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('fk_role_permissions_role_id_roles')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_role_permissions'))
    )
    
    # Create user_roles table
    op.create_table('user_roles',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('role_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['role_id'], ['roles.id'], name=op.f('fk_user_roles_role_id_roles')),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_roles_user_id_users')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_user_roles'))
    )
    
    # 删除 users 表的 role 字段
    op.drop_column('users', 'role')
    
    # 数据迁移：创建基础角色和权限
    connection = op.get_bind()
    
    # 创建基础权限
    connection.execute(text("""
        INSERT INTO permissions (name, display_name, resource, action, description, created_at, updated_at)
        VALUES 
        ('user:read', '查看用户', 'user', 'read', '查看用户信息', now(), now()),
        ('user:write', '编辑用户', 'user', 'write', '创建和编辑用户信息', now(), now()),
        ('user:delete', '删除用户', 'user', 'delete', '删除用户', now(), now()),
        ('role:read', '查看角色', 'role', 'read', '查看角色信息', now(), now()),
        ('role:manage', '管理角色', 'role', 'manage', '创建、编辑、删除角色', now(), now()),
        ('permission:read', '查看权限', 'permission', 'read', '查看权限信息', now(), now()),
        ('permission:manage', '管理权限', 'permission', 'manage', '创建、编辑、删除权限', now(), now()),
        ('page:dashboard', '访问工作台', 'page', 'access', '访问工作台页面', now(), now()),
        ('page:users', '访问用户管理', 'page', 'access', '访问用户管理页面', now(), now()),
        ('page:roles', '访问角色管理', 'page', 'access', '访问角色管理页面', now(), now()),
        ('page:permissions', '访问权限管理', 'page', 'access', '访问权限管理页面', now(), now())
        ON CONFLICT (name) DO NOTHING
    """))
    
    # 创建基础角色
    connection.execute(text("""
        INSERT INTO roles (name, display_name, description, is_system, created_at, updated_at)
        VALUES 
        ('admin', '管理员', '系统管理员，拥有所有权限', true, now(), now()),
        ('user', '普通用户', '普通用户，只能访问基础功能', true, now(), now())
        ON CONFLICT (name) DO NOTHING
    """))
    
    # 为管理员角色分配所有权限
    connection.execute(text("""
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, now()
        FROM roles r
        CROSS JOIN permissions p
        WHERE r.name = 'admin'
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    """))
    
    # 为普通用户角色分配基础权限
    connection.execute(text("""
        INSERT INTO role_permissions (role_id, permission_id, created_at)
        SELECT r.id, p.id, now()
        FROM roles r
        JOIN permissions p ON p.name = 'page:dashboard'
        WHERE r.name = 'user'
        AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp 
            WHERE rp.role_id = r.id AND rp.permission_id = p.id
        )
    """))
    
    # 为所有现有用户分配默认的 user 角色
    connection.execute(text("""
        INSERT INTO user_roles (user_id, role_id, created_at)
        SELECT 
            u.id, 
            r.id, 
            now()
        FROM users u
        CROSS JOIN roles r
        WHERE r.name = 'user'
        AND NOT EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = u.id AND ur.role_id = r.id
        )
    """))


def downgrade():
    # 恢复 users 表的 role 字段
    op.add_column('users', sa.Column('role', sa.String(length=50), nullable=True, default='user'))
    
    # 从 user_roles 表恢复数据到 users.role 字段
    connection = op.get_bind()
    connection.execute(text("""
        UPDATE users 
        SET role = r.name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE users.id = ur.user_id
    """))
    
    # 设置默认值
    connection.execute(text("""
        UPDATE users SET role = 'user' WHERE role IS NULL
    """))
    
    # 设置字段为非空
    op.alter_column('users', 'role', nullable=False)
    
    # Drop tables in reverse order
    op.drop_table('user_roles')
    op.drop_table('role_permissions')
    op.drop_index(op.f('ix_permissions_name'), table_name='permissions')
    op.drop_table('permissions')
    op.drop_index(op.f('ix_roles_name'), table_name='roles')
    op.drop_table('roles') 