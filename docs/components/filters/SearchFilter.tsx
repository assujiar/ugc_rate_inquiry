import React from 'react';
import { Input } from '@/components/ui/Input';

export interface SearchFilterProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ label = 'Search', placeholder = 'Search...', value, onChange }) => {
  return (
    <div className="flex flex-col">
      <Input
        label={label}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};