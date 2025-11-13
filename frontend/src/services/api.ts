import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const candidateAPI = {
  getAll: (params?: any) => api.get('/candidates', { params }),
  getById: (id: string) => api.get(`/candidates/${id}`),
  parseCV: (formData: FormData) => api.post('/candidates/parse-cv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  upload: (formData: FormData) => api.post('/candidates/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: any) => api.put(`/candidates/${id}`, data),
  delete: (id: string) => api.delete(`/candidates/${id}`),
};

export const jobDescriptionAPI = {
  getAll: (params?: any) => api.get('/job-descriptions', { params }),
  getById: (id: string) => api.get(`/job-descriptions/${id}`),
  create: (data: any) => api.post('/job-descriptions', data),
  update: (id: string, data: any) => api.put(`/job-descriptions/${id}`, data),
  delete: (id: string) => api.delete(`/job-descriptions/${id}`),
};

export const matchingAPI = {
  score: (candidateId: string, jobDescriptionId: string) =>
    api.post('/matching/score', { candidateId, jobDescriptionId }),
  getTopCandidates: (jdId: string, params?: any) =>
    api.get(`/matching/candidates/${jdId}`, { params }),
  batchMatch: (jdId: string) => api.post(`/matching/batch/${jdId}`),
};

export const workflowAPI = {
  scheduleInterview: (data: any) => api.post('/workflow/interview', data),
  sendOffer: (data: any) => api.post('/workflow/offer', data),
  acceptOffer: (offerId: string) => api.post(`/workflow/offer/${offerId}/accept`),
  startOnboarding: (data: any) => api.post('/workflow/onboarding', data),
  assignTraining: (data: any) => api.post('/workflow/training', data),
  assignOutsourcing: (data: any) => api.post('/workflow/outsource', data),
  getInterviews: () => api.get('/workflow/interviews'),
  getOffers: () => api.get('/workflow/offers'),
  getOnboardings: () => api.get('/workflow/onboardings'),
  getTrainings: () => api.get('/workflow/trainings'),
  getOutsourcings: () => api.get('/workflow/outsourcings'),
  getStatistics: () => api.get('/workflow/statistics'),
};

export const kpiAPI = {
  getAll: () => api.get('/kpis'),
  create: (data: any) => api.post('/kpis', data),
  updateProgress: (id: string, current: number, userId: string) =>
    api.put(`/kpis/${id}/progress`, { current, userId }),
  getCandidateKPIs: (candidateId: string) =>
    api.get(`/kpis/candidate/${candidateId}`),
  getSummary: (candidateId?: string) =>
    api.get('/kpis/summary', { params: { candidateId } }),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getFunnel: (jobDescriptionId?: string) =>
    api.get('/reports/funnel', { params: { jobDescriptionId } }),
  getTimeToHire: (jobDescriptionId?: string) =>
    api.get('/reports/time-to-hire', { params: { jobDescriptionId } }),
  getSourceEffectiveness: () => api.get('/reports/source-effectiveness'),
  getInterviewStats: (period?: string) =>
    api.get('/reports/interviews', { params: { period } }),
};

export const geminiAPI = {
  searchSkills: (query: string) => api.post('/gemini/skills/search', { query }),
  generateProposal: (data: any) => api.post('/gemini/proposal/generate', data),
  addSkill: (data: any) => api.post('/gemini/skills', data),
  getSkills: (params?: any) => api.get('/gemini/skills', { params }),
  extractSkills: (text: string) => api.post('/gemini/extract-skills', { text }),
};

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export default api;
