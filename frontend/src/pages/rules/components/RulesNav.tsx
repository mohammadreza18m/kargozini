const RulesNav = () => {
  return (
    <div className="rounded-2xl bg-white p-2 shadow-sm">
      <nav className="flex gap-2">
        {[
          { key: "variables", label: "متغیرها" },
          { key: "scores", label: "فرمول‌ها" },
          { key: "items", label: "آیتم‌ها" },
          { key: "auths", label: "مجوزها" },
          { key: "hokm", label: "حکم" }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              "rounded-lg px-4 py-2 text-sm " +
              (tab === (t.key as any) ? "bg-primary text-white" : "bg-slate-100 text-slate-700")
            }
            onClick={() => setTab(t.key as any)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
