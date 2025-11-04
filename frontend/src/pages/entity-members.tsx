import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useEntities,
  useEntityKinds,
  usePersonnelDetailByMember,
  useUpsertPersonAttribute,
  useEntityMembers,
  useAddEntityMember,
  useAttributeHistory
} from '@/api/hooks';
import { SectionCard } from '@/components/section-card';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { classNames } from '@/utils/class-names';

type AttributeDrafts = Record<number, string>;

export function EntityMembersPage() {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<number | undefined>(undefined);
  const [attributeDrafts, setAttributeDrafts] = useState<AttributeDrafts>({});
  const [historyTarget, setHistoryTarget] = useState<{ attributeId: number; entityId: number } | null>(null);

  const { data: kinds = [] } = useEntityKinds();
  const { data: entities = [], isLoading: isEntitiesLoading } = useEntities(kindFilter);
  const { data: members = [] } = useEntityMembers(selectedEntityId);
  const addMember = useAddEntityMember(selectedEntityId);
  const { data: detail } = usePersonnelDetailByMember(selectedEntityId ?? 0, activeMemberId);
  const upsertAttribute = useUpsertPersonAttribute(selectedEntityId ?? 0);
  const { data: attributeHistory } = useAttributeHistory(historyTarget?.attributeId, historyTarget?.entityId);
  const [showMemberModal, setShowMemberModal] = useState(false);

  useEffect(() => {
    setActiveMemberId(null);
    setAttributeDrafts({});
  }, [selectedEntityId]);

  useEffect(() => {
    if (!detail?.attributes) { setAttributeDrafts({}); return; }
    const drafts: AttributeDrafts = {};
    detail.attributes.forEach((a: any) => {
      if (a.hidden) return;
      if (a.value === null || a.value === undefined) drafts[a.attributeId] = '';
      else if (typeof a.value === 'object') drafts[a.attributeId] = JSON.stringify(a.value);
      else drafts[a.attributeId] = String(a.value);
    });
    setAttributeDrafts(drafts);
  }, [detail]);

  useEffect(() => {
    if (!historyTarget || !attributeHistory) return;
    if (!attributeHistory.length) { window.alert('سوابقی وجود ندارد.'); setHistoryTarget(null); return; }
    const message = attributeHistory
      .map((item: any) => `مقدار: ${JSON.stringify(item.value)} - تاریخ: ${new Date(item.changedAt).toLocaleString('fa-IR')} - کاربر: ${item.changedBy ?? 'نامشخص'}`)
      .join('\n');
    window.alert(message);
    setHistoryTarget(null);
  }, [attributeHistory, historyTarget]);

  const groupedAttributes = useMemo(() => {
    if (!detail?.attributes) return [] as Array<[string, any[]]>;
    const map = new Map<string, any[]>();
    for (const attribute of detail.attributes) {
      const category = attribute.category ?? 'Other';
      if (!map.has(category)) map.set(category, []);
      map.get(category)?.push(attribute);
    }
    return Array.from(map.entries());
  }, [detail]);

  const handleDraftChange = (attributeId: number, value: string) => {
    setAttributeDrafts((prev) => ({ ...prev, [attributeId]: value }));
  };

  const handleSaveAttribute = async (attribute: any) => {
    if (!selectedEntityId) return;
    const rawValue = attributeDrafts[attribute.attributeId] ?? '';
    const payload: Record<string, unknown> = { attributeId: attribute.attributeId, updatedBy: 'UI', ...(activeMemberId ? { memberRowId: activeMemberId } : {}) };
    try {
      switch (attribute.dataType) {
        case 'real': {
          const numericValue = rawValue === '' ? null : Number(rawValue);
          if (numericValue !== null && Number.isNaN(numericValue)) { window.alert('Numeric value required'); return; }
          payload.valueReal = numericValue; break;
        }
        case 'date': payload.valueDate = rawValue || null; break;
        case 'bool': payload.valueBool = rawValue === '' ? null : rawValue === 'true'; break;
        case 'json': payload.valueJson = rawValue ? JSON.parse(rawValue) : null; break;
        default: payload.valueString = rawValue || null;
      }
    } catch { window.alert('Invalid JSON'); return; }
    try { await upsertAttribute.mutateAsync(payload); } catch (err: any) { window.alert(err?.response?.data?.message ?? 'Save failed'); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div className="space-y-4">
        <SectionCard title="موجودیت‌ها" description="برای مدیریت اعضا یک موجودیت را انتخاب کنید">
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-600">نوع</label>
              <select className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none" value={kindFilter ?? ''} onChange={(e) => setKindFilter(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">All</option>
                {(kinds as any[]).map((k) => (
                  <option key={k.rowId} value={k.rowId}>{k.kindName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600">جستجو</label>
              <input className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="براساس نام..." />
            </div>
          </div>
          <DataTable
            data={(() => {
              const q = searchQuery.trim().toLowerCase();
              const base = (entities as any[]);
              if (!q) return base;
              return base.filter((e) => String(e.name ?? '').toLowerCase().includes(q));
            })()}
            isLoading={isEntitiesLoading}
            columns={[
              { id: 'id', header: 'شناسه', accessor: (it: any) => it.rowId },
              { id: 'name', header: 'نام', accessor: (it: any) => it.name ?? '—' },
              { id: 'actions', header: 'اقدامات', accessor: (it: any) => (
                <button
                  type="button"
                  className={classNames('rounded-lg border px-3 py-1 text-xs font-medium transition', it.rowId === selectedEntityId ? 'border-primary bg-primary/10 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary-700')}
                  onClick={() => setSelectedEntityId(it.rowId)}
                >
                  انتخاب
                </button>
              )}
            ]}
            emptyMessage="موجودیتی یافت نشد"
          />
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard title="اعضای موجودیت" description="لیست اعضا، مشاهده جزئیات و افزودن عضو">
          {!selectedEntityId ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">ابتدا یک موجودیت را انتخاب کنید.</p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">اعضای موجودیت #{selectedEntityId}</h3>
                <Button size="sm" onClick={async () => { await addMember.mutateAsync(); }}>افزودن عضو</Button>
              </div>
              <DataTable
                data={members as any[]}
                columns={[
                  { id: 'id', header: 'شناسه', accessor: (m: any) => m.rowId },
                  { id: 'rand', header: 'Rand', accessor: (m: any) => m.randId ?? '—' },
                  {
                    id: 'actions',
                    header: 'جزئیات',
                    accessor: (m: any) => (
                      <button
                        type="button"
                        className="rounded-lg border border-primary px-3 py-1 text-xs text-primary-600"
                        onClick={() => { setActiveMemberId(m.rowId); setShowMemberModal(true); }}
                      >
                        مشاهده جزئیات
                      </button>
                    )
                  }
                ]}
                emptyMessage="عضوی ثبت نشده است"
              />
            </>
          )}
        </SectionCard>
      </div>

      <MemberAttributesModal
        open={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        groupedAttributes={groupedAttributes}
        attributeDrafts={attributeDrafts}
        onChange={handleDraftChange}
        onSave={handleSaveAttribute}
        onHistory={(attribute: any) => selectedEntityId && setHistoryTarget({ attributeId: attribute.attributeId, entityId: selectedEntityId })}
        isSaving={upsertAttribute.isPending}
      />
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
        <button type="button" className="text-xs text-primary-600 hover:text-primary-700" onClick={onHistory}>History</button>
      </div>
      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
        <AttributeField attribute={attribute} value={value} onChange={onChange} disabled={!editable} />
        <button type="button" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-50" onClick={onSave} disabled={!editable || isSaving}>
          Save changes
        </button>
      </div>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

// Modal rendering for member attribute editing
export function MemberAttributesModal({ open, onClose, groupedAttributes, attributeDrafts, onChange, onSave, isSaving, onHistory }: {
  open: boolean;
  onClose: () => void;
  groupedAttributes: Array<[string, any[]]>;
  attributeDrafts: Record<number, string>;
  onChange: (attributeId: number, value: string) => void;
  onSave: (attribute: any) => void;
  onHistory: (attribute: any) => void;
  isSaving: boolean;
}) {
  return (
    <Modal open={open} title="جزئیات عضو" onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        {groupedAttributes.length === 0 ? (
          <p className="text-sm text-slate-500">ویژگی‌ای برای نمایش وجود ندارد.</p>
        ) : null}
        {groupedAttributes.map(([category, attributes]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">{category}</h2>
            <div className="space-y-3">
              {attributes.map((attribute: any) => (
                <AttributeEditorCard
                  key={attribute.attributeId}
                  attribute={attribute}
                  value={attributeDrafts[attribute.attributeId] ?? ''}
                  onChange={(value) => onChange(attribute.attributeId, value)}
                  onSave={() => onSave(attribute)}
                  onHistory={() => onHistory(attribute)}
                  isSaving={isSaving}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}

function AttributeField({ attribute, value, onChange, disabled }: { attribute: any; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const options = Array.isArray(attribute.validationRules?.options) ? (attribute.validationRules.options as unknown[]) : undefined;
  if (options) {
    return (
      <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">Select...</option>
        {options.map((opt, idx) => (
          <option key={idx} value={String(opt)}>{String(opt)}</option>
        ))}
      </select>
    );
  }
  if (attribute.dataType === 'bool') {
    return (
      <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        <option value="">-</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }
  if (attribute.dataType === 'json') {
    return (
      <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" rows={3} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} dir="ltr" />
    );
  }
  return (
    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-72" type={attribute.dataType === 'real' ? 'number' : attribute.dataType === 'date' ? 'date' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
  );
}
