import { randomUUID } from 'crypto';
import { Op, QueryTypes } from 'sequelize';
import {
  initModels,
  sequelize,
  EntityKind,
  Entity,
  AttributeDef,
  AttributeOption,
  AttributeDependency,
  AttributeChangeLog
} from '../models';

initModels();

export class DataService {
  // Entity Kinds
  async listEntityKinds() {
    const rows = await EntityKind.findAll({ order: [["kindName", 'ASC']] });
    return rows.map((r) => ({ rowId: r.rowId, randId: r.randId, kindName: r.kindName }));
  }

  async createEntityKind(kindName: string) {
    const row = await EntityKind.create({ randId: randomUUID(), kindName });
    return { rowId: row.rowId, randId: row.randId, kindName: row.kindName };
  }

  async updateEntityKind(rowId: number, kindName: string) {
    await EntityKind.update({ kindName }, { where: { rowId } });
  }

  async deleteEntityKind(rowId: number) {
    await EntityKind.destroy({ where: { rowId } });
  }

  // Entities
  async listEntities(kindId?: number) {
    const rows = await Entity.findAll({
      where: kindId ? { kindId } : undefined,
      order: [["name", 'ASC' as const]]
    });
    return rows.map((r) => ({ rowId: r.rowId, randId: r.randId, kindId: r.kindId, name: r.name }));
  }

  async createEntity(kindId: number, name: string | null) {
    const row = await Entity.create({ randId: randomUUID(), kindId, name });
    return { rowId: row.rowId, randId: row.randId, kindId: row.kindId, name: row.name };
  }

  async updateEntity(rowId: number, kindId: number, name: string | null) {
    await Entity.update({ kindId, name }, { where: { rowId } });
  }

  async deleteEntity(rowId: number) {
    await Entity.destroy({ where: { rowId } });
  }

  // Attributes
  async listAttributes(kindId?: number) {
    const attrs = await AttributeDef.findAll({
      where: kindId ? { kindId } : undefined,
      order: [
        ['category', 'ASC NULLS LAST' as any],
        ['displayName', 'ASC NULLS LAST' as any],
        ['attributeName', 'ASC']
      ] as any
    });
    const ids = attrs.map((a) => a.rowId);
    const deps = ids.length
      ? await AttributeDependency.findAll({ where: { attributeId: { [Op.in]: ids } } })
      : [];
    return attrs.map((a) => ({
      rowId: a.rowId,
      kindId: a.kindId,
      contextRowId: a.contextRowId,
      name: a.attributeName,
      som: a.attributeSom ?? null,
      displayName: a.displayName,
      description: a.description,
      category: a.category,
      dataType: a.dataType,
      defaultValue: a.defaultValue,
      validationRules: a.validationRules as any,
      isVisible: a.isVisible ?? true,
      isEditable: a.isEditable ?? true,
      isSystem: a.isSystem ?? false,
      dependsOnAttributeId: a.dependsOnAttributeId ?? null,
      dependsOnValue: a.dependsOnValue ?? null,
      dependencies: deps
        .filter((d) => d.attributeId === a.rowId)
        .map((d) => ({
          attributeId: d.attributeId,
          dependsOnAttributeId: d.dependsOnAttributeId,
          condition: d.condition
        }))
    }));
  }

  async createAttribute(input: {
    kindId: number;
    contextRowId: number;
    name: string;
    displayName?: string | null;
    description?: string | null;
    category?: string | null;
    dataType: string;
    defaultValue?: unknown | null;
    validationRules?: Record<string, unknown> | null;
    isVisible: boolean;
    isEditable: boolean;
    isSystem: boolean;
    dependsOnAttributeId?: number | null;
    dependsOnValue?: unknown | null;
  }) {
    return await sequelize.transaction(async (t) => {
      const inserted = await AttributeDef.create(
        {
          randId: randomUUID(),
          kindId: input.kindId,
          contextRowId: input.contextRowId,
          attributeName: input.name,
          displayName: input.displayName ?? null,
          description: input.description ?? null,
          category: input.category ?? null,
          dataType: input.dataType,
          defaultValue: input.defaultValue ?? null,
          validationRules: (input.validationRules as any) ?? null,
          isVisible: input.isVisible,
          isEditable: input.isEditable,
          isSystem: input.isSystem,
          dependsOnAttributeId: input.dependsOnAttributeId ?? null,
          dependsOnValue: input.dependsOnValue ?? null
        },
        { transaction: t }
      );

      if (input.dependsOnAttributeId) {
        await AttributeDependency.upsert(
          {
            attributeId: inserted.rowId,
            dependsOnAttributeId: input.dependsOnAttributeId,
            condition: (input.dependsOnValue as any) ?? null
          },
          { transaction: t }
        );
      }

      return {
        rowId: inserted.rowId,
        kindId: inserted.kindId,
        contextRowId: inserted.contextRowId,
        name: inserted.attributeName,
        displayName: inserted.displayName,
        description: inserted.description,
        category: inserted.category,
        dataType: inserted.dataType,
        defaultValue: inserted.defaultValue,
        validationRules: inserted.validationRules as any,
        isVisible: inserted.isVisible ?? true,
        isEditable: inserted.isEditable ?? true,
        isSystem: inserted.isSystem ?? false,
        dependsOnAttributeId: inserted.dependsOnAttributeId ?? null,
        dependsOnValue: inserted.dependsOnValue ?? null,
        dependencies: input.dependsOnAttributeId
          ? [
              {
                attributeId: inserted.rowId,
                dependsOnAttributeId: input.dependsOnAttributeId,
                condition: (input.dependsOnValue as Record<string, unknown>) ?? null
              }
            ]
          : []
      };
    });
  }

