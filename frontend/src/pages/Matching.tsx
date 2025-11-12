import React, { useEffect, useState } from 'react';
import { jobDescriptionAPI, candidateAPI, matchingAPI } from '../services/api';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills: string[];
  experience?: number;
  status: string;
}

interface JobDescription {
  id: string;
  title: string;
  requiredSkills: string[];
  minExperience?: number;
  maxExperience?: number;
}

interface Match {
  id: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  matchDetails: any;
  geminiAnalysis?: string;
  candidate: Candidate;
}

const Matching: React.FC = () => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [selectedJD, setSelectedJD] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [minScore, setMinScore] = useState(60);

  useEffect(() => {
    loadJobDescriptions();
  }, []);

  const loadJobDescriptions = async () => {
    try {
      const response = await jobDescriptionAPI.getAll({ status: 'ACTIVE' });
      setJobDescriptions(response.data.jobDescriptions);
    } catch (error) {
      console.error('Error loading job descriptions:', error);
    }
  };

  const handleMatch = async () => {
    if (!selectedJD) {
      alert('Please select a job description');
      return;
    }

    setMatching(true);
    setMatches([]);

    try {
      const response = await matchingAPI.getTopCandidates(selectedJD, { minScore, limit: 50 });
      setMatches(response.data);

      if (response.data.length === 0) {
        alert('No matches found. Try lowering the minimum score or batch matching all candidates.');
      }
    } catch (error) {
      console.error('Error matching candidates:', error);
      alert('Failed to get matches. Try batch matching instead.');
    } finally {
      setMatching(false);
    }
  };

  const handleBatchMatch = async () => {
    if (!selectedJD) {
      alert('Please select a job description');
      return;
    }

    if (!window.confirm('This will match all candidates with the selected job description. This may take a few minutes. Continue?')) {
      return;
    }

    setMatching(true);
    setMatches([]);

    try {
      await matchingAPI.batchMatch(selectedJD);
      alert('Batch matching completed! Refreshing results...');
      handleMatch();
    } catch (error) {
      console.error('Error in batch matching:', error);
      alert('Failed to batch match candidates');
      setMatching(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div>
      <div className="page-header">
        <h2>CV Matching</h2>
        <p>AI-powered CV and Job Description matching using Google Gemini</p>
      </div>

      <div className="card">
        <h3>Match Candidates with Job Descriptions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto auto', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Select Job Description *</label>
            <select
              value={selectedJD}
              onChange={(e) => setSelectedJD(e.target.value)}
              disabled={matching}
            >
              <option value="">-- Select Job Description --</option>
              {jobDescriptions.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Min Score</label>
            <input
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              disabled={matching}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleMatch}
            disabled={!selectedJD || matching}
          >
            {matching ? 'Matching...' : '🔍 Find Matches'}
          </button>
          <button
            className="btn btn-success"
            onClick={handleBatchMatch}
            disabled={!selectedJD || matching}
          >
            {matching ? 'Processing...' : '🤖 Batch Match All'}
          </button>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            <strong>How it works:</strong> AI analyzes candidate CVs against job requirements using Google Gemini.
            "Find Matches" shows existing matches, "Batch Match All" re-analyzes all candidates (slower but comprehensive).
          </p>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="card">
          <h3>
            Top Candidates ({matches.length})
            {selectedJD && (
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', marginLeft: '1rem' }}>
                for {jobDescriptions.find(jd => jd.id === selectedJD)?.title}
              </span>
            )}
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="stat-card" style={{ padding: '1rem' }}>
                <h4>Excellent (80-100)</h4>
                <div className="value" style={{ color: '#27ae60' }}>
                  {matches.filter(m => m.overallScore >= 80).length}
                </div>
              </div>
              <div className="stat-card" style={{ padding: '1rem' }}>
                <h4>Good (60-79)</h4>
                <div className="value" style={{ color: '#f39c12' }}>
                  {matches.filter(m => m.overallScore >= 60 && m.overallScore < 80).length}
                </div>
              </div>
              <div className="stat-card" style={{ padding: '1rem' }}>
                <h4>Average Score</h4>
                <div className="value">
                  {(matches.reduce((sum, m) => sum + m.overallScore, 0) / matches.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {matches.map((match) => (
            <div
              key={match.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                borderLeft: `4px solid ${getScoreColor(match.overallScore)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>
                    {match.candidate.firstName} {match.candidate.lastName}
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: '#7f8c8d' }}>
                    {match.candidate.email} • {match.candidate.experience || 0} years exp
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {match.candidate.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ecf0f1',
                          borderRadius: '3px',
                          fontSize: '0.75rem',
                          marginRight: '0.5rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(match.overallScore) }}>
                    {match.overallScore.toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Overall Score</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    Skills Match
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: '#ecf0f1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginRight: '0.5rem'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: getScoreColor(match.skillScore),
                          width: `${match.skillScore}%`
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {match.skillScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    Experience Match
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: '#ecf0f1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginRight: '0.5rem'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: getScoreColor(match.experienceScore),
                          width: `${match.experienceScore}%`
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {match.experienceScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: '0.25rem' }}>
                    Education Match
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      backgroundColor: '#ecf0f1',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginRight: '0.5rem'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: getScoreColor(match.educationScore),
                          width: `${match.educationScore}%`
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {match.educationScore.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {match.geminiAnalysis && (
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  borderLeft: '3px solid #3498db'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '0.5rem' }}>🤖</span>
                    AI Analysis
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{match.geminiAnalysis}</div>
                </div>
              )}

              {match.matchDetails && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.875rem', color: '#3498db' }}>
                    View Detailed Breakdown
                  </summary>
                  <pre style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(match.matchDetails, null, 2)}
                  </pre>
                </details>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                  View Profile
                </button>
                <button className="btn" style={{ fontSize: '0.875rem' }}>
                  Schedule Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !matching && matches.length === 0 && selectedJD && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            No matches found yet. Click "Find Matches" to see existing matches or "Batch Match All" to analyze all candidates with AI.
          </p>
        </div>
      )}

      {matching && (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem' }}>
            <strong>Analyzing candidates with AI...</strong><br />
            This may take a moment. Please wait.
          </p>
        </div>
      )}
    </div>
  );
};

export default Matching;
