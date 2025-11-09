import React from "react";

export default function ScoreWizardStep1() {
  return (
    <form
      className="grid gap-3 lg:grid-cols-2"
      onSubmit={scoreForm.handleSubmit(async (values) => {
        const payload = {
          name: values.name,
          description: values.description,
          formula: values.formula,
          condition: values.condition,
          category: values.category,
          ruleSetRowId: values.ruleSetRowId ? Number(values.ruleSetRowId) : undefined,
          scoreVopSom: values.scoreVopSom,
          som: values.som,
          valueMin: (values as any).valueMin ?? null,
          valueMax: (values as any).valueMax ?? null,
          valueDefault: (values as any).valueDefault ?? null,
          startTime: (values as any).startTime
            ? new Date((values as any).startTime).toISOString()
            : null,
          endTime: (values as any).endTime ? new Date((values as any).endTime).toISOString() : null,
          variableIds: []
        } as any;
        if (activeScoreId) {
          await updateScore.mutateAsync({ id: activeScoreId, payload });
        } else {
          const created = await createScore.mutateAsync(payload);
          setActiveScoreId(created.rowId);
        }
        setScoreWizardStep(2);
      })}
    >
      <input
        placeholder="name *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("name", { required: true })}
      />
      <input
        placeholder="description *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("description", { required: true })}
      />
      <input
        placeholder="formula *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("formula", { required: true })}
      />
      <input
        placeholder="category"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("category")}
      />
      <input
        placeholder="min *"
        type="number"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...(scoreForm.register as any)("valueMin", { valueAsNumber: true })}
      />
      <input
        placeholder="max *"
        type="number"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...(scoreForm.register as any)("valueMax", { valueAsNumber: true })}
      />
      <input
        placeholder="value_default *"
        type="number"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...(scoreForm.register as any)("valueDefault", { valueAsNumber: true })}
      />
      <input
        placeholder="* start_time"
        type="date"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...(scoreForm.register as any)("startTime")}
      />
      <input
        placeholder="* end_time"
        type="date"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...(scoreForm.register as any)("endTime")}
      />
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("som")}
      >
        <option value="condition">شرط</option>
        <option value="combination">ترکیب</option>
      </select>
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...scoreForm.register("scoreVopSom")}
      >
        <option value="value">مقدار</option>
        <option value="percent">درصد</option>
      </select>
      <div className="col-span-2 mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={closeScoreModal}
        >
          انصراف
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          ذخیره و ادامه
        </button>
      </div>
    </form>
  );
}
