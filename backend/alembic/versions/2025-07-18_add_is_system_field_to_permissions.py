"""add_is_system_field_to_permissions

Revision ID: 862a47e2e1a9
Revises: 2025_01_19_add_rbac_tables
Create Date: 2025-07-18 00:24:34.069517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '862a47e2e1a9'
down_revision: Union[str, Sequence[str], None] = '2025_01_19_add_rbac_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_system column to permissions table
    op.add_column('permissions', sa.Column('is_system', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove is_system column from permissions table
    op.drop_column('permissions', 'is_system')
