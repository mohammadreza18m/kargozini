import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AttributeChangeLogAttributes {
  rowId: string; // BIGSERIAL can exceed 32-bit; keep as string for safety
  attributeId: number;
  entityId: number;
  oldValue: unknown | null;
  newValue: unknown | null;
  changedBy: string | null;
  changedAt: Date;
}

type AttributeChangeLogCreation = Optional<AttributeChangeLogAttributes, 'rowId'>;

export class AttributeChangeLog
  extends Model<AttributeChangeLogAttributes, AttributeChangeLogCreation>
  implements AttributeChangeLogAttributes
{
  declare rowId: string;
  declare attributeId: number;
  declare entityId: number;
  declare oldValue: unknown | null;
  declare newValue: unknown | null;
  declare changedBy: string | null;
  declare changedAt: Date;
}

export function initAttributeChangeLog(sequelize: Sequelize): typeof AttributeChangeLog {
  AttributeChangeLog.init(
    {
      rowId: { type: DataTypes.BIGINT, primaryKey: true, field: 'row_id' },
      attributeId: { type: DataTypes.INTEGER, allowNull: false, field: 'attribute_id' },
      entityId: { type: DataTypes.INTEGER, allowNull: false, field: 'entity_id' },
      oldValue: { type: DataTypes.JSONB, allowNull: true, field: 'old_value' },
      newValue: { type: DataTypes.JSONB, allowNull: true, field: 'new_value' },
      changedBy: { type: DataTypes.TEXT, allowNull: true, field: 'changed_by' },
      changedAt: { type: DataTypes.DATE, allowNull: false, field: 'changed_at' }
    },
    {
      sequelize,
      tableName: 'attribute_change_log',
      schema: 'var',
      timestamps: false
    }
  );
  return AttributeChangeLog;
}

