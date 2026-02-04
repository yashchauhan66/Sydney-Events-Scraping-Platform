import React, { useState } from 'react';

const SearchFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      category: '',
      city: 'Sydney',
      startDate: '',
      endDate: ''
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const categories = [
    'Music', 'Sports', 'Arts', 'Food & Drink', 'Business', 
    'Technology', 'Education', 'Entertainment', 'Outdoor', 'Workshop'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Events</h3>
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Events
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={localFilters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              placeholder="Search by title, venue..."
              className="input-field pl-10"
            />
          </div>
        </div>

      
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={localFilters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

      
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={localFilters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="input-field"
          />
        </div>

        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={localFilters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
