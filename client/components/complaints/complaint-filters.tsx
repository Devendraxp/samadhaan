import React from 'react';

const ComplaintFilters = () => {
  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-semibold">Filter Complaints</h2>
      <div className="flex space-x-4">
        <select className="border rounded p-2">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <input
          type="date"
          className="border rounded p-2"
          placeholder="Filter by date"
        />
        <button className="bg-blue-500 text-white rounded p-2">Apply Filters</button>
      </div>
    </div>
  );
};

export default ComplaintFilters;