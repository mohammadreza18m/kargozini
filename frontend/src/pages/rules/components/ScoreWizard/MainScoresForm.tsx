// @ts-nocheck
import ScoreWizardStep1 from "./ScoreWizardStep1";
import ScoreWizardStep2 from "./ScoreWizardStep2";
import ScoreWizardStep3 from "./ScoreWizardStep3";
import ScoreWizardStep4 from "./ScoreWizardStep4";

type ScoreDTCell = { [varId: number]: { min?: string; max?: string } };

export default function MainScoresForm({
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
  attributeList,
  attributeIsRange,
  selectedScoreAttrIds,
  setSelectedScoreAttrIds,
  scoreDecisionRows,
  setScoreDecisionRows,
  replaceScoreOptions
}: {
  activeScoreId: number | null;
  scoreWizardStep: 1 | 2 | 3 | 4;
  closeScoreModal: () => void;
  setScoreWizardStep: (s: 1 | 2 | 3 | 4) => void;
  setActiveScoreId: (id: number | null) => void;
  scoreForm: any;
  updateScore: any;
  createScore: any;
  variables: any[];
  selectedScoreVarIds: number[];
  setSelectedScoreVarIds: (ids: number[]) => void;
  setScoreVars: any;
  attributeList: any[];
  attributeIsRange: (id: number) => boolean;
  selectedScoreAttrIds: number[];
  setSelectedScoreAttrIds: (ids: number[]) => void;
  scoreDecisionRows: Array<{ cells: ScoreDTCell; value: string }>;
  setScoreDecisionRows: (rows: Array<{ cells: ScoreDTCell; value: string }>) => void | any;
  replaceScoreOptions: any;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {activeScoreId ? "ویرایش امتیاز" : "افزودن امتیاز"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">گام {scoreWizardStep} از ۴</p>
          </div>
          <button
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
            onClick={closeScoreModal}
          >
            بستن
          </button>
        </div>

        {scoreWizardStep === 1 ? (
          <ScoreWizardStep1
            {...{
              scoreForm,
              updateScore,
              createScore,
              activeScoreId,
              setActiveScoreId,
              setScoreWizardStep,
              closeScoreModal
            }}
          />
        ) : null}

        {scoreWizardStep === 2 ? (
          <ScoreWizardStep2
            {...{
              variables,
              selectedScoreVarIds,
              setSelectedScoreVarIds,
              setScoreWizardStep,
              activeScoreId,
              setScoreVars
            }}
          />
        ) : null}

        {scoreWizardStep === 3 ? (
          <ScoreWizardStep3
            {...{
              attributeList,
              selectedScoreAttrIds,
              setSelectedScoreAttrIds,
              setScoreWizardStep
            }}
          />
        ) : null}

        {scoreWizardStep === 4 ? (
          <ScoreWizardStep4
            {...{
              attributeList,
              attributeIsRange,
              selectedScoreAttrIds,
              scoreDecisionRows,
              setScoreDecisionRows,
              setScoreWizardStep,
              activeScoreId,
              replaceScoreOptions,
              closeScoreModal
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
