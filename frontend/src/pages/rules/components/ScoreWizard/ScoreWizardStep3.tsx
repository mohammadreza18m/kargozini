// @ts-nocheck
export default function ScoreWizardStep3({
  attributeList,
  selectedScoreAttrIds,
  setSelectedScoreAttrIds,
  setScoreWizardStep
}: any) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-800">3) ?????? ????????</h4>
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 p-3">
        {attributeList.map((a: any) => {
          const checked = selectedScoreAttrIds.includes(a.rowId);
          return (
            <label
              key={a.rowId}
              className={
                "cursor-pointer rounded-full border px-3 py-1 text-xs " +
                (checked ? "border-primary text-primary-700" : "border-slate-300 text-slate-700")
              }
            >
              <input
                type="checkbox"
                className="mr-1 align-middle"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selectedScoreAttrIds, a.rowId]
                    : selectedScoreAttrIds.filter((id: number) => id !== a.rowId);
                  setSelectedScoreAttrIds(next);
                }}
              />
              {a.displayName ?? a.name}
            </label>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={() => setScoreWizardStep(2)}
        >
          ????
        </button>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          onClick={() => setScoreWizardStep(4)}
        >
          ?????
        </button>
      </div>
    </div>
  );
}
