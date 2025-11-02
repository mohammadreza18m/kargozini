import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAttributes,
  useCreateAttribute,
  useCreateEntity,
  useCreateEntityKind,
  useDeleteAttribute,
  useDeleteEntity,
  useDeleteEntityKind,
  useEntities,
  useEntityKinds,
  useUpdateAttribute,
  useUpdateEntity,
  useUpdateEntityKind
} from '@/api/hooks';
import { DataTable } from '@/components/data-table';
import { SectionCard } from '@/components/section-card';
import { Button } from '@/components/button';
import { ListHeader } from '@/components/list-header';
import { KindModal } from '@/features/attributes/KindModal';
import { EntityModal } from '@/features/attributes/EntityModal';
import { AttributeModal } from '@/features/attributes/AttributeModal';
import { OptionsModal } from '@/features/attributes/OptionsModal';

type TabKey = 'kinds' | 'entities' | 'attributes';

interface KindFormValues {
  kindName: string;
}

interface EntityFormValues {
  kindId: number | '';
  name: string;
}

interface AttributeFormValues {
  kindId: number | '';
  contextRowId: number | '';
  name: string;
  displayName: string;
  category: string;
  dataType: 'string' | 'real' | 'date' | 'bool' | 'json';
}

export function AttributeManagementPage() {
  const [tab, setTab] = useState<TabKey>('kinds');
  const [kindSearch, setKindSearch] = useState('');
  const [entitySearch, setEntitySearch] = useState('');
  const [attrSearch, setAttrSearch] = useState('');

  // Shared lists
  const { data: kinds = [] } = useEntityKinds();

  // Tab 1: Entity Kinds
  const kindForm = useForm<KindFormValues>({});
  const createKind = useCreateEntityKind();
  const updateKind = useUpdateEntityKind();
  const deleteKind = useDeleteEntityKind();
  const [showKindModal, setShowKindModal] = useState(false);
  const [editingKind, setEditingKind] = useState<{ id: number | null; kindName: string }>({ id: null, kindName: '' });

  // Tab 2: Entities
  const [entityKindFilter, setEntityKindFilter] = useState<number | undefined>(undefined);
  const { data: entities = [] } = useEntities(entityKindFilter);
  const entityForm = useForm<EntityFormValues>({ defaultValues: { kindId: '', name: '' } });
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState<{ id: number | null; kindId: number | ''; name: string }>({ id: null, kindId: '', name: '' });

  // Tab 3: Attributes
  const [attrKindFilter, setAttrKindFilter] = useState<number | undefined>(undefined);
  const { data: attributes = [] } = useAttributes(attrKindFilter);
  const attributeForm = useForm<AttributeFormValues>({
    defaultValues: {
      kindId: '',
      contextRowId: '',
      dataType: 'string'
    }
  });
  const createAttribute = useCreateAttribute();
  const updateAttribute = useUpdateAttribute();
  const deleteAttribute = useDeleteAttribute();
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttrId, setEditingAttrId] = useState<number | null>(null);

  // When selecting kind in attribute form, load entities for context selection
  const selectedAttrKindId = attributeForm.watch('kindId');
  const { data: attrContextEntities = [] } = useEntities(
    selectedAttrKindId ? Number(selectedAttrKindId) : undefined
  );

  // Options modal state
  const [optionAttrId, setOptionAttrId] = useState<number | undefined>(undefined);
  const [optionAttrName, setOptionAttrName] = useState<string>('');
  // options data now handled inside OptionsModal

  const kindLookup = useMemo(() => {
    const m = new Map<number, string>();
    for (const k of kinds as Array<{ rowId: number; kindName: string }>) {
      if (k?.rowId != null) m.set(k.rowId, k.kindName);
    }
    return m;
  }, [kinds]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-2 shadow-sm">
        <nav className="flex gap-2">
          {(
            [
              { key: 'kinds', label: 'انواع موجودیت' },
              { key: 'entities', label: 'موجودیت‌ها' },
              { key: 'attributes', label: 'ویژگی‌ها' }
            ] as Array<{ key: TabKey; label: string }>
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              className={
                'rounded-lg px-4 py-2 text-sm ' +
                (tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700')
              }
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'kinds' ? (
        <SectionCard
          title="مدیریت انواع موجودیت"
          description="انواع کلی مانند پرسنل، واحد سازمانی و ..."
          action={<div className="w-full"><ListHeader left={<Button onClick={() => { setEditingKind({ id: null, kindName: '' }); kindForm.reset({ kindName: '' }); setShowKindModal(true); }}>افزودن نوع</Button>} searchValue={kindSearch} onSearchChange={setKindSearch} /></div>}
        >
          <DataTable
            data={(kinds as Array<{ rowId: number; kindName: string }>).filter((k) => String(k.kindName ?? '').toLowerCase().includes(kindSearch.trim().toLowerCase()))}
            columns={[
              { id: 'id', header: 'شناسه', accessor: (item) => item.rowId },
              { id: 'name', header: 'عنوان', accessor: (item) => item.kindName },
              {
                id: 'actions',
                header: 'عملیات',
                accessor: (item: any) => (
                  <div className="flex gap-2 text-xs">
                    <button
                      className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                      onClick={() => { setEditingKind({ id: item.rowId, kindName: item.kindName }); kindForm.reset({ kindName: item.kindName }); setShowKindModal(true); }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                      onClick={() =>
                        window.confirm('حذف این نوع؟') && deleteKind.mutate(item.rowId)
                      }
                    >
                      حذف
                    </button>
                  </div>
                )
              }
            ]}
          />
        </SectionCard>
      ) : null}

      {tab === 'entities' ? (
        <SectionCard
          title="مدیریت موجودیت‌ها"
          description="برای هر نوع، موجودیت‌ها را ثبت و مدیریت کنید."
          action={<div className="w-full"><ListHeader left={<Button onClick={() => { setEditingEntity({ id: null, kindId: '', name: '' }); entityForm.reset({ kindId: '', name: '' }); setShowEntityModal(true); }}>افزودن موجودیت</Button>} searchValue={entitySearch} onSearchChange={setEntitySearch} /></div>}
        >
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600">فیلتر نوع:</label>
            <select
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={entityKindFilter ?? ''}
              onChange={(e) => setEntityKindFilter(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">همه انواع</option>
              {(kinds as any[]).map((k) => (
                <option key={k.rowId} value={k.rowId}>
                  {k.kindName}
                </option>
              ))}
            </select>
          </div>
          <DataTable
            data={(entities as Array<{ rowId: number; kindId: number; name: string }>).filter((e) => String(e.name ?? '').toLowerCase().includes(entitySearch.trim().toLowerCase()))}
            columns={[
              { id: 'id', header: 'شناسه', accessor: (item) => item.rowId },
              { id: 'name', header: 'عنوان', accessor: (item) => item.name },
              {
                id: 'kind',
                header: 'نوع',
                accessor: (item: any) => kindLookup.get(item.kindId) ?? `#${item.kindId}`
              },
              {
                id: 'actions',
                header: 'عملیات',
                accessor: (item: any) => (
                  <div className="flex gap-2 text-xs">
                    <button
                      className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                      onClick={() => { setEditingEntity({ id: item.rowId, kindId: item.kindId, name: item.name }); entityForm.reset({ kindId: item.kindId, name: item.name }); setShowEntityModal(true); }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                      onClick={() => window.confirm('حذف این موجودیت؟') && deleteEntity.mutate(item.rowId)}
                    >
                      حذف
                    </button>
                  </div>
                )
              }
            ]}
          />
        </SectionCard>
      ) : null}

      {tab === 'attributes' ? (
        <SectionCard
          title="مدیریت ویژگی‌ها"
          description="تعریف ویژگی‌ها برای انواع موجودیت و مدیریت گزینه‌ها"
          action={<div className="w-full"><ListHeader left={<Button onClick={() => { setEditingAttrId(null); attributeForm.reset({ kindId: '', contextRowId: '', dataType: 'string', name: '', displayName: '', category: '' } as any); setShowAttrModal(true); }}>افزودن ویژگی</Button>} searchValue={attrSearch} onSearchChange={setAttrSearch} /></div>}
        >
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600">فیلتر نوع:</label>
            <select
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={attrKindFilter ?? ''}
              onChange={(e) => setAttrKindFilter(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">همه انواع</option>
              {(kinds as any[]).map((k) => (
                <option key={k.rowId} value={k.rowId}>
                  {k.kindName}
                </option>
              ))}
            </select>
          </div>
          <DataTable
            data={(attributes as Array<any>).filter((a: any) => [a.name, a.displayName, a.category, a.dataType].map((x: any) => String(x ?? '').toLowerCase()).some((p: string) => p.includes(attrSearch.trim().toLowerCase())))}
            columns={[
              { id: 'id', header: 'شناسه', accessor: (item) => item.rowId },
              { id: 'name', header: 'نام', accessor: (item) => item.name },
              { id: 'display', header: 'نمایشی', accessor: (item) => item.displayName ?? '—' },
              { id: 'cat', header: 'دسته', accessor: (item) => item.category ?? '—' },
              { id: 'type', header: 'نوع داده', accessor: (item) => item.dataType },
              {
                id: 'actions',
                header: 'عملیات',
                accessor: (item: any) => (
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                      onClick={() => { setEditingAttrId(item.rowId); attributeForm.reset({ kindId: item.kindId, contextRowId: item.contextRowId, name: item.name, displayName: item.displayName ?? '', category: item.category ?? '', dataType: item.dataType } as any); setShowAttrModal(true); }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="rounded-lg border border-amber-500 px-3 py-1 text-amber-600"
                      onClick={() => {
                        setOptionAttrId(item.rowId);
                        setOptionAttrName(item.displayName ?? item.name ?? '');
                      }}
                    >
                      مدیریت گزینه‌ها
                    </button>
                    <button
                      className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                      onClick={() => window.confirm('حذف این ویژگی؟') && deleteAttribute.mutate(item.rowId)}
                    >
                      حذف
                    </button>
                  </div>
                )
              }
            ]}
          />
        </SectionCard>
      ) : null}

      <OptionsModal attributeId={optionAttrId} attributeName={optionAttrName} onClose={() => setOptionAttrId(undefined)} />

      <KindModal open={showKindModal} initial={editingKind.id ? { kindName: editingKind.kindName } : undefined} onClose={() => setShowKindModal(false)} onSubmit={async (v) => { if (editingKind.id) await updateKind.mutateAsync({ id: editingKind.id, payload: v }); else await createKind.mutateAsync(v); setEditingKind({ id: null, kindName: '' }); kindForm.reset(); }} />

      <EntityModal open={showEntityModal} kinds={kinds as any} initial={editingEntity.id ? { kindId: editingEntity.kindId, name: editingEntity.name } : undefined} onClose={() => setShowEntityModal(false)} onSubmit={async (v) => { const payload = { kindId: Number(v.kindId), name: v.name }; if (!payload.kindId) { window.alert('نوع موجودیت را انتخاب کنید'); return; } if (editingEntity.id) await updateEntity.mutateAsync({ id: editingEntity.id, payload }); else await createEntity.mutateAsync(payload); setEditingEntity({ id: null, kindId: '', name: '' }); entityForm.reset({ kindId: '', name: '' }); }} />

      <AttributeModal open={showAttrModal} kinds={kinds as any} initial={editingAttrId ? { kindId: attributeForm.getValues('kindId'), contextRowId: attributeForm.getValues('contextRowId'), name: attributeForm.getValues('name'), displayName: attributeForm.getValues('displayName'), category: attributeForm.getValues('category'), dataType: attributeForm.getValues('dataType') } as any : undefined} onClose={() => setShowAttrModal(false)} onSubmit={async (v) => { const payload = { kindId: Number(v.kindId), contextRowId: Number(v.contextRowId), name: v.name, displayName: v.displayName, category: v.category, dataType: v.dataType } as any; if (!payload.kindId || !payload.contextRowId) { window.alert('نوع و موجودیت را انتخاب کنید'); return; } if (editingAttrId) await updateAttribute.mutateAsync({ id: editingAttrId, payload }); else await createAttribute.mutateAsync(payload); setEditingAttrId(null); attributeForm.reset({ kindId: '', contextRowId: '', dataType: 'string', name: '', displayName: '', category: '' } as any); }} />
    </div>
  );
}
