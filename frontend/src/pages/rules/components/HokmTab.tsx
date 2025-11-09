import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/data-table";
import { SectionCard } from "@/components/section-card";
import {
  useHokmYears,
  useCreateHokmYear,
  useUpdateHokmYear,
  useDeleteHokmYear,
  useHokmTypes,
  useCreateHokmType,
  useUpdateHokmType,
  useDeleteHokmType,
  useItems,
  useHokmTypeItems,
  useReplaceHokmTypeItems
} from "@/api/hooks";

export default function HokmTab() {
  const yearForm = useForm<{ year: number; yearpercent: number }>({});
  const { data: years = [] } = useHokmYears();
  const createYear = useCreateHokmYear();
  const updateYear = useUpdateHokmYear();
  const deleteYear = useDeleteHokmYear();

  const typeForm = useForm<{ title: string }>({});
  const { data: types = [] } = useHokmTypes();
  const createType = useCreateHokmType();
  const updateType = useUpdateHokmType();
  const deleteType = useDeleteHokmType();

  const { data: items = [] } = useItems();
  const [activeTypeId, setActiveTypeId] = useState<number | undefined>(undefined);
  const { data: typeItems = [] } = useHokmTypeItems(activeTypeId);
  const replaceTypeItems = useReplaceHokmTypeItems(activeTypeId);
  const [typeItemMap, setTypeItemMap] = useState<Record<number, string>>({});

  // modal state for per-type item linking
  const [showTypeItemsModal, setShowTypeItemsModal] = useState(false);
  const [modalTypeId, setModalTypeId] = useState<number | undefined>(undefined);
  const { data: modalTypeItems = [] } = useHokmTypeItems(modalTypeId);
  const replaceModalTypeItems = useReplaceHokmTypeItems(modalTypeId);
  const [modalTypeItemMap, setModalTypeItemMap] = useState<Record<number, string>>({});
  const [modalSelectedItemIds, setModalSelectedItemIds] = useState<number[]>([]);

  useEffect(() => {
    const m: Record<number, string> = {};
    for (const r of (typeItems as any[]) ?? []) m[r.itemRowId] = String(r.percent ?? "");
    setTypeItemMap(m);
  }, [typeItems]);

  useEffect(() => {
    const m: Record<number, string> = {};
    for (const r of (modalTypeItems as any[]) ?? []) m[r.itemRowId] = String(r.percent ?? "");
    setModalTypeItemMap(m);
    const ids = ((modalTypeItems as any[]) ?? []).map((r) => r.itemRowId);
    setModalSelectedItemIds(ids);
  }, [modalTypeItems, showTypeItemsModal]);

  return (
    <>
      <SectionCard
        title="تنظیمات سال حکم"
        description="افزودن و مدیریت سال‌ها"
        action={
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={yearForm.handleSubmit(async (values) => {
              await createYear.mutateAsync(values);
              yearForm.reset();
            })}
          >
            <div>
              <label className="block text-xs font-medium text-slate-600">سال</label>
              <input
                type="number"
                className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...yearForm.register("year", { valueAsNumber: true, required: true })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">درصد سال</label>
              <input
                type="number"
                className="mt-1 w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...yearForm.register("yearpercent", { valueAsNumber: true, required: true })}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              ثبت سال
            </button>
          </form>
        }
      >
        <DataTable
          data={years as any[]}
          columns={[
            { id: "year", header: "سال", accessor: (item) => item.year },
            { id: "percent", header: "درصد", accessor: (item) => item.yearpercent },
            {
              id: "actions",
              header: "عملیات",
              accessor: (item: any) => (
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-lg border border-amber-500 px-3 py-1 text-amber-600"
                    onClick={async () => {
                      const val = window.prompt("درصد جدید سال:", String(item.yearpercent ?? ""));
                      if (val !== null)
                        await updateYear.mutateAsync({
                          id: item.rowId,
                          payload: { year: item.year, yearpercent: Number(val) }
                        });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                    onClick={() => window.confirm("حذف شود؟") && deleteYear.mutate(item.rowId)}
                  >
                    حذف
                  </button>
                </div>
              )
            }
          ]}
        />
      </SectionCard>

      <SectionCard
        title="انواع حکم"
        description="تعریف و مدیریت انواع حکم"
        action={
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={typeForm.handleSubmit(async (values) => {
              await createType.mutateAsync(values);
              typeForm.reset();
            })}
          >
            <div>
              <label className="block text-xs font-medium text-slate-600">عنوان نوع</label>
              <input
                className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                {...typeForm.register("title", { required: true })}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              ثبت نوع
            </button>
          </form>
        }
      >
        <div className="mb-3 flex items-center gap-3">
          <label className="text-xs text-slate-600">نوع حکم:</label>
          <select
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            value={activeTypeId ?? ""}
            onChange={(e) => setActiveTypeId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">انتخاب نوع</option>
            {(types as any[]).map((t) => (
              <option key={t.rowId} value={t.rowId}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <DataTable
          data={types as any[]}
          columns={[
            { id: "title", header: "عنوان", accessor: (item) => item.title },
            {
              id: "actions",
              header: "عملیات",
              accessor: (item: any) => (
                <div className="flex gap-2 text-xs">
                  <button
                    className="rounded-lg border border-primary px-3 py-1 text-primary-600"
                    onClick={() => {
                      setModalTypeId(item.rowId);
                      setShowTypeItemsModal(true);
                    }}
                  >
                    افزودن آیتم
                  </button>
                  <button
                    className="rounded-lg border border-amber-500 px-3 py-1 text-amber-600"
                    onClick={async () => {
                      const next = window.prompt("عنوان جدید نوع:", item.title);
                      if (next && next !== item.title)
                        await updateType.mutateAsync({ id: item.rowId, payload: { title: next } });
                    }}
                  >
                    ویرایش
                  </button>
                  <button
                    className="rounded-lg bg-rose-600 px-3 py-1 text-white"
                    onClick={() => window.confirm("حذف شود؟") && deleteType.mutate(item.rowId)}
                  >
                    حذف
                  </button>
                </div>
              )
            }
          ]}
        />

        {activeTypeId ? (
          <div className="mt-4 space-y-2">
            {(items as any[]).map((it) => (
              <div key={it.rowId} className="flex items-center gap-2">
                <div className="w-64 text-sm">{it.name}</div>
                <input
                  type="number"
                  className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                  value={typeItemMap[it.rowId] ?? ""}
                  onChange={(e) => setTypeItemMap((m) => ({ ...m, [it.rowId]: e.target.value }))}
                />
              </div>
            ))}
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-1 text-sm font-medium text-white"
              onClick={async () => {
                const rows = Object.entries(typeItemMap)
                  .filter(([_, v]) => v !== "")
                  .map(([itemRowId, percent]) => ({
                    itemRowId: Number(itemRowId),
                    percent: Number(percent)
                  }));
                await replaceTypeItems.mutateAsync({ rows });
                window.alert("آیتم‌های نوع حکم ثبت شد");
              }}
            >
              ذخیره آیتم‌های نوع
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">نوع حکم را انتخاب کنید.</p>
        )}
      </SectionCard>

      {showTypeItemsModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">اتصال آیتم‌ها به نوع حکم</h3>
              <button
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                onClick={() => setShowTypeItemsModal(false)}
              >
                بستن
              </button>
            </div>
            <div className="space-y-2">
              {(items as any[]).map((it) => (
                <div key={it.rowId} className="flex items-center gap-2">
                  <label
                    className={
                      "flex w-64 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1 text-sm " +
                      (modalSelectedItemIds.includes(it.rowId)
                        ? "border-primary text-primary-700"
                        : "border-slate-300 text-slate-700")
                    }
                  >
                    <input
                      type="checkbox"
                      className="align-middle"
                      checked={modalSelectedItemIds.includes(it.rowId)}
                      onChange={(e) =>
                        setModalSelectedItemIds((prev) =>
                          e.target.checked
                            ? [...prev, it.rowId]
                            : prev.filter((id) => id !== it.rowId)
                        )
                      }
                    />
                    {it.name}
                  </label>
                  <input
                    type="number"
                    placeholder="درصد"
                    className={
                      "w-32 rounded-lg border px-2 py-1 text-sm focus:border-primary focus:outline-none " +
                      (modalSelectedItemIds.includes(it.rowId)
                        ? "border-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-400")
                    }
                    value={modalTypeItemMap[it.rowId] ?? ""}
                    onChange={(e) =>
                      setModalTypeItemMap((m) => ({ ...m, [it.rowId]: e.target.value }))
                    }
                    disabled={!modalSelectedItemIds.includes(it.rowId)}
                  />
                </div>
              ))}
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                  onClick={() => setShowTypeItemsModal(false)}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                  onClick={async () => {
                    const rows = modalSelectedItemIds.map((itemRowId) => ({
                      itemRowId,
                      percent: Number(modalTypeItemMap[itemRowId] ?? "0")
                    }));
                    await replaceModalTypeItems.mutateAsync({ rows });
                    setShowTypeItemsModal(false);
                  }}
                >
                  ثبت اتصال‌ها
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
