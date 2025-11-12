import React from 'react';

const KPIs: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h2>KPI Management</h2>
        <p>Track and manage candidate performance metrics</p>
      </div>

      <div className="card">
        <h3>Create New KPI</h3>
        <button className="btn btn-primary">+ Create KPI</button>
      </div>

      <div className="card">
        <h3>KPI Overview</h3>
        <p>Monitor performance indicators for all active candidates</p>
      </div>
    </div>
  );
};

export default KPIs;
