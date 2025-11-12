import React from 'react';

type ComplaintStatusBadgeProps = {
  status: string;
};

const statusColors: { [key: string]: string } = {
  Open: 'bg-blue-500',
  Resolved: 'bg-green-500',
  Closed: 'bg-gray-500',
  InProgress: 'bg-yellow-500',
};

const ComplaintStatusBadge: React.FC<ComplaintStatusBadgeProps> = ({ status }) => {
  const colorClass = statusColors[status] || 'bg-gray-300';

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold text-white rounded ${colorClass}`}>
      {status}
    </span>
  );
};

export default ComplaintStatusBadge;