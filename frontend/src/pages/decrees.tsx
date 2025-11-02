import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useDecreeArchive,
  useDecreePreview,
  useFinalizeDecree,
  usePersonnelList
} from '../api/hooks';
import { DataTable } from '../components/data-table';
import { SectionCard } from '../components/section-card';

interface DecreeFormValues {
  personId: number;
  effectiveDate: string;
  variableValues: string;
}

export function DecreeEnginePage() {
  const [previewResult, setPreviewResult] = useState<any>(null);
  const form = useForm<DecreeFormValues>({
    defaultValues: {
      effectiveDate: new Date().toISOString().slice(0, 10),
      variableValues: '{"baseScore": 4200}'
    }
  });

  const { data: personnel = [] } = usePersonnelList();
  const previewMutation = useDecreePreview();
  const finalizeMutation = useFinalizeDecree();
  const archive = useDecreeArchive();

  return (
    <div className="space-y-6">
      <SectionCard
        title="محاسبه حکم"
        description="انتخاب پرسنل و اجرای موتور قوانین بر اساس تاریخ مؤثر."
      >
        <form
          className="grid gap-4 lg:grid-cols-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              const payload = {
                personId: Number(values.personId),
                effectiveDate: values.effectiveDate,
                variableValues: JSON.parse(values.variableValues || '{}'),
                manualOverrides: []
              };
              const result = await previewMutation.mutateAsync(payload);
              setPreviewResult(result);
            } catch (error) {
              window.alert('ساختار JSON متغیرها صحیح نیست.');
              console.error(error);
            }
          })}
        >
          <div>
            <label className="block text-xs font-medium text-slate-600">پرسنل</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              {...form.register('personId', { required: true, valueAsNumber: true })}
            >
              <option value="">انتخاب نمایید</option>
              {personnel.map((person: any) => (
                <option key={person.rowId} value={person.rowId}>
                  {person.name ?? `پرسنل ${person.rowId}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">تاریخ اجرا</label>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              {...form.register('effectiveDate', { required: true })}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              مقادیر متغیر (JSON)
            </label>
            <textarea
              rows={1}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              {...form.register('variableValues')}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white lg:col-span-4 lg:w-40"
            disabled={previewMutation.isPending}
          >
            محاسبه
          </button>
        </form>
      </SectionCard>

      {previewResult ? (
        <SectionCard
          title="نتیجه محاسبه"
          description={`جمع کل: ${previewResult.total?.toLocaleString?.() ?? previewResult.total}`}
          action={
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
              onClick={async () => {
                try {
                  const payload = {
                    personId: Number(form.getValues('personId')),
                    effectiveDate: form.getValues('effectiveDate'),
                    variableValues: JSON.parse(form.getValues('variableValues') || '{}'),
                    manualOverrides: []
                  };
                  await finalizeMutation.mutateAsync(payload);
                  setPreviewResult(null);
                } catch (error) {
                  window.alert('ثبت حکم با خطا مواجه شد. لطفاً ورودی‌ها را بررسی کنید.');
                  console.error(error);
                }
              }}
            >
              ثبت حکم
            </button>
          }
        >
          <DataTable
            data={previewResult.items ?? []}
            columns={[
              { id: 'name', header: 'عنوان', accessor: (item: any) => item.scoreName },
              {
                id: 'value',
                header: 'مبلغ',
                accessor: (item: any) => item.value?.toLocaleString?.() ?? item.value
              },
              {
                id: 'trace',
                header: 'توضیحات',
                accessor: (item: any) => (
                  <details className="text-xs text-slate-500">
                    <summary>جزئیات</summary>
                    <ul className="mt-2 space-y-1">
                      {item.trace?.map((line: string, idx: number) => (
                        <li key={idx}>{line}</li>
                      ))}
                    </ul>
                  </details>
                )
              }
            ]}
          />
        </SectionCard>
      ) : null}

      <SectionCard
        title="آخرین احکام"
        description="احکام صادر شده برای کنترل و بازبینی."
      >
        <DataTable
          data={archive.data ?? []}
          columns={[
            { id: 'salaryNo', header: 'شماره حکم', accessor: (item: any) => item.salaryNo },
            {
              id: 'effective',
              header: 'تاریخ اجرا',
              accessor: (item: any) =>
                item.effectiveDate
                  ? new Date(item.effectiveDate).toLocaleDateString('fa-IR')
                  : '-'
            },
            {
              id: 'createdAt',
              header: 'تاریخ صدور',
              accessor: (item: any) =>
                new Date(item.createdAt).toLocaleDateString('fa-IR')
            }
          ]}
        />
      </SectionCard>
    </div>
  );
}
