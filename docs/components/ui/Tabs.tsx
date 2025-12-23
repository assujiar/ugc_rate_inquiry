"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

export interface TabItem {
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Tabs({ tabs, defaultIndex = 0, orientation = "horizontal", className }: TabsProps) {
  const safeDefault = Math.min(Math.max(defaultIndex, 0), Math.max(tabs.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(safeDefault);

  const isVertical = orientation === "vertical";
  const active = useMemo(() => tabs[activeIndex], [tabs, activeIndex]);

  return (
    <div className={clsx(className, isVertical ? "flex" : "flex flex-col")}>
      <div
        className={clsx(
          "flex",
          isVertical ? "flex-col mr-4 space-y-2" : "flex-row mb-4 space-x-2 overflow-x-auto"
        )}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, idx) => {
          const selected = activeIndex === idx;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={selected}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent",
                selected ? "bg-accent text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
              onClick={() => setActiveIndex(idx)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1" role="tabpanel">
        {active ? <div>{active.content}</div> : null}
      </div>
    </div>
  );
}
