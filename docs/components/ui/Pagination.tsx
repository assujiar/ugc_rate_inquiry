import React from 'react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const handlePrev = () => {
    if (!prevDisabled) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (!nextDisabled) onPageChange(page + 1);
  };
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <div>
        Page {page} of {totalPages}
      </div>
      <div className="space-x-2">
        <Button variant="secondary" size="sm" onClick={handlePrev} disabled={prevDisabled}>
          Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={handleNext} disabled={nextDisabled}>
          Next
        </Button>
      </div>
    </div>
  );
};