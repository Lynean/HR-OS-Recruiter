import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const response = await candidateAPI.getAll();
      setCandidates(response.data.candidates);
    } catch (error) {
      console.error('Error loading candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cv', file);
    formData.append('firstName', 'John');
    formData.append('lastName', 'Doe');
    formData.append('email', 'john.doe@example.com');

    try {
      await candidateAPI.upload(formData);
      loadCandidates();
      alert('CV uploaded successfully!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Failed to upload CV');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Candidates</h2>
        <p>Manage candidate profiles and CVs</p>
      </div>

      <div className="card">
        <h3>Upload CV</h3>
        <div className="form-group">
          <label>Select CV File (PDF, DOC, DOCX, TXT)</label>
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
        </div>
      </div>

      <div className="card">
        <h3>All Candidates ({candidates.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.experience || 0} years</td>
                <td>{candidate.skills.slice(0, 3).join(', ')}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </td>
                <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  const colors: any = {
    NEW: 'info',
    SCREENING: 'warning',
    INTERVIEWED: 'warning',
    OFFERED: 'info',
    ACCEPTED: 'success',
    ACTIVE: 'success',
    REJECTED: 'danger',
  };
  return colors[status] || 'info';
};

export default Candidates;
