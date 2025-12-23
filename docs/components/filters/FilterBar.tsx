import React from 'react';

export const FilterBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md bg-gray-50 p-4 shadow-sm">
      {children}
    </div>
  );
};