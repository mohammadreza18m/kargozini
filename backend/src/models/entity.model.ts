import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface EntityAttributes {
  rowId: number;
  randId: string | null;
  kindId: number;
  name: string | null;
  status?: number | null;
}

type EntityCreation = Optional<EntityAttributes, 'rowId'>;

export class Entity extends Model<EntityAttributes, EntityCreation> implements EntityAttributes {
  declare rowId: number;
  declare randId: string | null;
  declare kindId: number;
  declare name: string | null;
  declare status: number | null;
}

export function initEntity(sequelize: Sequelize): typeof Entity {
  Entity.init(
    {
      rowId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'row_id' },
      randId: { type: DataTypes.TEXT, allowNull: true, field: 'rand_id' },
      kindId: { type: DataTypes.INTEGER, allowNull: false, field: 'kind_id' },
      name: { type: DataTypes.TEXT, allowNull: true, field: 'name' },
      status: { type: DataTypes.SMALLINT, allowNull: true, field: 'status' }
    },
    {
      sequelize,
      tableName: 'entity',
      schema: 'var',
      timestamps: false
    }
  );
  return Entity;
}

