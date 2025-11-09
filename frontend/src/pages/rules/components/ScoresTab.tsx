import React from "react";

export default function ScoresTab() {
  return (
    <SectionCard
      title="فرمول‌های امتیاز"
      description="فرمول‌ها را با وضعیت پیش‌نویس ثبت و پس از بررسی منتشر کنید."
      action={
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          onClick={openScoreModal}
        >
          افزودن امتیاز
        </button>
      }
    >
      <div className="mb-3 grid gap-2 sm:grid-cols-5">
        <div>
          <label className="block text-xs text-slate-600">عنوان</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            value={scoreFilter.name ?? ""}
            onChange={(e) => setScoreFilter((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600">دسته</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            value={scoreFilter.category ?? ""}
            onChange={(e) => setScoreFilter((f) => ({ ...f, category: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600">وضعیت</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            value={scoreFilter.status ?? ""}
            onChange={(e) => setScoreFilter((f) => ({ ...f, status: e.target.value as any }))}
          >
            <option value="">همه</option>
            <option value="active">فعال</option>
            <option value="draft">پیش‌نویس</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">ماهیت (som)</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
            value={scoreFilter.som ?? ""}
            onChange={(e) => setScoreFilter((f) => ({ ...f, som: e.target.value as any }))}
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
            value={scoreFilter.vop ?? ""}
            onChange={(e) => setScoreFilter((f) => ({ ...f, vop: e.target.value as any }))}
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
          const base = (scores as any[]).filter((s) => {
            if (
              scoreFilter.name &&
              !String(s.name ?? "")
                .toLowerCase()
                .includes((scoreFilter.name ?? "").toLowerCase())
            )
              return false;
            if (
              scoreFilter.category &&
              !String(s.category ?? "")
                .toLowerCase()
                .includes((scoreFilter.category ?? "").toLowerCase())
            )
              return false;
            if (scoreFilter.status) {
              const isActive = s.status === 1;
              if (scoreFilter.status === "active" && !isActive) return false;
              if (scoreFilter.status === "draft" && isActive) return false;
            }
            if (scoreFilter.som && s.som !== scoreFilter.som) return false;
            if (scoreFilter.vop && s.scoreVopSom !== scoreFilter.vop) return false;
            return true;
          });
          if (!q) return base as any[];
          return base.filter((s) => {
            const status = s.status === 1 ? "فعال" : "پیش‌نویس";
            const variableNames = (s.variables ?? []).map((v: any) => v.name ?? "").join(" ");
            const parts = [s.name, s.category, s.formula, s.condition, status, variableNames].map(
              (x) => String(x ?? "").toLowerCase()
            );
            return parts.some((p) => p.includes(q));
          });
        })()}
        columns={[
          { id: "name", header: "عنوان", accessor: (item: any) => item.name },
          { id: "category", header: "دسته", accessor: (item: any) => item.category ?? "—" },
          {
            id: "ruleSet",
            header: "مجموعه",
            accessor: (item: any) =>
              item.ruleSetRowId
                ? (ruleSetLookup.get(item.ruleSetRowId) ?? `#${item.ruleSetRowId}`)
                : "—"
          },
          { id: "formula", header: "فرمول", accessor: (item: any) => item.formula },
          {
            id: "condition",
            header: "شرط",
            accessor: (item: any) => item.condition ?? "—"
          },
          {
            id: "status",
            header: "وضعیت",
            accessor: (item: any) => (item.status === 1 ? "فعال" : "پیش‌نویس")
          },
          {
            id: "variables",
            header: "تعداد متغیر",
            accessor: (item: any) => item.variables?.length ?? 0
          },
          {
            id: "actions",
            header: "عملیات",
            accessor: (item: any) => (
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="rounded-lg border border-amber-500 px-3 py-1 text-amber-600"
                  onClick={() => beginEditScore(item)}
                >
                  ویرایش
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                  onClick={() => {
                    if (window.confirm("این فرمول حذف شود؟")) {
                      deleteScore.mutate(item.rowId);
                    }
                  }}
                  disabled={deleteScore.isPending}
                >
                  حذف
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                  onClick={() => duplicateScore.mutate(item.rowId)}
                  disabled={duplicateScore.isPending}
                >
                  کپی نسخه
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-3 py-1 text-white"
                  onClick={() => publishScore.mutate(item.rowId)}
                  disabled={publishScore.isPending || item.status === 1}
                >
                  انتشار
                </button>
              </div>
            )
          }
        ]}
      />
    </SectionCard>
  );
}
