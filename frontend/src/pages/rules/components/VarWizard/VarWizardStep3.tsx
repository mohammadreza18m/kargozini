import React from "react";

export default function VarWizardStep3() {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">۳) جدول تصمیم</h4>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {selectedFactIds.map((fid) => (
                <th key={fid} className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                  {attributeList.find((a) => a.rowId === fid)?.displayName ??
                    attributeList.find((a) => a.rowId === fid)?.name}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">خروجی</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {decisionRows.map((row, idx) => (
              <tr key={idx}>
                {selectedFactIds.map((fid) => {
                  const usesRange = attributeIsRange(fid);
                  return (
                    <td key={fid} className="px-3 py-2">
                      {usesRange ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="from"
                            className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            value={(row.cells[fid] as any)?.min ?? ""}
                            onChange={(e) => {
                              const next = [...decisionRows];
                              const prev = next[idx];
                              next[idx] = {
                                ...prev,
                                cells: {
                                  ...prev.cells,
                                  [fid]: {
                                    ...((prev.cells as any)[fid] ?? {}),
                                    min: e.target.value
                                  }
                                }
                              } as any;
                              setDecisionRows(next);
                            }}
                          />
                          <input
                            type="number"
                            placeholder="to"
                            className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            value={(row.cells[fid] as any)?.max ?? ""}
                            onChange={(e) => {
                              const next = [...decisionRows];
                              const prev = next[idx];
                              next[idx] = {
                                ...prev,
                                cells: {
                                  ...prev.cells,
                                  [fid]: {
                                    ...((prev.cells as any)[fid] ?? {}),
                                    max: e.target.value
                                  }
                                }
                              } as any;
                              setDecisionRows(next);
                            }}
                          />
                        </div>
                      ) : (
                        <select
                          className="w-48 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          value={(row as any).cells[fid] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            const next = [...decisionRows];
                            (next[idx] as any) = {
                              ...(row as any),
                              cells: { ...(row as any).cells, [fid]: val }
                            };
                            setDecisionRows(next);
                          }}
                        >
                          <option value="">انتخاب گزینه</option>
                          {(() => {
                            const w = window as any;
                            const cache: Record<number, any[]> = (w.__attrOptionsCache =
                              w.__attrOptionsCache || {});
                            const cached = cache[fid];
                            if (!cached) {
                              fetch(`/api/attributes/${fid}/options`, {
                                credentials: "include"
                              })
                                .then((r) => r.json())
                                .then((data) => {
                                  cache[fid] = data;
                                  setDecisionRows((rows) => [...rows]);
                                });
                              return null;
                            }
                            return cached.map((opt: any) => (
                              <option key={opt.rowId} value={opt.rowId}>
                                {opt.value}
                              </option>
                            ));
                          })()}
                        </select>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2">
                  <input
                    className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                    value={(row as any).value ?? ""}
                    onChange={(e) => {
                      const next = [...decisionRows];
                      (next[idx] as any) = { ...(row as any), value: e.target.value };
                      setDecisionRows(next);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs text-white"
                    onClick={() => setDecisionRows((rows) => rows.filter((_, i) => i !== idx))}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-primary px-4 py-1 text-sm text-primary-600"
          onClick={() => {
            const baseCells: any = {};
            selectedFactIds.forEach((id) => {
              baseCells[id] = attributeIsRange(id) ? { min: "", max: "" } : "";
            });
            setDecisionRows((rows) => [...rows, { cells: baseCells, value: "" } as any]);
          }}
        >
          افزودن ردیف
        </button>
        <button
          type="button"
          className="rounded-lg border border-amber-500 px-4 py-1 text-sm text-amber-600"
          onClick={async () => {
            const optionFactIds = selectedFactIds.filter((fid) => !attributeIsRange(fid));
            const rangeFactIds = selectedFactIds.filter((fid) => attributeIsRange(fid));
            const w = window as any;
            const cache: Record<number, any[]> = (w.__attrOptionsCache =
              w.__attrOptionsCache || {});
            await Promise.all(
              optionFactIds.map(async (fid) => {
                if (!cache[fid]) {
                  const resp = await fetch(`/api/attributes/${fid}/options`, {
                    credentials: "include"
                  });
                  cache[fid] = await resp.json();
                }
              })
            );
            const arrays = optionFactIds.map((fid) => (cache[fid] ?? []).map((o: any) => o.rowId));
            if (arrays.length > 0 && arrays.some((a) => a.length === 0)) {
              window.alert("برای برخی ویژگی‌ها گزینه‌ای تعریف نشده است.");
              return;
            }
            if (optionFactIds.length === 0) {
              const baseCells: any = {};
              rangeFactIds.forEach((fid) => (baseCells[fid] = { min: "", max: "" }));
              setDecisionRows((rows) => [...rows, { cells: baseCells, value: "" } as any]);
              return;
            }
            const product: number[][] = arrays.reduce(
              (acc, curr) => acc.flatMap((prev) => curr.map((c) => [...prev, c])),
              [[]] as number[][]
            );
            const newRows = product.map((combo) => {
              const cells: any = {};
              combo.forEach((optId, idx) => {
                const fid = optionFactIds[idx];
                cells[fid] = optId;
              });
              rangeFactIds.forEach((fid) => {
                cells[fid] = { min: "", max: "" };
              });
              return { cells, value: "" } as any;
            });
            setDecisionRows(newRows);
          }}
        >
          تولید خودکار ردیف‌ها
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => setVarWizardStep(2)}
          >
            بازگشت
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!activeVariableId) return;
              const rows = decisionRows.map((r) => {
                const parts = selectedFactIds.map((fid) => {
                  const cell = (r as any).cells[fid];
                  if (attributeIsRange(fid)) {
                    const min = (cell as any)?.min ?? "";
                    const max = (cell as any)?.max ?? "";
                    return `${fid}:${min}||${max}`;
                  }
                  return `${fid}:${cell ?? ""}`;
                });
                return { composition: parts.join(","), value: (r as any).value };
              });
              await replaceOptions.mutateAsync({ rows } as any);
              closeVarModal();
            }}
          >
            ثبت و پایان
          </button>
        </div>
      </div>
    </div>
  );
}
