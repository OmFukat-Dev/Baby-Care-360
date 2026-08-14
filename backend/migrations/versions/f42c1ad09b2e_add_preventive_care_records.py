"""Add preventive-care record tables.

Revision ID: f42c1ad09b2e
Revises: d9e4131ea4f1
"""
from alembic import op
import sqlalchemy as sa


revision = 'f42c1ad09b2e'
down_revision = 'd9e4131ea4f1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'vaccination_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('vaccine_name', sa.String(length=120), nullable=False),
        sa.Column('dose_number', sa.Integer(), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=True),
        sa.Column('administered_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('reminder_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_vaccination_records_baby_id', 'vaccination_records', ['baby_id'])
    op.create_table(
        'polio_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('dose_date', sa.Date(), nullable=False),
        sa.Column('campaign', sa.String(length=150), nullable=True),
        sa.Column('location', sa.String(length=150), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_polio_records_baby_id', 'polio_records', ['baby_id'])
    op.create_table(
        'checkups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('baby_id', sa.Integer(), nullable=False),
        sa.Column('doctor_name', sa.String(length=120), nullable=True),
        sa.Column('clinic', sa.String(length=150), nullable=True),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('reason', sa.String(length=300), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('follow_up_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['baby_id'], ['babies.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_checkups_baby_id', 'checkups', ['baby_id'])


def downgrade():
    op.drop_index('ix_checkups_baby_id', table_name='checkups')
    op.drop_table('checkups')
    op.drop_index('ix_polio_records_baby_id', table_name='polio_records')
    op.drop_table('polio_records')
    op.drop_index('ix_vaccination_records_baby_id', table_name='vaccination_records')
    op.drop_table('vaccination_records')
