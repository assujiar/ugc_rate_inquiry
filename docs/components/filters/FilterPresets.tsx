"use client";

import { useMemo, useState } from "react";

export interface FilterPresetsProps {
  presets: Record<string, any>;
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

export function FilterPresets({ presets, onSave, onLoad, onDelete }: FilterPresetsProps) {
  const [presetName, setPresetName] = useState("");
  const presetKeys = useMemo(() => Object.keys(presets ?? {}), [presets]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="w-40 rounded-md border-gray-300 p-1 text-sm shadow-sm focus:border-accent focus:ring-accent"
          placeholder="Preset name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
        />
        <button
          type="button"
          className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent/90"
          onClick={() => {
            const name = presetName.trim();
            if (!name) return;
            onSave(name);
            setPresetName("");
          }}
        >
          Save
        </button>
      </div>

      {presetKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presetKeys.map((name) => (
            <div
              key={name}
              className="inline-flex items-center space-x-2 rounded-md bg-gray-200 px-2 py-1 text-xs"
            >
              <span className="font-medium">{name}</span>
              <button type="button" className="text-blue-600 hover:underline" onClick={() => onLoad(name)}>
                Load
              </button>
              <button type="button" className="text-red-600 hover:underline" onClick={() => onDelete(name)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
