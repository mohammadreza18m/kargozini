import React from "react";
import ScoreWizardStep1 from "./ScoreWizardStep1";
import ScoreWizardStep2 from "./ScoreWizardStep2";
import ScoreWizardStep3 from "./ScoreWizardStep3";

export default function MainScoresForm() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {activeScoreId ? "ویرایش امتیاز" : "افزودن امتیاز"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">گام {scoreWizardStep} از 3</p>
          </div>
          <button
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
            onClick={closeScoreModal}
          >
            بستن
          </button>
        </div>

        {scoreWizardStep === 1 ? <ScoreWizardStep1 /> : null}

        {scoreWizardStep === 2 ? <ScoreWizardStep2 /> : null}

        {scoreWizardStep === 3 ? <ScoreWizardStep3 /> : null}
      </div>
    </div>
  );
}
