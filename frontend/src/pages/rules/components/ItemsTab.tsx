function ItemsTab({ searchQuery }: { searchQuery: string }) {
  const itemForm = useForm<{
    name: string;
    description?: string;
    valueMin?: number;
    valueMax?: number;
    valueDefault?: number;
  }>({});
  const { data: items = [] } = useItems();
  const { data: variables = [] } = useRuleVariables();
  const { data: scores = [] } = useRuleScores();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedVarIds, setSelectedVarIds] = useState<number[]>([]);
  const [selectedScoreIds, setSelectedScoreIds] = useState<number[]>([]);
  const [varValueMap, setVarValueMap] = useState<Record<number, string>>({});
  const [scoreValueMap, setScoreValueMap] = useState<Record<number, string>>({});
  const [itemFilter, setItemFilter] = useState<{ name?: string; desc?: string }>({});

  // removed variable/score ratio-by-item editors

  return (
    <>
      <SectionCard
        title="مدیریت آیتم‌ها"
        description="تعریف، ویرایش و حذف آیتم‌ها"
        action={
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setShowItemModal(true);
              itemForm.reset();
              setSelectedVarIds([]);
              setSelectedScoreIds([]);
              setVarValueMap({});
              setScoreValueMap({});
            }}
          >
            افزودن آیتم
          </button>
        }
      >
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600">عنوان</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={itemFilter.name ?? ""}
              onChange={(e) => setItemFilter((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">توضیحات</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={itemFilter.desc ?? ""}
              onChange={(e) => setItemFilter((f) => ({ ...f, desc: e.target.value }))}
            />
          </div>
        </div>
        <DataTable
          data={(() => {
            const q = searchQuery.trim().toLowerCase();
            const base = (items as any[]).filter((it) => {
              if (
                itemFilter.name &&
                !String(it.name ?? "")
                  .toLowerCase()
                  .includes((itemFilter.name ?? "").toLowerCase())
              )
                return false;
              if (
                itemFilter.desc &&
                !String(it.description ?? "")
                  .toLowerCase()
                  .includes((itemFilter.desc ?? "").toLowerCase())
              )
                return false;
              return true;
            });
            if (!q) return base;
            return base.filter((it) => {
              const parts = [it.name, it.description].map((x: any) =>
                String(x ?? "").toLowerCase()
              );
              return parts.some((p: string) => p.includes(q));
            });
          })()}
          columns={[
            { id: "name", header: "عنوان", accessor: (item) => item.name },
            { id: "desc", header: "توضیحات", accessor: (item) => item.description ?? "—" },
            {
              id: "actions",
              header: "عملیات",
              accessor: (item: any) => (
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                    onClick={async () => {
                      const next = window.prompt("عنوان جدید آیتم:", item.name);
                      if (next && next !== item.name)
                        await updateItem.mutateAsync({ id: item.rowId, payload: { name: next } });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                    onClick={() => window.confirm("حذف شود؟") && deleteItem.mutate(item.rowId)}
                  >
                    حذف
                  </button>
                </div>
              )
            }
          ]}
        />
      </SectionCard>

      {showItemModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">افزودن آیتم حکمی</h3>
              <button
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                onClick={() => setShowItemModal(false)}
              >
                بستن
              </button>
            </div>
            <form
              className="grid gap-3 lg:grid-cols-2"
              onSubmit={itemForm.handleSubmit(async (values) => {
                const payload = {
                  name: values.name,
                  description: values.description,
                  valueMin: values.valueMin ?? null,
                  valueMax: values.valueMax ?? null,
                  valueDefault: values.valueDefault ?? null
                };
                const created = await createItem.mutateAsync(payload);
                const itemId = created.rowId as number;
                // prepare ratios
                const varRows = selectedVarIds
                  .map((id) => ({ variableRowId: id, value: Number(varValueMap[id] ?? "0") }))
                  .filter((r) => !Number.isNaN(r.value));
                const scoreRows = selectedScoreIds
                  .map((id) => ({ scoreRowId: id, value: Number(scoreValueMap[id] ?? "0") }))
                  .filter((r) => !Number.isNaN(r.value));
                // call items-side endpoints
                if (varRows.length) {
                  await fetch(`/api/rules/items/${itemId}/variables-ratio`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ rows: varRows })
                  });
                }
                if (scoreRows.length) {
                  await fetch(`/api/rules/items/${itemId}/scores-ratio`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ rows: scoreRows })
                  });
                }
                setShowItemModal(false);
              })}
            >
              <input
                placeholder="name *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...itemForm.register("name", { required: true })}
              />
              <input
                placeholder="description *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...itemForm.register("description", { required: true })}
              />
              <input
                type="number"
                placeholder="min *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...itemForm.register("valueMin", { valueAsNumber: true })}
              />
              <input
                type="number"
                placeholder="max *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...itemForm.register("valueMax", { valueAsNumber: true })}
              />
              <input
                type="number"
                placeholder="value_default *"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...itemForm.register("valueDefault", { valueAsNumber: true })}
              />
              <input
                type="date"
                placeholder="* start_time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <input
                type="date"
                placeholder="* end_time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />

              <div className="col-span-2 mt-2">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                  انتخاب متغیرها (چندانتخابی)
                </h4>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
                  {(variables as any[]).map((v) => {
                    const checked = selectedVarIds.includes(v.rowId);
                    return (
                      <label
                        key={v.rowId}
                        className={
                          "cursor-pointer rounded-full border px-3 py-1 text-xs " +
                          (checked
                            ? "border-primary text-primary-700"
                            : "border-slate-300 text-slate-700")
                        }
                      >
                        <input
                          type="checkbox"
                          className="mr-1 align-middle"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedVarIds((prev) =>
                              e.target.checked
                                ? [...prev, v.rowId]
                                : prev.filter((id) => id !== v.rowId)
                            )
                          }
                        />
                        {v.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                  انتخاب فرمول‌ها (چندانتخابی)
                </h4>
                <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
                  {(scores as any[]).map((s) => {
                    const checked = selectedScoreIds.includes(s.rowId);
                    return (
                      <label
                        key={s.rowId}
                        className={
                          "cursor-pointer rounded-full border px-3 py-1 text-xs " +
                          (checked
                            ? "border-primary text-primary-700"
                            : "border-slate-300 text-slate-700")
                        }
                      >
                        <input
                          type="checkbox"
                          className="mr-1 align-middle"
                          checked={checked}
                          onChange={(e) =>
                            setSelectedScoreIds((prev) =>
                              e.target.checked
                                ? [...prev, s.rowId]
                                : prev.filter((id) => id !== s.rowId)
                            )
                          }
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-2 mt-4">
                <h4 className="mb-2 text-sm font-semibold text-slate-800">
                  مقادیر نسبت (برای متغیرها و فرمول‌ها)
                </h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                          نوع
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                          کلید
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                          عنوان
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                          مقدار
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {selectedScoreIds.map((id) => {
                        const row = (scores as any[]).find((s) => s.rowId === id);
                        return (
                          <tr key={`score-${id}`}>
                            <td className="px-4 py-2">امتیاز (Score)</td>
                            <td className="px-4 py-2">{id}</td>
                            <td className="px-4 py-2">{row?.name}</td>
                            <td className="px-4 py-2">
                              <input
                                className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                                placeholder="...مقدار"
                                value={scoreValueMap[id] ?? ""}
                                onChange={(e) =>
                                  setScoreValueMap((m) => ({ ...m, [id]: e.target.value }))
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                      {selectedVarIds.map((id) => {
                        const row = (variables as any[]).find((v) => v.rowId === id);
                        return (
                          <tr key={`var-${id}`}>
                            <td className="px-4 py-2">متغیر (Variable)</td>
                            <td className="px-4 py-2">{id}</td>
                            <td className="px-4 py-2">{row?.name}</td>
                            <td className="px-4 py-2">
                              <input
                                className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                                placeholder="...مقدار"
                                value={varValueMap[id] ?? ""}
                                onChange={(e) =>
                                  setVarValueMap((m) => ({ ...m, [id]: e.target.value }))
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col-span-2 mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  onClick={() => setShowItemModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  ثبت آیتم
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* نسبت آیتم‌ها به متغیر/فرمول حذف شد */}
    </>
  );
}
