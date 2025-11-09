type TabKey = "variables" | "scores" | "items" | "auths" | "hokm";

export function RulesNav({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <div className="rounded-2xl bg-white p-2 shadow-sm">
      <nav className="flex gap-2">
        {[
          { key: "variables", label: "متغییر ها" },
          { key: "scores", label: "امتیازات" },
          { key: "items", label: "ایتم ها" },
          { key: "auths", label: "مجوز ها" },
          { key: "hokm", label: "حکم" }
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={
              "rounded-lg px-4 py-2 text-sm " +
              (tab === (t.key as TabKey) ? "bg-primary text-white" : "bg-slate-100 text-slate-700")
            }
            onClick={() => setTab(t.key as TabKey)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
