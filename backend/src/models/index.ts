import { sequelize } from '../db/sequelize';
import { initEntityKind, EntityKind } from './entity-kind.model';
import { initEntity, Entity } from './entity.model';
import { initAttributeDef, AttributeDef } from './attribute-def.model';
import { initAttributeOption, AttributeOption } from './attribute-option.model';
import { initAttributeDependency, AttributeDependency } from './attribute-dependency.model';
import { initAttributeChangeLog, AttributeChangeLog } from './attribute-change-log.model';

let initialized = false;

export function initModels(): void {
  if (initialized) return;

  initEntityKind(sequelize);
  initEntity(sequelize);
  initAttributeDef(sequelize);
  initAttributeOption(sequelize);
  initAttributeDependency(sequelize);
  initAttributeChangeLog(sequelize);

  // Associations
  Entity.belongsTo(EntityKind, { foreignKey: 'kindId', targetKey: 'rowId' });
  AttributeOption.belongsTo(AttributeDef, { foreignKey: 'attributeId', targetKey: 'rowId' });
  AttributeDependency.belongsTo(AttributeDef, { foreignKey: 'attributeId', targetKey: 'rowId', as: 'attribute' });
  AttributeDependency.belongsTo(AttributeDef, {
    foreignKey: 'dependsOnAttributeId',
    targetKey: 'rowId',
    as: 'dependsOn'
  });

  initialized = true;
}

export { sequelize };
export { EntityKind, Entity, AttributeDef, AttributeOption, AttributeDependency, AttributeChangeLog };

