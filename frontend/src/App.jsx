import React, { useState, useEffect } from 'react';
import { Home, FileText, List, Shield, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api/complaints';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newComplaint, setNewComplaint] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: ''
  });

  const [adminComplaintId, setAdminComplaintId] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    if (currentPage === 'complaints') {
      loadComplaints();
    }
  }, [currentPage]);

  const loadComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterComplaint = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComplaint),
      });
      
      if (!response.ok) throw new Error('Failed to register complaint');
      
      const savedComplaint = await response.json();
      alert(`Complaint registered successfully! Your complaint ID is: ${savedComplaint.complaintId}`);
      
      setNewComplaint({ name: '', email: '', phone: '', category: '', description: '' });
      setCurrentPage('complaints');
    } catch (err) {
      setError(err.message);
      alert('Error registering complaint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (status) => {
    if (!adminComplaintId) {
      alert('Please enter a complaint ID');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/${adminComplaintId}/status?status=${status}`, {
        method: 'PUT',
      });
      
      if (!response.ok) throw new Error('Failed to update complaint status');
      
      const updatedComplaint = await response.json();
      alert(`Complaint ${updatedComplaint.complaintId} marked as ${status}!`);
      setAdminComplaintId('');
      loadComplaints();
    } catch (err) {
      setError(err.message);
      alert('Error updating complaint: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'register':
        return (
          <RegisterComplaintPage 
            newComplaint={newComplaint}
            setNewComplaint={setNewComplaint}
            handleRegisterComplaint={handleRegisterComplaint}
            loading={loading}
          />
        );
      case 'complaints':
        return <ComplaintsPage complaints={complaints} loading={loading} error={error} />;
      case 'admin':
        return isAdminAuthenticated ? (
          <AdminPage 
            adminComplaintId={adminComplaintId}
            setAdminComplaintId={setAdminComplaintId}
            updateComplaintStatus={updateComplaintStatus}
            loading={loading}
          />
        ) : (
          <AdminLogin 
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            onLogin={() => {
              if (adminPassword === 'your-secret-password') {
                setIsAdminAuthenticated(true);
              } else {
                alert('Invalid password!');
              }
            }}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl mb-8 p-6 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                ComplaintHub
              </h1>
            </div>
            <nav className="flex space-x-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'register', label: 'Register', icon: FileText },
                { id: 'complaints', label: 'My Complaints', icon: List },
                { id: 'admin', label: 'Admin', icon: Shield }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
              {isAdminAuthenticated && (
                <button
                  onClick={() => setIsAdminAuthenticated(false)}
                  className="px-4 py-2 rounded-xl font-medium text-red-300 hover:bg-red-500/20"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded-xl mb-4 flex items-center backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const DashboardPage = () => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold text-white mb-6">Welcome to Complaint Management System</h2>
    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
      A professional system for tracking, managing, and resolving complaints efficiently.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {[
        { title: 'Easy Registration', desc: 'Submit complaints in minutes', icon: '📝' },
        { title: 'Real-time Tracking', desc: 'Monitor complaint status', icon: '📊' },
        { title: 'Secure Admin', desc: 'Protected admin access', icon: '🔒' }
      ].map((feature, index) => (
        <div key={index} className="bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
          <div className="text-4xl mb-4 text-blue-300">{feature.icon}</div>
          <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-blue-200">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const RegisterComplaintPage = ({ newComplaint, setNewComplaint, handleRegisterComplaint, loading }) => (
  <div className="max-w-2xl mx-auto">
    <h2 className="text-2xl font-bold text-white mb-6">Register New Complaint</h2>
    <form onSubmit={handleRegisterComplaint} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">Full Name</label>
          <input
            type="text"
            value={newComplaint.name}
            onChange={(e) => setNewComplaint({ ...newComplaint, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">Email Address</label>
          <input
            type="email"
            value={newComplaint.email}
            onChange={(e) => setNewComplaint({ ...newComplaint, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">Phone Number</label>
        <input
          type="tel"
          value={newComplaint.phone}
          onChange={(e) => setNewComplaint({ ...newComplaint, phone: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">Complaint Category</label>
        <select
          value={newComplaint.category}
          onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          required
        >
          <option value="" className="bg-slate-800">Select Category</option>
          <option value="Service Issue" className="bg-slate-800">Service Issue</option>
          <option value="Product Quality" className="bg-slate-800">Product Quality</option>
          <option value="Billing Problem" className="bg-slate-800">Billing Problem</option>
          <option value="Delivery Issue" className="bg-slate-800">Delivery Issue</option>
          <option value="Other" className="bg-slate-800">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">Complaint Description</label>
        <textarea
          value={newComplaint.description}
          onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px]"
          placeholder="Please describe your complaint in detail..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span>Submitting...</span>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Complaint</span>
          </>
        )}
      </button>
    </form>
  </div>
);

const ComplaintsPage = ({ complaints, loading, error }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-blue-200">Loading complaints...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-300 mb-2">Error Loading Complaints</h3>
        <p className="text-blue-200">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">My Complaints</h2>
      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-blue-300">📭</div>
          <h3 className="text-xl font-semibold text-blue-200 mb-2">No complaints found</h3>
          <p className="text-blue-300">Register your first complaint to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className={`border-l-4 rounded-xl p-6 shadow-sm transition-all hover:shadow-lg bg-white/5 border-white/20 ${
                complaint.status === 'resolved'
                  ? 'border-green-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="font-bold text-blue-300">{complaint.complaintId}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    complaint.status === 'resolved'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {complaint.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <p className="font-medium text-white">{complaint.name}</p>
                <p className="text-sm text-blue-200">{complaint.email}</p>
                {complaint.phone && <p className="text-sm text-blue-200">{complaint.phone}</p>}
                <p className="text-sm font-medium text-blue-100">{complaint.category}</p>
                <p className="text-blue-200">{complaint.description}</p>
              </div>
              <div className="text-sm text-blue-300">
                📅 {complaint.createdDate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminPage = ({ adminComplaintId, setAdminComplaintId, updateComplaintStatus, loading }) => (
  <div className="max-w-md mx-auto text-center">
    <h2 className="text-2xl font-bold text-white mb-6">Admin Panel</h2>
    <div className="bg-white/5 rounded-xl p-6 space-y-6 border border-white/10">
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">Complaint ID</label>
        <input
          type="text"
          value={adminComplaintId}
          onChange={(e) => setAdminComplaintId(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter complaint ID (e.g., COMP-ABC12345)"
        />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => updateComplaintStatus('resolved')}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Mark Resolved</span>
        </button>
        <button
          onClick={() => updateComplaintStatus('pending')}
          disabled={loading}
          className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-yellow-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Clock className="w-5 h-5" />
          <span>Mark Pending</span>
        </button>
      </div>
    </div>
  </div>
);

const AdminLogin = ({ adminPassword, setAdminPassword, onLogin }) => (
  <div className="max-w-md mx-auto text-center">
    <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>
    <div className="bg-white/5 rounded-xl p-6 space-y-6 border border-white/10">
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter admin password"
        />
      </div>
      <button
        onClick={onLogin}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
      >
        Login
      </button>
    </div>
  </div>
);

export default App;