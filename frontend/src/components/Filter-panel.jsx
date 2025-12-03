import { useState } from 'react';

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  onExport,
  mainCategories,
  vendors,
  departments,
  sites
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="font-semibold text-gray-900">Search & Filters</h3>
        </div>
        <span className="text-lg">{expanded ? '▼' : '▶'}</span>
      </div>

      {/* Filters Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) => onFilterChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <select
                value={filters.vendor}
                onChange={(e) => onFilterChange("vendor", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Vendors</option>
                {vendors.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            {/* Main Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Category
              </label>
              <select
                value={filters.mainCategory}
                onChange={(e) => onFilterChange("mainCategory", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">All Categories</option>
                {mainCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>


            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => onFilterChange("department", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Site */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <select
                value={filters.siteName}
                onChange={(e) => onFilterChange("siteName", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* From Date */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    From Date
  </label>
  <input
    type="date"
    value={filters.from}
    onChange={(e) => onFilterChange("from", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
  />
</div>

{/* To Date */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    To Date
  </label>
  <input
    type="date"
    value={filters.to}
    onChange={(e) => onFilterChange("to", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
  />
</div>

{/* Extra Manpower Filter */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Extra Manpower
  </label>
  <select
    value={filters.extraManpower}
    onChange={(e) => onFilterChange("extra", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 bg-white"
  >
    <option value="">All</option>
    <option value="true">Only Extra</option>
  </select>
</div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
