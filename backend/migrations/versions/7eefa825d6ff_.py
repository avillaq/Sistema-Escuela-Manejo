"""empty message

Revision ID: 7eefa825d6ff
Revises: 1c6c1eb27c4f
Create Date: 2025-05-24 12:54:58.106230

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '7eefa825d6ff'
down_revision = '1c6c1eb27c4f'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('administradores', schema=None) as batch_op:
        batch_op.alter_column('dni',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=8),
               existing_nullable=False)
        batch_op.alter_column('telefono',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=9),
               existing_nullable=False)

    with op.batch_alter_table('alumnos', schema=None) as batch_op:
        batch_op.alter_column('dni',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=8),
               existing_nullable=False)
        batch_op.alter_column('telefono',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=9),
               existing_nullable=False)

    with op.batch_alter_table('instructores', schema=None) as batch_op:
        batch_op.alter_column('dni',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=8),
               existing_nullable=False)
        batch_op.alter_column('telefono',
               existing_type=mysql.VARCHAR(length=20),
               type_=sa.String(length=9),
               existing_nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('instructores', schema=None) as batch_op:
        batch_op.alter_column('telefono',
               existing_type=sa.String(length=9),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)
        batch_op.alter_column('dni',
               existing_type=sa.String(length=8),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)

    with op.batch_alter_table('alumnos', schema=None) as batch_op:
        batch_op.alter_column('telefono',
               existing_type=sa.String(length=9),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)
        batch_op.alter_column('dni',
               existing_type=sa.String(length=8),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)

    with op.batch_alter_table('administradores', schema=None) as batch_op:
        batch_op.alter_column('telefono',
               existing_type=sa.String(length=9),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)
        batch_op.alter_column('dni',
               existing_type=sa.String(length=8),
               type_=mysql.VARCHAR(length=20),
               existing_nullable=False)

    # ### end Alembic commands ###
