import React from 'react';
import './Pagination.css';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="pagination-nav" aria-label="Pagination Navigation">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        ← Previous
      </button>

      <div className="pagination-numbers">
        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              className={`pagination-number ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        Next →
      </button>
    </nav>
  );
};
