"""Add Posts and Search_Agents

Revision ID: 3e8cfcda1fea
Revises: 49741479e87e
Create Date: 2016-08-16 18:10:39.581000

"""

# revision identifiers, used by Alembic.
revision = '3e8cfcda1fea'
down_revision = '49741479e87e'

from alembic import op
import sqlalchemy as sa


def upgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.create_table('posts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('post_title', sa.String(), nullable=True),
    sa.Column('post_description', sa.String(), nullable=True),
    sa.Column('post_images', sa.String(), nullable=True),
    sa.Column('post_date', sa.String(), nullable=True),
    sa.Column('post_price', sa.Integer(), nullable=True),
    sa.Column('post_author', sa.String(), nullable=True),
    sa.Column('post_zip', sa.Integer(), nullable=True),
    sa.Column('post_city', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('search_agents',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('agent_keywords', sa.String(), nullable=False),
    sa.Column('agent_active', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    ### end Alembic commands ###


def downgrade():
    ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('search_agents')
    op.drop_table('posts')
    ### end Alembic commands ###
