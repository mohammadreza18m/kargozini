import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface AttributeDefAttributes {
  rowId: number;
  randId: string | null;
  kindId: number;
  contextRowId: number;
  attributeName: string;
  attributeSom?: number | null;
  dataType: string;
  inputTypes?: string | null;
  displayName?: string | null;
  category?: string | null;
  description?: string | null;
  defaultValue?: unknown | null;
  validationRules?: Record<string, unknown> | null;
  isVisible?: boolean | null;
  isEditable?: boolean | null;
  isSystem?: boolean | null;
  dependsOnAttributeId?: number | null;
  dependsOnValue?: unknown | null;
  startTime?: Date | null;
  endTime?: Date | null;
}

type AttributeDefCreation = Optional<AttributeDefAttributes, 'rowId' | 'randId'>;

export class AttributeDef
  extends Model<AttributeDefAttributes, AttributeDefCreation>
  implements AttributeDefAttributes
{
  declare rowId: number;
  declare randId: string | null;
  declare kindId: number;
  declare contextRowId: number;
  declare attributeName: string;
  declare attributeSom: number | null;
  declare dataType: string;
  declare inputTypes: string | null;
  declare displayName: string | null;
  declare category: string | null;
  declare description: string | null;
  declare defaultValue: unknown | null;
  declare validationRules: Record<string, unknown> | null;
  declare isVisible: boolean | null;
  declare isEditable: boolean | null;
  declare isSystem: boolean | null;
  declare dependsOnAttributeId: number | null;
  declare dependsOnValue: unknown | null;
  declare startTime: Date | null;
  declare endTime: Date | null;
}

export function initAttributeDef(sequelize: Sequelize): typeof AttributeDef {
  AttributeDef.init(
    {
      rowId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'row_id' },
      randId: { type: DataTypes.TEXT, allowNull: true, field: 'rand_id' },
      kindId: { type: DataTypes.INTEGER, allowNull: false, field: 'kind_id' },
      contextRowId: { type: DataTypes.INTEGER, allowNull: false, field: 'context_row_id' },
      attributeName: { type: DataTypes.TEXT, allowNull: false, field: 'attribute_name' },
      attributeSom: { type: DataTypes.INTEGER, allowNull: true, field: 'attribute_som' },
      dataType: { type: DataTypes.TEXT, allowNull: false, field: 'data_type' },
      inputTypes: { type: DataTypes.TEXT, allowNull: true, field: 'input_types' },
      displayName: { type: DataTypes.TEXT, allowNull: true, field: 'display_name' },
      category: { type: DataTypes.TEXT, allowNull: true, field: 'category' },
      description: { type: DataTypes.TEXT, allowNull: true, field: 'description' },
      defaultValue: { type: DataTypes.JSONB, allowNull: true, field: 'default_value' },
      validationRules: { type: DataTypes.JSONB, allowNull: true, field: 'validation_rules' },
      isVisible: { type: DataTypes.BOOLEAN, allowNull: true, field: 'is_visible' },
      isEditable: { type: DataTypes.BOOLEAN, allowNull: true, field: 'is_editable' },
      isSystem: { type: DataTypes.BOOLEAN, allowNull: true, field: 'is_system' },
      dependsOnAttributeId: { type: DataTypes.INTEGER, allowNull: true, field: 'depends_on_attribute_id' },
      dependsOnValue: { type: DataTypes.JSONB, allowNull: true, field: 'depends_on_value' },
      startTime: { type: DataTypes.DATE, allowNull: true, field: 'start_time' },
      endTime: { type: DataTypes.DATE, allowNull: true, field: 'end_time' }
    },
    {
      sequelize,
      tableName: 'attribute_def',
      schema: 'var',
      timestamps: false
    }
  );
  return AttributeDef;
}

