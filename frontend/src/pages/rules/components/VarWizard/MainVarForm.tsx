import React from "react";
import VarWizardStep1 from "./VarWizardStep1";
import VarWizardStep2 from "./VarWizardStep2";
import VarWizardStep3 from "./VarWizardStep3";

export default function MainVarForm({
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
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">افزودن متغیر</h3>
            <p className="mt-1 text-xs text-slate-500">گام {varWizardStep} از 3</p>
          </div>
          <button
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
            onClick={closeVarModal}
          >
            بستن
          </button>
        </div>

        {varWizardStep === 1 ? <VarWizardStep1 /> : null}

        {varWizardStep === 2 ? <VarWizardStep2 /> : null}

        {varWizardStep === 3 ? <VarWizardStep3 /> : null}
      </div>
    </div>
  );
}
