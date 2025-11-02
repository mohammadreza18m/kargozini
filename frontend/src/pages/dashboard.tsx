import { useReportDecrees, useReportSalaryDistribution } from '../api/hooks';
import { SectionCard } from '../components/section-card';

export function DashboardPage() {
  const { data: decrees } = useReportDecrees();
  const { data: distribution } = useReportSalaryDistribution();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">احکام صادر شده ۳۰ روز اخیر</p>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {decrees?.[0]?.count ?? 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">میانگین حقوق ثبت شده</p>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {distribution?.[0]?.average ? distribution[0].average.toLocaleString() : 0}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">به‌روزرسانی اخیر</p>
          <p className="mt-2 text-lg font-medium text-primary-600">
            سامانه در حالت عملیاتی است
          </p>
        </div>
      </div>

      <SectionCard title="روند صدور احکام" description="نمایش ماهانه دوازده ماه گذشته">
        <ul className="space-y-2 text-sm text-slate-600">
          {decrees?.map((item: { month: string; count: number }) => (
            <li
              key={item.month}
              className="flex items-center justify-between rounded-lg border px-4 py-2"
            >
              <span>{item.month}</span>
              <span className="font-medium text-primary-600">{item.count}</span>
            </li>
          )) ?? <span>داده‌ای ثبت نشده است.</span>}
        </ul>
      </SectionCard>

      <SectionCard title="توزیع حقوق بر اساس رتبه">
        <div className="space-y-3">
          {distribution?.map(
            (item: { rank: string | null; average: number | null }) => (
              <div
                key={item.rank ?? 'unknown'}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <span>{item.rank ?? 'نامشخص'}</span>
                <span className="font-medium text-primary-600">
                  {item.average ? item.average.toLocaleString() : 0}
                </span>
              </div>
            )
          ) ?? <span>داده‌ای ثبت نشده است.</span>}
        </div>
      </SectionCard>
    </div>
  );
}
