import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import JobDescriptions from './pages/JobDescriptions';
import Matching from './pages/Matching';
import Workflow from './pages/Workflow';
import KPIs from './pages/KPIs';
import Reports from './pages/Reports';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>HR-OS-Recruiter</h1>
          </div>
          <ul className="nav-menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/candidates">Candidates</Link></li>
            <li><Link to="/job-descriptions">Job Descriptions</Link></li>
            <li><Link to="/matching">CV Matching</Link></li>
            <li><Link to="/workflow">Workflow</Link></li>
            <li><Link to="/tasks">Tasks</Link></li>
            <li><Link to="/kpis">KPIs</Link></li>
            <li><Link to="/reports">Reports</Link></li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/job-descriptions" element={<JobDescriptions />} />
            <Route path="/matching" element={<Matching />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
