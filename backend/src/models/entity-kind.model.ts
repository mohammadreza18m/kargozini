import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface EntityKindAttributes {
  rowId: number;
  randId: string | null;
  kindName: string | null;
}

type EntityKindCreation = Optional<EntityKindAttributes, 'rowId'>;

export class EntityKind extends Model<EntityKindAttributes, EntityKindCreation> implements EntityKindAttributes {
  declare rowId: number;
  declare randId: string | null;
  declare kindName: string | null;
}

export function initEntityKind(sequelize: Sequelize): typeof EntityKind {
  EntityKind.init(
    {
      rowId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'row_id' },
      randId: { type: DataTypes.TEXT, allowNull: true, field: 'rand_id' },
      kindName: { type: DataTypes.TEXT, allowNull: true, unique: false, field: 'kind_name' }
    },
    {
      sequelize,
      tableName: 'entity_kind',
      schema: 'var',
      timestamps: false
    }
  );
  return EntityKind;
}

