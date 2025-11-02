import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAttributeOptions,
  useAttributes,
  useCreateAttribute,
  useCreateAttributeOption,
  useCreateEntity,
  useCreateEntityKind,
  useDeleteAttribute,
  useDeleteAttributeOption,
  useDeleteEntity,
  useDeleteEntityKind,
  useEntities,
  useEntityKinds,
  useUpdateAttribute,
  useUpdateAttributeOption,
  useUpdateEntity,
  useUpdateEntityKind
} from '@/api/hooks';
import { DataTable } from '@/components/data-table';
import { SectionCard } from '@/components/section-card';

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

  // Shared lists
  const { data: kinds = [] } = useEntityKinds();

  // Tab 1: Entity Kinds
  const kindForm = useForm<KindFormValues>({});
  const createKind = useCreateEntityKind();
  const updateKind = useUpdateEntityKind();
  const deleteKind = useDeleteEntityKind();

  // Tab 2: Entities
  const [entityKindFilter, setEntityKindFilter] = useState<number | undefined>(undefined);
  const { data: entities = [] } = useEntities(entityKindFilter);
  const entityForm = useForm<EntityFormValues>({ defaultValues: { kindId: '', name: '' } });
  const createEntity = useCreateEntity();
  const updateEntity = useUpdateEntity();
  const deleteEntity = useDeleteEntity();

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

  // When selecting kind in attribute form, load entities for context selection
  const selectedAttrKindId = attributeForm.watch('kindId');
  const { data: attrContextEntities = [] } = useEntities(
    selectedAttrKindId ? Number(selectedAttrKindId) : undefined
  );

  // Options modal state
  const [optionAttrId, setOptionAttrId] = useState<number | undefined>(undefined);
  const [optionAttrName, setOptionAttrName] = useState<string>('');
  const { data: options = [] } = useAttributeOptions(optionAttrId);
  const createOption = useCreateAttributeOption(optionAttrId);
  const updateOption = useUpdateAttributeOption(optionAttrId);
  const deleteOption = useDeleteAttributeOption(optionAttrId);

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
          action={
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={kindForm.handleSubmit(async (values) => {
                await createKind.mutateAsync(values);
                kindForm.reset();
              })}
            >
              <div>
                <label className="block text-xs font-medium text-slate-600">عنوان نوع موجودیت</label>
                <input
                  className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...kindForm.register('kindName', { required: true })}
                />
              </div>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                ثبت نوع
              </button>
            </form>
          }
        >
          <DataTable
            data={kinds as Array<{ rowId: number; kindName: string }>}
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
                      onClick={async () => {
                        const next = window.prompt('ویرایش عنوان نوع:', item.kindName);
                        if (next && next !== item.kindName) {
                          await updateKind.mutateAsync({ id: item.rowId, payload: { kindName: next } });
                        }
                      }}
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
          action={
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={entityForm.handleSubmit(async (values) => {
                const payload = { kindId: Number(values.kindId), name: values.name };
                if (!payload.kindId) {
                  window.alert('نوع موجودیت را انتخاب کنید');
                  return;
                }
                await createEntity.mutateAsync(payload);
                entityForm.reset({ kindId: '', name: '' });
              })}
            >
              <div>
                <label className="block text-xs font-medium text-slate-600">نوع موجودیت</label>
                <select
                  className="mt-1 w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...entityForm.register('kindId')}
                >
                  <option value="">انتخاب نوع</option>
                  {(kinds as any[]).map((k) => (
                    <option key={k.rowId} value={k.rowId}>
                      {k.kindName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">عنوان موجودیت</label>
                <input
                  className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...entityForm.register('name', { required: true })}
                />
              </div>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                ثبت موجودیت
              </button>
            </form>
          }
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
            data={entities as Array<{ rowId: number; kindId: number; name: string }>}
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
                      onClick={async () => {
                        const next = window.prompt('ویرایش عنوان موجودیت:', item.name);
                        if (next && next !== item.name) {
                          await updateEntity.mutateAsync({ id: item.rowId, payload: { kindId: item.kindId, name: next } });
                        }
                      }}
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
          action={
            <form
              className="grid gap-3 lg:grid-cols-6"
              onSubmit={attributeForm.handleSubmit(async (values) => {
                const payload = {
                  kindId: Number(values.kindId),
                  contextRowId: Number(values.contextRowId),
                  name: values.name,
                  displayName: values.displayName,
                  category: values.category,
                  dataType: values.dataType
                } as any;
                if (!payload.kindId || !payload.contextRowId) {
                  window.alert('نوع و شناسهٔ کانتکست را تکمیل کنید');
                  return;
                }
                await createAttribute.mutateAsync(payload);
                attributeForm.reset({ kindId: '', contextRowId: '', dataType: 'string', name: '', displayName: '', category: '' } as any);
              })}
            >
              <div>
                <label className="block text-xs font-medium text-slate-600">نوع موجودیت</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('kindId')}
                >
                  <option value="">انتخاب نوع</option>
                  {(kinds as any[]).map((k) => (
                    <option key={k.rowId} value={k.rowId}>
                      {k.kindName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">موجودیت کانتکست</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('contextRowId', { required: true })}
                  disabled={!selectedAttrKindId}
                >
                  <option value="">انتخاب موجودیت</option>
                  {(attrContextEntities as any[]).map((e) => (
                    <option key={e.rowId} value={e.rowId}>
                      {e.name} (#{e.rowId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">نام سیستمی</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('name', { required: true, minLength: 2 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">نام نمایشی</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('displayName', { required: true, minLength: 2 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">دسته</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('category', { required: true, minLength: 2 })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">نوع داده</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  {...attributeForm.register('dataType')}
                >
                  <option value="string">رشته</option>
                  <option value="real">عدد</option>
                  <option value="date">تاریخ</option>
                  <option value="bool">بلی/خیر</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white lg:col-span-6 lg:w-40"
              >
                ثبت ویژگی
              </button>
            </form>
          }
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
            data={attributes as Array<any>}
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
                      onClick={async () => {
                        const next = window.prompt('ویرایش نام نمایشی:', item.displayName ?? '');
                        if (next && next !== item.displayName) {
                          await updateAttribute.mutateAsync({ id: item.rowId, payload: { displayName: next } });
                        }
                      }}
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

      {optionAttrId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">گزینه‌های ویژگی</h3>
                <p className="text-sm text-slate-500">{optionAttrName}</p>
              </div>
              <button
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                onClick={() => setOptionAttrId(undefined)}
              >
                بستن
              </button>
            </div>

            <form
              className="mb-4 flex flex-wrap items-end gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.querySelector('input[name="newOption"]') as HTMLInputElement;
                const value = input?.value?.trim();
                if (value) {
                  await createOption.mutateAsync({ value });
                  input.value = '';
                }
              }}
            >
              <div>
                <label className="block text-xs font-medium text-slate-600">گزینه جدید</label>
                <input
                  name="newOption"
                  className="mt-1 w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                افزودن
              </button>
            </form>

            <DataTable
              data={options as Array<{ rowId: number; value: string }>}
              columns={[
                { id: 'id', header: 'شناسه', accessor: (item) => item.rowId },
                { id: 'value', header: 'مقدار', accessor: (item) => item.value },
                {
                  id: 'actions',
                  header: 'عملیات',
                  accessor: (item: any) => (
                    <div className="flex gap-2 text-xs">
                      <button
                        className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                        onClick={async () => {
                          const next = window.prompt('ویرایش مقدار گزینه:', item.value);
                          if (next && next !== item.value) {
                            await updateOption.mutateAsync({ optionId: item.rowId, value: next });
                          }
                        }}
                      >
                        ویرایش
                      </button>
                      <button
                        className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                        onClick={() => window.confirm('حذف این گزینه؟') && deleteOption.mutate(item.rowId)}
                      >
                        حذف
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
