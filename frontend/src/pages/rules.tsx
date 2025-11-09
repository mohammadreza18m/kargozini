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
import { VariablesTab } from "./rules/components/VariablesTab";
import { RulesSearchComp } from "./rules/components/RulesSearchComp";
import MainVarForm from "./rules/components/VarWizard/MainVarForm";
import ScoresTab from "./rules/components/ScoresTab";
import MainScoresForm from "./rules/components/ScoreWizard/MainScoresForm";
import ItemsTab from "./rules/components/ItemsTab";
import AuthsTab from "./rules/components/AuthsTab";
import HokmTab from "./rules/components/HokmTab";

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

      {tab === "variables" && showVarModal ? (
        <MainVarForm
          {...{
            varWizardStep,
            closeVarModal,
            variableForm,
            activeVariableId,
            updateVariable,
            createVariable,
            setActiveVariableId,
            setVarWizardStep,
            attrsQuery,
            attributeList,
            selectedFactIds,
            setSelectedFactIds,
            setFacts,
            decisionRows,
            attributeIsRange,
            setDecisionRows,
            replaceOptions
          }}
        />
      ) : null}

      {tab === "scores" ? (
        <ScoresTab
          {...{
            openScoreModal,
            scoreFilter,
            setScoreFilter,
            searchQuery,
            scores,
            ruleSetLookup,
            beginEditScore,
            deleteScore,
            duplicateScore,
            publishScore
          }}
        />
      ) : null}

      {tab === "scores" && showScoreModal ? (
        <MainScoresForm
          {...{
            activeScoreId,
            scoreWizardStep,
            closeScoreModal,
            setScoreWizardStep,
            setActiveScoreId,
            scoreForm,
            updateScore,
            createScore,
            variables,
            selectedScoreVarIds,
            setSelectedScoreVarIds,
            setScoreVars,
            scoreDecisionRows,
            setScoreDecisionRows,
            replaceScoreOptions
          }}
        />
      ) : null}

      {tab === "items" ? <ItemsTab searchQuery={searchQuery} /> : null}

      {tab === "auths" ? <AuthsTab searchQuery={searchQuery} /> : null}

      {tab === "hokm" ? <HokmTab /> : null}
    </div>
  );
}

