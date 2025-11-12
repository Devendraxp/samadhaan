import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getComplaintById } from '@/lib/api/complaints';
import { Complaint } from '@/types/complaint';

const ComplaintDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchComplaint = async () => {
        try {
          const data = await getComplaintById(id as string);
          setComplaint(data);
        } catch (err) {
          setError('Failed to load complaint details');
        } finally {
          setLoading(false);
        }
      };

      fetchComplaint();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!complaint) {
    return <div>No complaint found</div>;
  }

  return (
    <div>
      <h1>{complaint.title}</h1>
      <p>{complaint.description}</p>
      <p>Status: {complaint.status}</p>
      <p>Created At: {new Date(complaint.createdAt).toLocaleDateString()}</p>
      {/* Add any additional details or comments here */}
    </div>
  );
};

export default ComplaintDetails;