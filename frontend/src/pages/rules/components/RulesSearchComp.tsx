export function RulesSearchComp({
  searchQuery,
  setSearchQuery
}: {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <input
          placeholder="جستجو..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
