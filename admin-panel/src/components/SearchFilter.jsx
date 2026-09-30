'use client';

import React from 'react';

export default function SearchFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onFilterChange,
  actions,
}) {
  return (
    <div className="filter-bar">
      <div className="filter-left-group">
        <input
          type="text"
          className="filter-search-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={searchPlaceholder}
        />

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="filter-select"
            value={filter.value}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            aria-label={filter.label}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {actions && (
        <div className="filter-right-group">
          {actions}
        </div>
      )}
    </div>
  );
}