  async updateAttribute(attributeId: number, input: Partial<{
    displayName: string | null;
    description: string | null;
    category: string | null;
    dataType: string | null;
    defaultValue: unknown | null;
    validationRules: Record<string, unknown> | null;
    isVisible: boolean | null;
    isEditable: boolean | null;
    isSystem: boolean | null;
    dependsOnAttributeId: number | null;
    dependsOnValue: unknown | null;
  }>) {
    await sequelize.transaction(async (t) => {
      await AttributeDef.update(
        {
          displayName: input.displayName ?? undefined,
          description: input.description ?? undefined,
          category: input.category ?? undefined,
          dataType: input.dataType ?? undefined,
          defaultValue: input.defaultValue ?? undefined,
          validationRules: (input.validationRules as any) ?? undefined,
          isVisible: input.isVisible ?? undefined,
          isEditable: input.isEditable ?? undefined,
          isSystem: input.isSystem ?? undefined,
          dependsOnAttributeId: input.dependsOnAttributeId ?? undefined,
          dependsOnValue: input.dependsOnValue ?? undefined
        },
        { where: { rowId: attributeId }, transaction: t }
      );

      if (input.dependsOnAttributeId !== undefined || input.dependsOnValue !== undefined) {
        if (input.dependsOnAttributeId) {
          await AttributeDependency.upsert(
            {
              attributeId,
              dependsOnAttributeId: input.dependsOnAttributeId,
              condition: (input.dependsOnValue as any) ?? null
            },
            { transaction: t }
          );
        } else {
          await AttributeDependency.destroy({ where: { attributeId }, transaction: t });
        }
      }
    });
  }

  async upsertDependency(attributeId: number, dependsOnAttributeId: number, condition: any) {
    await AttributeDependency.upsert({ attributeId, dependsOnAttributeId, condition });
  }

  async listAttributeCategories(): Promise<string[]> {
    const rows = await AttributeDef.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { category: { [Op.not]: null } },
      order: [['category', 'ASC']]
    });
    return rows.map((r: any) => r.get('category')).filter(Boolean);
  }

  async getAttributeHistory(attributeId: number, entityId: number) {
    const rows = await AttributeChangeLog.findAll({
      where: { attributeId, entityId },
      order: [['changedAt', 'DESC']]
    });
    return rows.map((r) => ({
      value: r.newValue,
      startTime: null,
      endTime: null,
      changedAt: r.changedAt.toISOString(),
      changedBy: r.changedBy
    }));
  }

  async listAttributeOptions(attributeId: number) {
    const rows = await AttributeOption.findAll({ where: { attributeId }, order: [['rowId', 'ASC']] });
    return rows.map((r) => ({ rowId: r.rowId, attributeId: r.attributeId, value: r.value, randId: r.randId }));
  }

  async createAttributeOption(attributeId: number, value: string) {
    const row = await AttributeOption.create({ randId: randomUUID(), attributeId, value });
    return { rowId: row.rowId, attributeId: row.attributeId, value: row.value, randId: row.randId };
  }

  async updateAttributeOption(optionId: number, value: string) {
    await AttributeOption.update({ value }, { where: { rowId: optionId } });
  }

  async deleteAttributeOption(optionId: number) {
    await AttributeOption.destroy({ where: { rowId: optionId } });
  }

  async deleteAttribute(attributeId: number) {
    await AttributeDef.destroy({ where: { rowId: attributeId } });
  }
}

export const dataService = new DataService();

