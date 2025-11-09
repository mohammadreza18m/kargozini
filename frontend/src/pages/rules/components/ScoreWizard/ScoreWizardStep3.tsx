import React from "react";

export default function ScoreWizardStep3() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">۳) جدول تصمیم</h4>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {selectedScoreVarIds.map((vid) => (
                <th key={vid} className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                  {(variables as any[]).find((v) => v.rowId === vid)?.name}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                مقدار خروجی
              </th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {scoreDecisionRows.map((row, idx) => (
              <tr key={idx}>
                {selectedScoreVarIds.map((vid) => (
                  <td key={vid} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="from"
                        className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        value={row.cells?.[vid]?.min ?? ""}
                        onChange={(e) => {
                          const next = [...scoreDecisionRows];
                          const prev = next[idx];
                          next[idx] = {
                            ...prev,
                            cells: {
                              ...prev.cells,
                              [vid]: { ...(prev.cells?.[vid] ?? {}), min: e.target.value }
                            }
                          };
                          setScoreDecisionRows(next);
                        }}
                      />
                      <input
                        type="number"
                        placeholder="to"
                        className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        value={row.cells?.[vid]?.max ?? ""}
                        onChange={(e) => {
                          const next = [...scoreDecisionRows];
                          const prev = next[idx];
                          next[idx] = {
                            ...prev,
                            cells: {
                              ...prev.cells,
                              [vid]: { ...(prev.cells?.[vid] ?? {}), max: e.target.value }
                            }
                          };
                          setScoreDecisionRows(next);
                        }}
                      />
                    </div>
                  </td>
                ))}
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    value={row.value}
                    onChange={(e) => {
                      const next = [...scoreDecisionRows];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setScoreDecisionRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white"
                    onClick={() => setScoreDecisionRows((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-primary px-4 py-1 text-sm text-primary-600"
          onClick={() => {
            const baseCells: ScoreDTCell = {};
            selectedScoreVarIds.forEach((vid) => (baseCells[vid] = { min: "", max: "" }));
            setScoreDecisionRows((rows) => [...rows, { cells: baseCells, value: "" }]);
          }}
        >
          افزودن ردیف
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => setScoreWizardStep(2)}
          >
            بازگشت
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!activeScoreId) return;
              const rows = scoreDecisionRows
                .filter((r) =>
                  selectedScoreVarIds.every(
                    (vid) =>
                      typeof r.cells?.[vid]?.min !== "undefined" ||
                      typeof r.cells?.[vid]?.max !== "undefined"
                  )
                )
                .map((r) => ({
                  composition: JSON.stringify(r.cells),
                  value: Number(r.value)
                }));
              await replaceScoreOptions.mutateAsync({ rows });
              closeScoreModal();
            }}
          >
            ثبت و پایان
          </button>
        </div>
      </div>
    </div>
  );
}
