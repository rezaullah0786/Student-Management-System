import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 * Implements debounced search queries to avoid flooding the backend API on every keystroke.
 */
export default function SearchBar({ onSearch, placeholder = 'Search by name, roll no, department...' }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the user input by 350ms before firing the API callback
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-box-wrapper">
      <Search size={16} className="search-icon-inside" />
      <input
        type="text"
        className="search-input-field"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        aria-label="Search student records"
      />
      {searchTerm && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          title="Clear search"
          aria-label="Clear search query"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
