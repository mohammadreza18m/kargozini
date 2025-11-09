import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RulesNav } from "./rules/components/RulesNav";
import {
  useCreateRuleScore,
  useCreateRuleSet,
  useCreateRuleVariable,
  useDeleteRuleVariable,
  useDuplicateRuleScore,
  usePublishRuleScore,
  useDeleteRuleScore,
  useRuleScores,
  useRuleSets,
  useRuleVariables,
  useAttributes,
  useVariableOptions,
  useVariableFacts,
  useSetVariableFacts,
  useReplaceVariableOptions,
  useUpdateRuleVariable
} from "../api/hooks";
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useAuths,
  useCreateAuth,
  useUpdateAuth,
  useDeleteAuth,
  useAuthItems,
  useHokmYears,
  useCreateHokmYear,
  useUpdateHokmYear,
  useDeleteHokmYear,
  useHokmTypes,
  useCreateHokmType,
  useUpdateHokmType,
  useDeleteHokmType,
  useHokmTypeItems,
  useReplaceHokmTypeItems
} from "../api/hooks";
import {
  useScoreOptions,
  useScoreVariables,
  useSetScoreVariables,
  useReplaceScoreOptions
} from "../api/hooks";
import { useUpdateRuleScore } from "../api/hooks";
import { DataTable } from "../components/data-table";
import { SectionCard } from "../components/section-card";
import { VariablesTab } from "./rules/components/VariablesTab";
import MainVarForm from "./rules/components/VarWizard/MainVarForm";
import ScoresTab from "./rules/components/ScoresTab";
import MainScoresForm from "./rules/components/ScoreWizard/MainScoresForm";

interface VariableFormValues {
  name: string;
  description?: string;
  variableVop: "value" | "percent";
  valueMin?: number;
  valueMax?: number;
  valueDefault?: number;
  startTime?: string;
  endTime?: string;
  som: "condition" | "combination";
  scoreVopSom?: "value" | "percent";
}

interface ScoreFormValues {
  name: string;
  description?: string;
  category?: string;
  ruleSetRowId?: number;
  condition?: string;
  formula: string;
  scoreVopSom: "value" | "percent";
  som: "condition" | "combination";
}

interface RuleSetFormValues {
  name: string;
  description?: string;
}

type RuleSetRecord = { rowId: number; name: string; description?: string | null };
type VariableRecord = {
  rowId: number;
  name: string | null;
  description: string | null;
  variableVop: "value" | "percent" | null;
  som: "condition" | "combination" | null;
  valueMin: number | null;
  valueMax: number | null;
  valueDefault: number | null;
  startTime: string | null;
  endTime: string | null;
};

type AttributeRecord = {
  rowId: number;
  name: string;
  displayName?: string | null;
  som: number | null;
};

