export interface TabOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsNavProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
}

export function TabsNav<T extends string>({
  tabs,
  activeTab,
  onChange,
}: TabsNavProps<T>) {
  return (
    <div className="flex items-center gap-2 border-b border-(--border) pb-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-(--accent) text-white"
                : "text-(--muted) hover:text-(--fg) hover:bg-(--surface-2)"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? "bg-white/20" : "bg-(--surface-2) text-(--fg)"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
