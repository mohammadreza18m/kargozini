import {
  useReportAlerts,
  useReportDecrees,
  useReportSalaryDistribution
} from '../api/hooks';
import { DataTable } from '../components/data-table';
import { SectionCard } from '../components/section-card';

export function ReportsPage() {
  const { data: decrees = [] } = useReportDecrees();
  const { data: distribution = [] } = useReportSalaryDistribution();
  const { data: alerts = [] } = useReportAlerts();

  return (
    <div className="space-y-6">
      <SectionCard title="خروجی احکام در دوازده ماه گذشته">
        <DataTable
          data={decrees}
          columns={[
            { id: 'month', header: 'ماه', accessor: (item: any) => item.month },
            { id: 'count', header: 'تعداد', accessor: (item: any) => item.count }
          ]}
        />
      </SectionCard>

      <SectionCard title="میانگین حقوق بر اساس رتبه">
        <DataTable
          data={distribution}
          columns={[
            { id: 'rank', header: 'رتبه', accessor: (item: any) => item.rank ?? 'نامشخص' },
            {
              id: 'average',
              header: 'میانگین حقوق',
              accessor: (item: any) => item.average?.toLocaleString?.() ?? item.average
            }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="هشدارهای کنترل کیفیت"
        description="احکامی که دارای تغییر دستی هستند، نیاز به بررسی مجدد دارند."
      >
        <DataTable
          data={alerts}
          columns={[
            { id: 'salary', header: 'شماره حکم', accessor: (item: any) => item.salary_no },
            { id: 'item', header: 'آیتم', accessor: (item: any) => item.item_row_id },
            { id: 'value', header: 'مقدار', accessor: (item: any) => item.value }
          ]}
          emptyMessage="هشداری ثبت نشده است."
        />
      </SectionCard>
    </div>
  );
}
