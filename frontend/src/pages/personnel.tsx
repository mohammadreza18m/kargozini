import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useAttributeHistory,
  useCreatePerson,
  usePersonnelDetail,
  usePersonnelList,
  useUpsertPersonAttribute
} from '@/api/hooks';
import { DataTable } from '@/components/data-table';
import { SectionCard } from '@/components/section-card';
import { classNames } from '@/utils/class-names';

interface PersonFormValues {
  name: string;
  kindName: string;
}

type AttributeDrafts = Record<number, string>;

export function PersonnelPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ attributeId: number; entityId: number } | null>(null);
  const [attributeDrafts, setAttributeDrafts] = useState<AttributeDrafts>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    data: personnel = [],
    isLoading: isPersonnelLoading
  } = usePersonnelList();
  const {
    data: personDetail,
    isLoading: isPersonLoading
  } = usePersonnelDetail(selectedId ?? 0);
  const createPerson = useCreatePerson();
  const upsertAttribute = useUpsertPersonAttribute(selectedId ?? 0);
  const { data: attributeHistory } = useAttributeHistory(historyTarget?.attributeId, historyTarget?.entityId);

  const personForm = useForm<PersonFormValues>({
    defaultValues: { name: '', kindName: 'teacher' }
  });

  useEffect(() => {
    if (!personDetail?.attributes) {
      setAttributeDrafts({});
      return;
    }
    const drafts: AttributeDrafts = {};
    personDetail.attributes.forEach((attribute: any) => {
      if (attribute.hidden) return;
      if (attribute.value === null || attribute.value === undefined) {
        drafts[attribute.attributeId] = '';
      } else if (typeof attribute.value === 'object') {
        drafts[attribute.attributeId] = JSON.stringify(attribute.value);
      } else {
        drafts[attribute.attributeId] = String(attribute.value);
      }
    });
    setAttributeDrafts(drafts);
  }, [personDetail]);

  useEffect(() => {
    if (!historyTarget || !attributeHistory) return;
    if (!attributeHistory.length) {
      window.alert('No history available for this attribute.');
      setHistoryTarget(null);
      return;
    }
    const message = attributeHistory
      .map(
        (item: any) =>
          `Value: ${JSON.stringify(item.value)} - Date: ${new Date(item.changedAt).toLocaleString()} - User: ${
            item.changedBy ?? 'unknown'
          }`
      )
      .join('\n');
    window.alert(message);
    setHistoryTarget(null);
  }, [attributeHistory, historyTarget]);

  const groupedAttributes = useMemo(() => {
    if (!personDetail?.attributes) return [] as Array<[string, any[]]>;
    const map = new Map<string, any[]>();
    for (const attribute of personDetail.attributes) {
      const category = attribute.category ?? 'Other';
      if (!map.has(category)) map.set(category, []);
      map.get(category)?.push(attribute);
    }
    return Array.from(map.entries());
  }, [personDetail]);

  const handleDraftChange = (attributeId: number, value: string) => {
    setAttributeDrafts((prev) => ({ ...prev, [attributeId]: value }));
  };

  const handleSaveAttribute = async (attribute: any) => {
    if (!selectedId) return;
    const rawValue = attributeDrafts[attribute.attributeId] ?? '';
    const payload: Record<string, unknown> = {
      attributeId: attribute.attributeId,
      updatedBy: 'UI'
    };

    try {
      switch (attribute.dataType) {
        case 'real': {
          const numericValue = rawValue === '' ? null : Number(rawValue);
          if (numericValue !== null && Number.isNaN(numericValue)) {
            window.alert('Please provide a numeric value.');
            return;
          }
          payload.valueReal = numericValue;
          break;
        }
        case 'date':
          payload.valueDate = rawValue || null;
          break;
        case 'bool':
          payload.valueBool = rawValue === '' ? null : rawValue === 'true';
          break;
        case 'json':
          payload.valueJson = rawValue ? JSON.parse(rawValue) : null;
          break;
        default:
          payload.valueString = rawValue || null;
      }
    } catch (error) {
      console.warn(error);
      window.alert('JSON structure is invalid.');
      return;
    }

    await upsertAttribute.mutateAsync(payload);
  };

  const handleSubmitNewPerson = personForm.handleSubmit(async (values) => {
    const person = await createPerson.mutateAsync(values);
    setSelectedId(person.rowId);
    personForm.reset({ name: '', kindName: values.kindName });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div className="space-y-4">
        <SectionCard title="فهرست پرسنل" description="جستجو و انتخاب پرسنل برای مشاهده جزئیات">
          <div className="mb-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              onClick={() => { setShowAddModal(true); personForm.reset({ name: '', kindName: 'teacher' }); }}
            >
              افزودن پرسنل
            </button>
            <input
              className="ml-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              placeholder="جستجو بر اساس نام یا نوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DataTable
            data={(() => {
              const q = searchQuery.trim().toLowerCase();
              if (!q) return personnel as any[];
              return (personnel as any[]).filter((p) => {
                const parts = [p.name, p.kindName].map((x: any) => String(x ?? '').toLowerCase());
                return parts.some((v: string) => v.includes(q));
              });
            })()}
            isLoading={isPersonnelLoading}
            columns={[
              { id: 'name', header: 'نام', accessor: (item: any) => item.name ?? '—' },
              { id: 'kind', header: 'نوع', accessor: (item: any) => item.kindName ?? '—' },
              {
                id: 'actions',
                header: 'عملیات',
                accessor: (item: any) => (
                  <button
                    type="button"
                    className={classNames(
                      'rounded-lg border px-3 py-1 text-xs font-medium transition',
                      item.rowId === selectedId
                        ? 'border-primary bg-primary/10 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary-700'
                    )}
                    onClick={() => setSelectedId(item.rowId)}
                  >
                    مشاهده جزئیات
                  </button>
                )
              }
            ]}
            emptyMessage="پرسنلی یافت نشد."
          />
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="جزئیات پرسنل" description="مشاهده و ویرایش مقادیر ویژگی‌ها">
          {isPersonLoading ? (
            <div className="rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              در حال بارگذاری اطلاعات پرسنل…
            </div>
          ) : personDetail ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">نام</p>
                  <p className="mt-1 text-base font-semibold text-slate-800">{personDetail.name ?? '—'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">نوع</p>
                  <p className="mt-1 text-base font-semibold text-slate-800">
                    {personDetail.kindName ?? personDetail.kindId}
                  </p>
                </div>
              </div>

              {groupedAttributes.map(([category, attributes]) => (
                <section key={category} className="space-y-3" aria-label={`Attribute group ${category}`}>
                  <h2 className="text-sm font-semibold text-slate-700">{category}</h2>
                  <div className="space-y-3">
                    {attributes.map((attribute: any) => (
                      <AttributeEditorCard
                        key={attribute.attributeId}
                        attribute={attribute}
                        value={attributeDrafts[attribute.attributeId] ?? ''}
                        onChange={(value) => handleDraftChange(attribute.attributeId, value)}
                        onSave={() => handleSaveAttribute(attribute)}
                        onHistory={() =>
                          setHistoryTarget({ attributeId: attribute.attributeId, entityId: personDetail.rowId })
                        }
                        isSaving={upsertAttribute.isPending}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              یک رکورد پرسنلی از فهرست انتخاب کنید.
            </p>
          )}
        </SectionCard>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">افزودن پرسنل</h3>
              <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700" onClick={() => setShowAddModal(false)}>بستن</button>
            </div>
            <form className="space-y-3" onSubmit={async (e) => { e.preventDefault(); await handleSubmitNewPerson(); setShowAddModal(false); }}>
              <div>
                <label className="block text-xs font-medium text-slate-600">نام و نام خانوادگی</label>
                <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...personForm.register('name', { required: 'Name is required.' })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">نوع (Entity Kind)</label>
                <input className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" {...personForm.register('kindName', { required: 'Kind is required.' })} />
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={() => setShowAddModal(false)}>انصراف</button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white" disabled={createPerson.isPending}>ثبت پرسنل</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface AttributeEditorCardProps {
  attribute: any;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onHistory: () => void;
  isSaving: boolean;
}

function AttributeEditorCard({ attribute, value, onChange, onSave, onHistory, isSaving }: AttributeEditorCardProps) {
  if (attribute.hidden) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-400">
        This field is hidden until its dependency condition is met.
      </div>
    );
  }

  const editable = attribute.isEditable;
  const helper = attribute.isSystem
    ? 'System generated field (read only).'
    : attribute.validationRules?.required && editable
    ? 'This field is required.'
    : '';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{attribute.displayName ?? attribute.attributeName}</p>
          <p className="text-xs text-slate-500">
            Type: {attribute.dataType}
            {attribute.updatedAt ? ` • Last update: ${new Date(attribute.updatedAt).toLocaleString()}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-primary-600 hover:text-primary-700"
          onClick={onHistory}
        >
          History
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
        <AttributeField attribute={attribute} value={value} onChange={onChange} disabled={!editable} />
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onSave}
          disabled={!editable || isSaving}
        >
          Save changes
        </button>
      </div>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

interface AttributeFieldProps {
  attribute: any;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function AttributeField({ attribute, value, onChange, disabled }: AttributeFieldProps) {
  const options = Array.isArray(attribute.validationRules?.options)
    ? (attribute.validationRules.options as unknown[])
    : undefined;

  if (options) {
    return (
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Select...</option>
        {options.map((option, index) => (
          <option key={index} value={String(option)}>
            {String(option)}
          </option>
        ))}
      </select>
    );
  }

  if (attribute.dataType === 'bool') {
    return (
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">-</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (attribute.dataType === 'json') {
    return (
      <textarea
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        dir="ltr"
      />
    );
  }

  return (
    <input
      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72"
      type={attribute.dataType === 'real' ? 'number' : attribute.dataType === 'date' ? 'date' : 'text'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  );
}
