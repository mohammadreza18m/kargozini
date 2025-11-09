// @ts-nocheck
export default function ScoreWizardStep2({
  variables,
  selectedScoreVarIds,
  setSelectedScoreVarIds,
  setScoreWizardStep,
  activeScoreId,
  setScoreVars
}: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">۱) انتخاب متغیرها (چندانتخابی)</h4>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
        {(variables as any[]).map((v) => {
          const checked = selectedScoreVarIds.includes(v.rowId);
          return (
            <label
              key={v.rowId}
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
                    ? [...selectedScoreVarIds, v.rowId]
                    : selectedScoreVarIds.filter((id: number) => id !== v.rowId);
                  setSelectedScoreVarIds(next);
                }}
              />
              {v.name}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs"
            onClick={() => setSelectedScoreVarIds((variables as any[]).map((v) => v.rowId))}
          >
            انتخاب همه
          </button>
          <button
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs"
            onClick={() => setSelectedScoreVarIds([])}
          >
            پاک‌کردن
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => setScoreWizardStep(1)}
          >
            بازگشت
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!activeScoreId) return;
              await setScoreVars.mutateAsync({ variableIds: selectedScoreVarIds });
              setScoreWizardStep(3);
            }}
          >
            ادامه
          </button>
        </div>
      </div>
    </div>
  );
}
