import React from 'react';

const Workflow: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h2>Workflow Management</h2>
        <p>Manage candidate journey from interview to deployment</p>
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>Interview Scheduling</h3>
          <p>Schedule and track interviews with automated email invitations</p>
          <button className="btn btn-primary">Schedule Interview</button>
        </div>

        <div className="card">
          <h3>Offer Management</h3>
          <p>Send offer letters and track responses</p>
          <button className="btn btn-success">Send Offer</button>
        </div>

        <div className="card">
          <h3>Onboarding</h3>
          <p>Start onboarding process for accepted candidates</p>
          <button className="btn btn-primary">Start Onboarding</button>
        </div>

        <div className="card">
          <h3>Training Assignment</h3>
          <p>Assign training programs to candidates</p>
          <button className="btn btn-primary">Assign Training</button>
        </div>

        <div className="card">
          <h3>Client Deployment</h3>
          <p>Assign candidates to client sites</p>
          <button className="btn btn-primary">Assign to Client</button>
        </div>
      </div>
    </div>
  );
};

export default Workflow;
