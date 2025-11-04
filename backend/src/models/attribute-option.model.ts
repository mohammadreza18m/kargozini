import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AttributeOptionAttributes {
  rowId: number;
  randId: string | null;
  attributeId: number;
  value: string | null;
}

type AttributeOptionCreation = Optional<AttributeOptionAttributes, 'rowId' | 'randId'>;

export class AttributeOption
  extends Model<AttributeOptionAttributes, AttributeOptionCreation>
  implements AttributeOptionAttributes
{
  declare rowId: number;
  declare randId: string | null;
  declare attributeId: number;
  declare value: string | null;
}

export function initAttributeOption(sequelize: Sequelize): typeof AttributeOption {
  AttributeOption.init(
    {
      rowId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'row_id' },
      randId: { type: DataTypes.TEXT, allowNull: true, field: 'rand_id' },
      attributeId: { type: DataTypes.INTEGER, allowNull: false, field: 'attribute_id' },
      value: { type: DataTypes.TEXT, allowNull: true, field: 'value' }
    },
    {
      sequelize,
      tableName: 'attribute_options',
      schema: 'var',
      timestamps: false
    }
  );
  return AttributeOption;
}

