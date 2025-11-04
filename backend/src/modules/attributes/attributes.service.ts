import { query } from '../../db/pool';
import { withTransaction } from '../../db/transaction';
import { dataService } from '../../dataservices/data-service';
import type {
  AttributeCreateInput,
  AttributeUpdateInput,
  DependencyInput,
  EntityCreateInput,
  EntityKindCreateInput
} from './attributes.schemas';

export interface AttributeDependency {
  attributeId: number;
  dependsOnAttributeId: number;
  condition: Record<string, unknown> | null;
}

export interface AttributeRecord {
  rowId: number;
  kindId: number;
  contextRowId: number;
  name: string;
  displayName: string | null;
  description: string | null;
  category: string | null;
  dataType: string;
  defaultValue: unknown;
  validationRules: Record<string, unknown> | null;
  isVisible: boolean;
  isEditable: boolean;
  isSystem: boolean;
  dependsOnAttributeId: number | null;
  dependsOnValue: unknown;
  dependencies: AttributeDependency[];
}

export async function listAttributes(kindId?: number): Promise<AttributeRecord[]> {
  return (await dataService.listAttributes(kindId)) as unknown as AttributeRecord[];
}

export async function createAttribute(input: AttributeCreateInput): Promise<AttributeRecord> {
  return (await dataService.createAttribute({
    kindId: input.kindId,
    contextRowId: input.contextRowId,
    name: input.name,
    displayName: input.displayName,
    description: input.description,
    category: input.category,
    dataType: input.dataType,
    defaultValue: input.defaultValue,
    validationRules: input.validationRules as any,
    isVisible: input.isVisible,
    isEditable: input.isEditable,
    isSystem: input.isSystem,
    dependsOnAttributeId: input.dependsOnAttributeId,
    dependsOnValue: input.dependsOnValue
  })) as unknown as AttributeRecord;
}

export async function updateAttribute(
  attributeId: number,
  input: AttributeUpdateInput
): Promise<void> {
  await dataService.updateAttribute(attributeId, input as any);
}

export async function upsertDependency(input: DependencyInput): Promise<void> {
  await dataService.upsertDependency(input.attributeId, input.dependsOnAttributeId, input.condition ?? null);
}

export async function listAttributeCategories(): Promise<string[]> {
  return dataService.listAttributeCategories();
}

export interface AttributeHistoryRecord {
  value: unknown;
  startTime: string | null;
  endTime: string | null;
  changedAt: string;
  changedBy: string | null;
}

export async function getAttributeHistory(
  attributeId: number,
  entityId: number
): Promise<AttributeHistoryRecord[]> {
  return (await dataService.getAttributeHistory(attributeId, entityId)) as unknown as AttributeHistoryRecord[];
}

export interface EntityKindRecord {
  rowId: number;
  randId: string | null;
  kindName: string | null;
}

export async function listEntityKinds(): Promise<EntityKindRecord[]> {
  return (await dataService.listEntityKinds()) as unknown as EntityKindRecord[];
}

export async function createEntityKind(input: EntityKindCreateInput): Promise<EntityKindRecord> {
  return (await dataService.createEntityKind(input.kindName)) as unknown as EntityKindRecord;
}

export async function updateEntityKind(rowId: number, input: EntityKindCreateInput): Promise<void> {
  await dataService.updateEntityKind(rowId, input.kindName);
}

export async function deleteEntityKind(rowId: number): Promise<void> {
  await dataService.deleteEntityKind(rowId);
}

export interface EntityRecord {
  rowId: number;
  randId: string | null;
  kindId: number;
  name: string | null;
}

export async function listEntities(kindId?: number): Promise<EntityRecord[]> {
  return (await dataService.listEntities(kindId)) as unknown as EntityRecord[];
}

export async function createEntity(input: EntityCreateInput): Promise<EntityRecord> {
  return (await dataService.createEntity(input.kindId, input.name)) as unknown as EntityRecord;
}

export interface AttributeOptionRecord {
  rowId: number;
  attributeId: number;
  value: string | null;
  randId: string | null;
}

export async function listAttributeOptions(attributeId: number): Promise<AttributeOptionRecord[]> {
  return (await dataService.listAttributeOptions(attributeId)) as unknown as AttributeOptionRecord[];
}

export async function createAttributeOption(attributeId: number, value: string): Promise<AttributeOptionRecord> {
  return (await dataService.createAttributeOption(attributeId, value)) as unknown as AttributeOptionRecord;
}

export async function updateAttributeOption(optionId: number, value: string): Promise<void> {
  await dataService.updateAttributeOption(optionId, value);
}

export async function deleteAttributeOption(optionId: number): Promise<void> {
  await dataService.deleteAttributeOption(optionId);
}

export async function deleteAttribute(attributeId: number): Promise<void> {
  await dataService.deleteAttribute(attributeId);
}

export async function updateEntity(rowId: number, input: EntityCreateInput): Promise<void> {
  await dataService.updateEntity(rowId, input.kindId, input.name);
}

export async function deleteEntity(rowId: number): Promise<void> {
  await dataService.deleteEntity(rowId);
}
