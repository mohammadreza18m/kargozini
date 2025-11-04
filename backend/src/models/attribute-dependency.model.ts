import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AttributeDependencyAttributes {
  rowId: number;
  attributeId: number;
  dependsOnAttributeId: number;
  condition: Record<string, unknown> | null;
}

type AttributeDependencyCreation = Optional<AttributeDependencyAttributes, 'rowId'>;

export class AttributeDependency
  extends Model<AttributeDependencyAttributes, AttributeDependencyCreation>
  implements AttributeDependencyAttributes
{
  declare rowId: number;
  declare attributeId: number;
  declare dependsOnAttributeId: number;
  declare condition: Record<string, unknown> | null;
}

export function initAttributeDependency(sequelize: Sequelize): typeof AttributeDependency {
  AttributeDependency.init(
    {
      rowId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'row_id' },
      attributeId: { type: DataTypes.INTEGER, allowNull: false, field: 'attribute_id' },
      dependsOnAttributeId: { type: DataTypes.INTEGER, allowNull: false, field: 'depends_on_attribute_id' },
      condition: { type: DataTypes.JSONB, allowNull: true, field: 'condition' }
    },
    {
      sequelize,
      tableName: 'attribute_dependencies',
      schema: 'var',
      timestamps: false
    }
  );
  return AttributeDependency;
}

