"""empty message

Revision ID: 653da9dc491a
Revises: a89901aa7e1b
Create Date: 2025-05-20 02:14:44.291087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '653da9dc491a'
down_revision = 'a89901aa7e1b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('alumnos',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('id_usuario', sa.Integer(), nullable=True),
    sa.Column('nombre', sa.String(length=100), nullable=False),
    sa.Column('apellidos', sa.String(length=100), nullable=False),
    sa.Column('dni', sa.String(length=20), nullable=False),
    sa.Column('telefono', sa.String(length=20), nullable=False),
    sa.Column('email', sa.String(length=100), nullable=True),
    sa.Column('categoria', sa.String(length=10), nullable=False),
    sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('dni'),
    sa.UniqueConstraint('id_usuario')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('alumnos')
    # ### end Alembic commands ###