export function RuleManagementPage() {
  const [tab, setTab] = useState<"variables" | "scores" | "items" | "auths" | "hokm">("variables");
  const [searchQuery, setSearchQuery] = useState("");
  // column filters
  const [varFilter, setVarFilter] = useState<{
    name?: string;
    som?: "" | "condition" | "combination";
    vop?: "" | "value" | "percent";
  }>({ som: "", vop: "" });
  const [scoreFilter, setScoreFilter] = useState<{
    name?: string;
    category?: string;
    status?: "" | "active" | "draft";
    som?: "" | "condition" | "combination";
    vop?: "" | "value" | "percent";
  }>({ status: "", som: "", vop: "" });

  const variableForm = useForm<VariableFormValues>({
    defaultValues: {
      variableVop: "value",
      som: "condition"
    }
  });

  const scoreForm = useForm<ScoreFormValues>({
    defaultValues: {
      scoreVopSom: "value",
      som: "condition"
    }
  });

  const ruleSetForm = useForm<RuleSetFormValues>({});

  const { data: variables = [] } = useRuleVariables();
  const { data: scores = [] } = useRuleScores();
  const { data: ruleSets = [] } = useRuleSets();

  const createVariable = useCreateRuleVariable();
  const updateVariable = useUpdateRuleVariable();
  const deleteVariable = useDeleteRuleVariable();
  const createScore = useCreateRuleScore();
  const createRuleSet = useCreateRuleSet();
  const publishScore = usePublishRuleScore();
  const deleteScore = useDeleteRuleScore();
  const duplicateScore = useDuplicateRuleScore();
  const updateScore = useUpdateRuleScore();

  // Facts + decision table state
  const [activeVariableId, setActiveVariableId] = useState<number | null>(null);
  const attrsQuery = useAttributes();
  const attrs = (attrsQuery.data ?? []) as any[];
  const { data: existingFacts } = useVariableFacts(activeVariableId ?? undefined);
  const [selectedFactIds, setSelectedFactIds] = useState<number[]>([]);
  const setFacts = useSetVariableFacts(activeVariableId ?? undefined);
  const { data: existingOptions = [] } = useVariableOptions(activeVariableId ?? undefined);
  const replaceOptions = useReplaceVariableOptions(activeVariableId ?? undefined);
  // modal + wizard for adding variable
  const [showVarModal, setShowVarModal] = useState(false);
  const [varWizardStep, setVarWizardStep] = useState<1 | 2 | 3>(1);
  const openVarModal = () => {
    setShowVarModal(true);
    setVarWizardStep(1);
    variableForm.reset({ variableVop: "value", som: "condition" });
    setSelectedFactIds([]);
    setDecisionRows([]);
    // ensure attributes are fetched for step 2
    setTimeout(() => {
      attrsQuery.refetch?.();
    }, 0);
  };
  const closeVarModal = () => setShowVarModal(false);
  // keep facts/options synced when editing in modal
  useEffect(() => {
    if (showVarModal && activeVariableId) {
      initFromServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVarModal, activeVariableId, existingFacts, existingOptions]);

  // Keep local state in sync when switching active variable
  const variableList = variables as VariableRecord[];
  const attributeList = (attrs as any[]).map((a) => ({
    rowId: a.rowId,
    name: a.name,
    displayName: a.displayName,
    som:
      typeof a.som === "number" ? a.som : typeof a.attributeSom === "number" ? a.attributeSom : null
  })) as AttributeRecord[];
  const attributeSomLookup = useMemo(() => {
    const map = new Map<number, number>();
    attributeList.forEach((attr) => map.set(attr.rowId, attr.som ?? 0));
    return map;
  }, [attributeList]);
  const attributeIsRange = (attributeId: number) =>
    (attributeSomLookup.get(attributeId) ?? 0) === 1;

  // utility: composition row type
  type DTCell = { [attrId: number]: { min?: string; max?: string } | number | "" };
  type DTDecisionRow = { cells: DTCell; value: string };
  const [decisionRows, setDecisionRows] = useState<Array<DTDecisionRow>>([]);

  // initialize facts/options when active variable changes
  const initFromServer = () => {
    const factIds = existingFacts?.factIds ?? [];
    setSelectedFactIds(factIds);
    const rows = (existingOptions as any[]).map((r) => {
      let parsed: DTCell = {};
      try {
        parsed = JSON.parse(r.composition || "{}");
      } catch {
        // try notation: id:value or id:min||max
        parsed = {} as DTCell;
        if (typeof r.composition === "string" && r.composition.includes(":")) {
          const parts = r.composition
            .split(",")
            .map((p: string) => p.trim())
            .filter(Boolean);
          for (const part of parts) {
            const [k, rest] = part.split(":");
            if (!k || typeof rest === "undefined") continue;
            if (rest.includes("||")) {
              const [minStr, maxStr] = rest.split("||");
              (parsed as any)[Number(k)] = { min: minStr ?? "", max: maxStr ?? "" };
            } else {
              const val = rest === "" ? "" : Number(rest);
              (parsed as any)[Number(k)] = Number.isNaN(val as any) ? "" : (val as any);
            }
          }
        }
      }
      return { cells: parsed, value: String(r.value ?? "") } as DTDecisionRow;
    });
    setDecisionRows(rows);
  };

  // handle switch to edit a variable
  const beginEditVariable = (v: VariableRecord) => {
    setActiveVariableId(v.rowId);
    variableForm.reset({
      name: v.name ?? "",
      description: v.description ?? "",
      variableVop: (v.variableVop ?? "value") as any,
      som: (v.som ?? "condition") as any,
      valueMin: v.valueMin ?? undefined,
      valueMax: v.valueMax ?? undefined,
      valueDefault: v.valueDefault ?? undefined,
      startTime: v.startTime ?? undefined,
      endTime: v.endTime ?? undefined
    });
    setSelectedFactIds([]);
    setDecisionRows([]);
    setShowVarModal(true);
    setVarWizardStep(1);
  };

  const clearEdit = () => {
    setActiveVariableId(null);
    variableForm.reset({ variableVop: "value", som: "condition" });
    setSelectedFactIds([]);
    setDecisionRows([]);
  };

  const ruleSetList = (ruleSets ?? []) as RuleSetRecord[];

  const ruleSetLookup = useMemo(() => {
    const map = new Map<number, string>();
    for (const set of ruleSetList) {
      map.set(set.rowId, set.name);
    }
    return map;
  }, [ruleSetList]);

  // "Add Score" modal wizard state (inside component scope)
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreWizardStep, setScoreWizardStep] = useState<1 | 2 | 3>(1);
  const [activeScoreId, setActiveScoreId] = useState<number | null>(null);
  const scoreVarsQuery = useScoreVariables(activeScoreId ?? undefined);
  const setScoreVars = useSetScoreVariables(activeScoreId ?? undefined);
  const scoreOptionsQuery = useScoreOptions(activeScoreId ?? undefined);
  const replaceScoreOptions = useReplaceScoreOptions(activeScoreId ?? undefined);
  const [selectedScoreVarIds, setSelectedScoreVarIds] = useState<number[]>([]);
  type ScoreDTCell = { [varId: number]: { min?: string; max?: string } };
  const [scoreDecisionRows, setScoreDecisionRows] = useState<
    Array<{ cells: ScoreDTCell; value: string }>
  >([]);

  useEffect(() => {
    const ids = scoreVarsQuery.data?.variableIds ?? [];
    setSelectedScoreVarIds(ids);
  }, [scoreVarsQuery.data]);

  useEffect(() => {
    const rows =
      (scoreOptionsQuery.data as any[] | undefined)?.map((r) => {
        let cells: ScoreDTCell = {};
        try {
          cells = JSON.parse(r.composition || "{}");
        } catch {
          // notation: id:min||max,id2:min||max
          cells = {} as ScoreDTCell;
          if (typeof r.composition === "string" && r.composition.includes(":")) {
            const parts = r.composition
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean);
            for (const part of parts) {
              const [k, rest] = part.split(":");
              if (!k || typeof rest === "undefined") continue;
              const [minStr, maxStr] = rest.split("||");
              (cells as any)[Number(k)] = { min: minStr ?? "", max: maxStr ?? "" };
            }
          }
        }
        return { cells, value: String(r.value ?? "") };
      }) ?? [];
    setScoreDecisionRows(rows);
  }, [scoreOptionsQuery.data]);

  const openScoreModal = () => {
    setShowScoreModal(true);
    setScoreWizardStep(1);
    setActiveScoreId(null);
    setSelectedScoreVarIds([]);
    setScoreDecisionRows([]);
  };
  const closeScoreModal = () => setShowScoreModal(false);

  const beginEditScore = (item: any) => {
    setActiveScoreId(item.rowId);
    setShowScoreModal(true);
    setScoreWizardStep(1);
    scoreForm.reset({
      name: item.name ?? "",
      description: item.description ?? "",
      formula: item.formula ?? "",
      condition: item.condition ?? "",
      category: item.category ?? "",
      ruleSetRowId: item.ruleSetRowId ?? undefined,
      scoreVopSom: (item.scoreVopSom ?? "value") as any,
      som: (item.som ?? "condition") as any,
      ...(item.valueMin != null ? { valueMin: item.valueMin } : {}),
      ...(item.valueMax != null ? { valueMax: item.valueMax } : {}),
      ...(item.valueDefault != null ? { valueDefault: item.valueDefault } : {}),
      ...(item.startTime ? { startTime: String(item.startTime).slice(0, 10) } : {}),
      ...(item.endTime ? { endTime: String(item.endTime).slice(0, 10) } : {})
    } as any);
  };

  return (
    <div className="space-y-6">
      <RulesNav {...{ tab, setTab }} />

      <RulesSearchComp {...{ searchQuery, setSearchQuery }} />

      {tab === "variables" ? (
        <VariablesTab
          {...{
            openVarModal,
            varFilter,
            setVarFilter,
            searchQuery,
            variableList,
            beginEditVariable,
            deleteVariable
          }}
        />
      ) : null}

      {tab === "variables" && showVarModal ? <MainVarForm /> : null}

      {tab === "scores" ? <ScoresTab /> : null}

      {tab === "scores" && showScoreModal ? <MainScoresForm /> : null}

      {tab === "items" ? <ItemsTab searchQuery={searchQuery} /> : null}

      {tab === "auths" ? <AuthsTab searchQuery={searchQuery} /> : null}

      {tab === "hokm" ? <HokmTab /> : null}
    </div>
  );
}

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

function HokmTab() {
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
