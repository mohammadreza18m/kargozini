// @ts-nocheck
type ScoreDTCell = { [id: number]: any };

export default function ScoreWizardStep4({
  attributeList,
  attributeIsRange,
  selectedScoreAttrIds,
  scoreDecisionRows,
  setScoreDecisionRows,
  setScoreWizardStep,
  activeScoreId,
  replaceScoreOptions,
  closeScoreModal
}: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">4) جدول تصمیم</h4>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {selectedScoreAttrIds.map((fid: number) => (
                <th key={fid} className="px-3 py-2 text-right text-xs font-medium text-slate-500">
                  {attributeList.find((a: any) => a.rowId === fid)?.displayName ??
                    attributeList.find((a: any) => a.rowId === fid)?.name}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">مقدار</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {scoreDecisionRows.map((row: any, idx: number) => (
              <tr key={idx}>
                {selectedScoreAttrIds.map((fid: number) => {
                  const usesRange = attributeIsRange(fid);
                  return (
                    <td key={fid} className="px-3 py-2">
                      {usesRange ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="از"
                            className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            value={(row.cells[fid] as any)?.min ?? ""}
                            onChange={(e) => {
                              const next = [...scoreDecisionRows];
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
                              setScoreDecisionRows(next);
                            }}
                          />
                          <input
                            type="number"
                            placeholder="تا"
                            className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            value={(row.cells[fid] as any)?.max ?? ""}
                            onChange={(e) => {
                              const next = [...scoreDecisionRows];
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
                              setScoreDecisionRows(next);
                            }}
                          />
                        </div>
                      ) : (
                        <select
                          className="w-48 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                          value={(row as any).cells[fid] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : "";
                            const next = [...scoreDecisionRows];
                            (next[idx] as any) = {
                              ...(row as any),
                              cells: { ...(row as any).cells, [fid]: val }
                            };
                            setScoreDecisionRows(next);
                          }}
                        >
                          <option value="">انتخاب گزینه</option>
                          {(() => {
                            const w = window as any;
                            const cache: Record<number, any[]> = (w.__attrOptionsCache =
                              w.__attrOptionsCache || {});
                            const cached = cache[fid];
                            if (!cached) {
                              fetch(`/api/attributes/${fid}/options`, { credentials: "include" })
                                .then((r) => r.json())
                                .then((rows) => (cache[fid] = rows));
                            }
                            return (cached ?? []).map((o: any) => (
                              <option key={o.rowId} value={o.rowId}>
                                {o.name}
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
                    onClick={() => setScoreDecisionRows((rows: any[]) => rows.filter((_, i) => i !== idx))}
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
          onClick={async () => {
            const optionFactIds = selectedScoreAttrIds.filter((fid: number) => !attributeIsRange(fid));
            const rangeFactIds = selectedScoreAttrIds.filter((fid: number) => attributeIsRange(fid));
            const w = window as any;
            const cache: Record<number, any[]> = (w.__attrOptionsCache = w.__attrOptionsCache || {});
            await Promise.all(
              optionFactIds.map(async (fid: number) => {
                if (!cache[fid]) {
                  const resp = await fetch(`/api/attributes/${fid}/options`, { credentials: "include" });
                  cache[fid] = await resp.json();
                }
              })
            );
            const arrays = optionFactIds.map((fid: number) => (cache[fid] ?? []).map((o: any) => o.rowId));
            if (optionFactIds.length === 0) {
              const baseCells: any = {};
              rangeFactIds.forEach((fid: number) => (baseCells[fid] = { min: "", max: "" }));
              setScoreDecisionRows((rows: any[]) => [...rows, { cells: baseCells, value: "" } as any]);
              return;
            }
            const product: number[][] = arrays.reduce(
              (acc: number[][], curr: number[]) => acc.flatMap((prev: number[]) => curr.map((c: number) => [...prev, c])),
              [[]] as number[][]
            );
            const newRows = product.map((combo: number[]) => {
              const cells: any = {};
              combo.forEach((optId, idx) => {
                const fid = optionFactIds[idx];
                cells[fid] = optId;
              });
              rangeFactIds.forEach((fid: number) => {
                cells[fid] = { min: "", max: "" };
              });
              return { cells, value: "" } as any;
            });
            setScoreDecisionRows(newRows);
          }}
        >
          افزودن ردیف‌ها از ترکیب‌ها
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
            onClick={() => setScoreWizardStep(3)}
          >
            قبلی
          </button>
          <button
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!activeScoreId) return;
              const rows = scoreDecisionRows.map((r: any) => {
                const parts = selectedScoreAttrIds.map((fid: number) => {
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
              await replaceScoreOptions.mutateAsync({ rows } as any);
              closeScoreModal();
            }}
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}
