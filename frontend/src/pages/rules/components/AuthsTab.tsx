function AuthsTab({ searchQuery }: { searchQuery: string }) {
  const authForm = useForm<{ name: string; description?: string; percent?: number }>({});
  const { data: auths = [] } = useAuths();
  const { data: items = [] } = useItems();
  const createAuth = useCreateAuth();
  const updateAuth = useUpdateAuth();
  const deleteAuth = useDeleteAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [activeEditAuthId, setActiveEditAuthId] = useState<number | undefined>(undefined);
  const { data: editAuthItems } = useAuthItems(activeEditAuthId);
  useEffect(() => {
    if (activeEditAuthId) {
      setSelectedItemIds(editAuthItems?.itemIds ?? []);
    }
  }, [activeEditAuthId, editAuthItems]);
  const [authFilter, setAuthFilter] = useState<{ name?: string; percent?: "" | "has" | "none" }>({
    percent: ""
  });

  return (
    <>
      <SectionCard
        title="مدیریت مجوزها"
        description="تعریف، ویرایش و حذف مجوزها"
        action={
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={() => {
              setActiveEditAuthId(undefined);
              setShowAuthModal(true);
              authForm.reset();
              setSelectedItemIds([]);
            }}
          >
            افزودن مجوز
          </button>
        }
      >
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-600">عنوان</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={authFilter.name ?? ""}
              onChange={(e) => setAuthFilter((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600">درصد</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
              value={authFilter.percent ?? ""}
              onChange={(e) => setAuthFilter((f) => ({ ...f, percent: e.target.value as any }))}
            >
              <option value="">همه</option>
              <option value="has">دارای درصد</option>
              <option value="none">بدون درصد</option>
            </select>
          </div>
        </div>
        <DataTable
          data={(() => {
            const q = searchQuery.trim().toLowerCase();
            const base = (auths as any[]).filter((a) => {
              if (
                authFilter.name &&
                !String(a.name ?? "")
                  .toLowerCase()
                  .includes((authFilter.name ?? "").toLowerCase())
              )
                return false;
              if (authFilter.percent === "has" && a.percent == null) return false;
              if (authFilter.percent === "none" && a.percent != null) return false;
              return true;
            });
            if (!q) return base;
            return base.filter((a) => {
              const parts = [a.name, a.description, a.percent].map((x: any) =>
                String(x ?? "").toLowerCase()
              );
              return parts.some((p: string) => p.includes(q));
            });
          })()}
          columns={[
            { id: "name", header: "عنوان", accessor: (item) => item.name },
            { id: "percent", header: "درصد", accessor: (item) => item.percent ?? "—" },
            {
              id: "actions",
              header: "عملیات",
              accessor: (item: any) => (
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-lg border border-amber-500 px-3 py-1 text-amber-600"
                    onClick={() => {
                      setActiveEditAuthId(item.rowId);
                      setShowAuthModal(true);
                      authForm.reset({
                        name: item.name,
                        description: item.description ?? "",
                        percent: item.percent ?? undefined
                      });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                    onClick={() => window.confirm("حذف شود؟") && deleteAuth.mutate(item.rowId)}
                  >
                    حذف
                  </button>
                </div>
              )
            }
          ]}
        />
      </SectionCard>

      {showAuthModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                {activeEditAuthId ? "ویرایش مجوز" : "افزودن مجوز"}
              </h3>
              <button
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                onClick={() => setShowAuthModal(false)}
              >
                بستن
              </button>
            </div>
            <form
              className="grid gap-3"
              onSubmit={authForm.handleSubmit(async (values) => {
                const payload = {
                  name: values.name,
                  description: values.description,
                  percent: values.percent ?? null
                };
                let authId = activeEditAuthId;
                if (activeEditAuthId) {
                  await updateAuth.mutateAsync({ id: activeEditAuthId, payload });
                } else {
                  const created = await createAuth.mutateAsync(payload);
                  authId = (created as any).rowId as number;
                }
                if (authId && selectedItemIds.length > 0) {
                  await fetch(`/api/rules/auths/${authId}/items`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ itemIds: selectedItemIds })
                  });
                }
                setShowAuthModal(false);
                authForm.reset();
                setSelectedItemIds([]);
                setActiveEditAuthId(undefined);
              })}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600">عنوان</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    {...authForm.register("name", { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600">درصد</label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    {...authForm.register("percent", { valueAsNumber: true })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600">توضیحات</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    {...authForm.register("description")}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600">انتخاب آیتم‌ها</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(items as any[]).map((it) => {
                    const checked = selectedItemIds.includes(it.rowId);
                    return (
                      <label
                        key={it.rowId}
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
                            setSelectedItemIds((prev) =>
                              e.target.checked
                                ? [...prev, it.rowId]
                                : prev.filter((id) => id !== it.rowId)
                            )
                          }
                        />
                        {it.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  onClick={() => setShowAuthModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  {activeEditAuthId ? "ویرایش مجوز" : "ثبت مجوز"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
