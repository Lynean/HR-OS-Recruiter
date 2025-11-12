import React from 'react';

const Matching: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h2>CV Matching</h2>
        <p>AI-powered CV and Job Description matching</p>
      </div>

      <div className="card">
        <h3>Match Candidates with Job Descriptions</h3>
        <p>Select a job description to find the best matching candidates using AI-powered analysis.</p>
        <button className="btn btn-primary">Start Matching</button>
      </div>

      <div className="card">
        <h3>How Matching Works</h3>
        <ul>
          <li>AI-powered skill matching using Google Gemini</li>
          <li>Experience level comparison</li>
          <li>Education requirements matching</li>
          <li>Detailed scoring breakdown</li>
          <li>AI-generated candidate analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default Matching;
