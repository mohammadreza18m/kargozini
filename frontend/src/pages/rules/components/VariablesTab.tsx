import React from "react";
import { SectionCard } from "@/components/section-card";
import { DataTable } from "@/components/data-table";
export function VariablesTab({
  openVarModal,
  varFilter,
  setVarFilter,
  searchQuery,
  variableList,
  beginEditVariable,
  deleteVariable
}) {
  return (
    <>
      <SectionCard
        title="تعریف/ویرایش متغیرهای حکم"
        description="برای افزودن یا ویرایش متغیر از دکمه زیر استفاده کنید. فرم فقط داخل مدال باز می‌شود."
        action={
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={openVarModal}
          >
            افزودن متغیر
          </button>
        }
      >
        <p className="text-sm text-slate-500">
          برای افزودن یا ویرایش، دکمه «افزودن متغیر» را بزنید.
        </p>
      </SectionCard>

      <SectionCard title="فهرست متغیرها" description="ویرایش/حذف متغیرهای تعریف‌شده">
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-slate-600">عنوان</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={varFilter.name ?? ""}
              onChange={(e) => setVarFilter((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">ماهیت (som)</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={varFilter.som ?? ""}
              onChange={(e) => setVarFilter((f) => ({ ...f, som: e.target.value as any }))}
            >
              <option value="">همه</option>
              <option value="condition">شرط</option>
              <option value="combination">ترکیب</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-600">نوع (vop)</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={varFilter.vop ?? ""}
              onChange={(e) => setVarFilter((f) => ({ ...f, vop: e.target.value as any }))}
            >
              <option value="">همه</option>
              <option value="value">مقدار</option>
              <option value="percent">درصد</option>
            </select>
          </div>
        </div>
        <DataTable
          data={(() => {
            const q = searchQuery.trim().toLowerCase();
            const base = variableList.filter((v) => {
              // column filters
              if (
                varFilter.name &&
                !(v.name ?? "").toLowerCase().includes((varFilter.name ?? "").toLowerCase())
              )
                return false;
              if (varFilter.som && v.som !== varFilter.som) return false;
              if (varFilter.vop && v.variableVop !== varFilter.vop) return false;
              return true;
            });
            if (!q) return base;
            return base.filter((v) => {
              const parts = [
                v.name,
                v.description,
                v.som,
                v.variableVop,
                v.startTime,
                v.endTime
              ].map((x) => String(x ?? "").toLowerCase());
              return parts.some((p) => p.includes(q));
            });
          })()}
          columns={[
            { id: "name", header: "عنوان", accessor: (item) => item.name ?? "—" },
            {
              id: "som",
              header: "ماهیت",
              accessor: (item) => (item.som === "combination" ? "ترکیب" : "شرط")
            },
            {
              id: "vop",
              header: "نوع",
              accessor: (item) => (item.variableVop === "percent" ? "درصد" : "مقدار")
            },
            {
              id: "actions",
              header: "عملیات",
              accessor: (item: any) => (
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                    onClick={() => beginEditVariable(item)}
                  >
                    ویرایش
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                    onClick={() =>
                      window.confirm("این متغیر حذف شود؟") && deleteVariable.mutate(item.rowId)
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
    </>
  );
}
