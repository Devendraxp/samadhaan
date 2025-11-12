import React from 'react';
import ComplaintCard from './complaint-card';
import { Complaint } from '../../types/complaint';

type ComplaintListProps = {
  complaints: Complaint[];
};

const ComplaintList: React.FC<ComplaintListProps> = ({ complaints }) => {
  return (
    <div className="complaint-list">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
};

export default ComplaintList;