import { useState } from 'react';
import { useDecreeArchive, useCompareDecrees } from '../api/hooks';
import { DataTable } from '../components/data-table';
import { SectionCard } from '../components/section-card';

export function ArchivePage() {
  const { data: archive = [] } = useDecreeArchive();
  const [selection, setSelection] = useState<{ left?: number; right?: number }>({});
  const { data: comparison } = useCompareDecrees(selection.left, selection.right);

  return (
    <div className="space-y-6">
      <SectionCard
        title="آرشیو احکام"
        description="جستجوی احکام صادر شده و انتخاب برای مقایسه."
      >
        <DataTable
          data={archive}
          columns={[
            { id: 'salaryNo', header: 'شماره حکم', accessor: (item: any) => item.salaryNo },
            {
              id: 'issuedAt',
              header: 'تاریخ صدور',
              accessor: (item: any) => new Date(item.issuedAt).toLocaleDateString('fa-IR')
            },
            {
              id: 'select',
              header: 'انتخاب',
              accessor: (item: any) => (
                <div className="flex gap-2">
                  <button
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      selection.left === item.rowId
                        ? 'border-primary text-primary-600'
                        : 'border-slate-300 text-slate-500'
                    }`}
                    onClick={() => setSelection((prev) => ({ ...prev, left: item.rowId }))}
                  >
                    حکم ۱
                  </button>
                  <button
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      selection.right === item.rowId
                        ? 'border-primary text-primary-600'
                        : 'border-slate-300 text-slate-500'
                    }`}
                    onClick={() => setSelection((prev) => ({ ...prev, right: item.rowId }))}
                  >
                    حکم ۲
                  </button>
                </div>
              )
            }
          ]}
        />
      </SectionCard>

      <SectionCard title="مقایسه احکام" description="اختلاف مقادیر بین دو حکم انتخابی.">
        {comparison ? (
          <DataTable
            data={comparison}
            columns={[
              { id: 'item', header: 'آیتم', accessor: (item: any) => item.itemId },
              {
                id: 'left',
                header: 'حکم ۱',
                accessor: (item: any) => item.left?.toLocaleString?.() ?? item.left
              },
              {
                id: 'right',
                header: 'حکم ۲',
                accessor: (item: any) => item.right?.toLocaleString?.() ?? item.right
              },
              {
                id: 'delta',
                header: 'اختلاف',
                accessor: (item: any) => item.delta?.toLocaleString?.() ?? item.delta
              }
            ]}
          />
        ) : (
          <p className="text-sm text-slate-500">
            برای مشاهده اختلاف، دو حکم را از جدول بالا انتخاب کنید.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
