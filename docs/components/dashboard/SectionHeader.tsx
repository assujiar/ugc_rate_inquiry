import React from 'react';

export interface SectionHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actions }) => {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {actions}
    </div>
  );
};