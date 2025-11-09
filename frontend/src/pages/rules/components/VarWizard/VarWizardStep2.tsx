import React from "react";

export default function VarWizardStep2() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">۲) انتخاب واقعیت‌ها (Attributes)</h4>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
        {attrsQuery.isLoading ? (
          <span className="text-xs text-slate-500">در حال بارگذاری ویژگی‌ها…</span>
        ) : null}
        {!attrsQuery.isLoading && attributeList.length === 0 ? (
          <span className="text-xs text-slate-500">
            هیچ ویژگی‌ای پیدا نشد. ابتدا در صفحه «ویژگی‌ها» چند ویژگی ایجاد کنید.
          </span>
        ) : null}
        {attributeList.map((a) => {
          const checked = selectedFactIds.includes(a.rowId);
          return (
            <label
              key={a.rowId}
              className={
                "cursor-pointer rounded-full border px-3 py-1 text-xs " +
                (checked ? "border-primary text-primary-700" : "border-slate-300 text-slate-700")
              }
            >
              <input
                type="checkbox"
                className="mr-1 align-middle"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedFactIds, a.rowId]
                    : selectedFactIds.filter((id) => id !== a.rowId);
                  setSelectedFactIds(next);
                }}
              />
              {a.displayName ?? a.name}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={() => setVarWizardStep(1)}
        >
          بازگشت
        </button>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          onClick={async () => {
            await setFacts.mutateAsync({ factIds: selectedFactIds });
            setVarWizardStep(3);
          }}
        >
          ادامه
        </button>
      </div>
    </div>
  );
}
