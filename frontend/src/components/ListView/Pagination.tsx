import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight
} from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  isMobile?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '',
  isMobile = false
}) => {
  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  // Generate page numbers to display - fewer on mobile
  const getPageNumbers = () => {
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const leftOffset = Math.floor(maxVisiblePages / 2);
    let start = currentPage - leftOffset;
    let end = currentPage + leftOffset;

    if (start < 1) {
      start = 1;
      end = maxVisiblePages;
    } else if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisiblePages + 1;
    }

    if (start > 1) pages.push(1, '...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages) pages.push('...', totalPages);

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
          aria-label="Pierwsza strona"
        >
          <FontAwesomeIcon icon={faAngleDoubleLeft} size={isMobile ? "xs" : "sm"} />
        </button>

        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
          aria-label="Poprzednia strona"
        >
          <FontAwesomeIcon icon={faChevronLeft} size={isMobile ? "xs" : "sm"} />
        </button>
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`flex items-center justify-center rounded-lg transition-colors text-sm ${
                currentPage === page
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${
                isMobile ? 'w-8 h-8' : 'w-10 h-10'
              }`}
              aria-label={`Strona ${page}`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 sm:px-2 text-gray-500 dark:text-gray-400 text-sm">...</span>
          )
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
          aria-label="Następna strona"
        >
          <FontAwesomeIcon icon={faChevronRight} size={isMobile ? "xs" : "sm"} />
        </button>

        <button
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300'
          }`}
          aria-label="Ostatnia strona"
        >
          <FontAwesomeIcon icon={faAngleDoubleRight} size={isMobile ? "xs" : "sm"} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;