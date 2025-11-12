import React, { useEffect, useState } from 'react';
import { jobDescriptionAPI } from '../services/api';

const JobDescriptions: React.FC = () => {
  const [jobDescriptions, setJobDescriptions] = useState<any[]>([]);

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  const loadJobDescriptions = async () => {
    try {
      const response = await jobDescriptionAPI.getAll();
      setJobDescriptions(response.data.jobDescriptions);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Job Descriptions</h2>
        <p>Manage job postings and requirements</p>
      </div>

      <div className="card">
        <button className="btn btn-primary">+ Create New Job Description</button>
      </div>

      <div className="card">
        <h3>All Job Descriptions ({jobDescriptions.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Matches</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobDescriptions.map((jd: any) => (
              <tr key={jd.id}>
                <td>{jd.title}</td>
                <td>{jd.department || 'N/A'}</td>
                <td>{jd.location || 'N/A'}</td>
                <td>{jd.employmentType}</td>
                <td>
                  <span className={`badge badge-${jd.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                    {jd.status}
                  </span>
                </td>
                <td>{jd._count?.matches || 0}</td>
                <td>{new Date(jd.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobDescriptions;
