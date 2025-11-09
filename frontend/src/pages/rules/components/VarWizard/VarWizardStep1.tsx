import React from "react";

export default function VarWizardStep1() {
  return (
    <form
      className="grid gap-3 lg:grid-cols-2"
      onSubmit={variableForm.handleSubmit(async (values) => {
        const payload = {
          name: values.name,
          description: values.description,
          variableVop: values.variableVop,
          valueMin: values.valueMin ?? null,
          valueMax: values.valueMax ?? null,
          valueDefault: values.valueDefault ?? null,
          startTime: values.startTime ? new Date(values.startTime).toISOString() : null,
          endTime: values.endTime ? new Date(values.endTime).toISOString() : null,
          som: values.som
        } as any;
        if (activeVariableId) {
          await updateVariable.mutateAsync({ id: activeVariableId, payload });
        } else {
          const created = await createVariable.mutateAsync(payload);
          setActiveVariableId(created.rowId);
        }
        setVarWizardStep(2);
      })}
    >
      <input
        placeholder="name *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("name", { required: true })}
      />
      <input
        placeholder="description *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("description", { required: true })}
      />
      <input
        type="number"
        placeholder="min *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("valueMin", { valueAsNumber: true })}
      />
      <input
        type="number"
        placeholder="max *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("valueMax", { valueAsNumber: true })}
      />
      <input
        type="number"
        placeholder="value_default *"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("valueDefault", { valueAsNumber: true })}
      />
      <input
        type="date"
        placeholder="* start_time"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("startTime")}
      />
      <input
        type="date"
        placeholder="* end_time"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("endTime")}
      />
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("som")}
      >
        <option value="condition">شرط</option>
        <option value="combination">ترکیب</option>
      </select>
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        {...variableForm.register("variableVop")}
      >
        <option value="value">مقدار</option>
        <option value="percent">درصد</option>
      </select>
      <div className="col-span-2 mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          onClick={closeVarModal}
        >
          انصراف
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          disabled={createVariable.isPending}
        >
          ذخیره و ادامه
        </button>
      </div>
    </form>
  );
}
