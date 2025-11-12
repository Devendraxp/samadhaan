import React from 'react';
import { Complaint } from '@/types/complaint';
import ComplaintStatusBadge from '../complaints/complaint-status-badge';

type ComplaintCardProps = {
  complaint: Complaint;
  onClick: () => void;
};

const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onClick }) => {
  return (
    <div className="border p-4 rounded-md shadow-md cursor-pointer" onClick={onClick}>
      <h3 className="text-lg font-semibold">{complaint.title}</h3>
      <ComplaintStatusBadge status={complaint.status} />
      <p className="text-sm text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default ComplaintCard;