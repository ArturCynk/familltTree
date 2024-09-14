import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
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

  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        className={`p-2 rounded-full ${currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}`}
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      <span className="text-sm text-gray-700">
        Strona {currentPage} z {totalPages}
      </span>
      <button
        className={`p-2 rounded-full ${currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}`}
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default Pagination;
