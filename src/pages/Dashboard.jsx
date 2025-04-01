import React, { useState, useEffect } from 'react';
import {
  Plus,
   Link,
  Copy,
  Edit,
  Trash2,
  Search,
  Lock,
  User,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  QrCode,
  X
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { dashboardApi, callLogout, changePassword, addEntry, deleteEntry, updateEntry } from '../services/authServices';
import { initializeAESKey } from "../services/CryptoUtils";

const PasswordManagerDashboard = () => {
  const navigate = useNavigate();
  // const { logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);


  // First useEffect for initial data fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const identifier = sessionStorage.getItem('identifier');
        const username = sessionStorage.getItem('username');

        if (!token || !identifier || !username) {
          console.error("Missing data in session storage. Redirecting to login.");
          navigate('/');
          return;
        }

        const res = await dashboardApi(username, identifier, token);
        if (res && res.oBody && res.oBody.payLoad) {
          // Ensure we're setting an array
          const data = Array.isArray(res.oBody.payLoad) ? res.oBody.payLoad : [res.oBody.payLoad];
          setDashboardData(data);
        } else if (res && res.aError && res.aError.length > 0) {
          const error = res.aError[0];
          setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
          setTimeout(() => setErrorMessage(''), 5000);
        } else {
          setErrorMessage("An unexpected error occurred. Please contact system administrator.");
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } catch (err) {
        setError(err.message);
        console.error('Dashboard API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Filter entries based on search
  const filteredEntries = Array.isArray(dashboardData) 
    ? dashboardData.filter(entry =>
        (entry?.longUrl?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (entry?.shortCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (entry?.createdAt?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (entry?.expiredAt?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCopyPassword = (entry) => {
    navigator.clipboard.writeText(entry.sPassword);
    setCopiedPassword(entry.sUserName);
    setTimeout(() => setCopiedPassword(null), 2000);
  };

  const handleDeleteEntry = async (entry) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
    if (confirmDelete) {
      try {
        // Implement delete API call here
        const res = await deleteEntry(entry);

        if (res && res.oBody && res.oBody.payLoad) {
          setDashboardData(res.oBody.payLoad);
          setSuccessMessage('Entry updated successfully');
          setTimeout(() => setSuccessMessage(''), 5000);
        } else if (res && res.aError && res.aError.length > 0) {
          const error = res.aError[0];
          setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
          setTimeout(() => setErrorMessage(''), 5000);
        } else {
          setErrorMessage("An unexpected error occurred. Please contact system administrator.");
          setTimeout(() => setErrorMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error adding entry:', error);
        setErrorMessage('Failed to add entry. Please try again.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    }
  };

  const handleAddEntry = async (data) => {
    try {
      setLoading(true);
      const res = await addEntry(data);

      if (res && res.oBody && res.oBody.payLoad) {
        // Fetch updated dashboard data
        const token = sessionStorage.getItem('token');
        const identifier = sessionStorage.getItem('identifier');
        const username = sessionStorage.getItem('username');
        
        const dashboardRes = await dashboardApi(username, identifier, token);
        if (dashboardRes && dashboardRes.oBody && dashboardRes.oBody.payLoad) {
          const updatedData = Array.isArray(dashboardRes.oBody.payLoad) 
            ? dashboardRes.oBody.payLoad 
            : [dashboardRes.oBody.payLoad];
          setDashboardData(updatedData);
        }
        
        setIsAddModalOpen(false);
        setSuccessMessage('Entry added successfully');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (res && res.aError && res.aError.length > 0) {
        const error = res.aError[0];
        setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      setErrorMessage('Failed to add entry. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntry = async (data) => {
    try {
      setLoading(true);
      const res = await updateEntry(data);

      if (res && res.oBody && res.oBody.payLoad) {
        setDashboardData(res.oBody.payLoad);
        setIsEditModalOpen(false);
        setSuccessMessage('Entry updated successfully');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (res && res.aError && res.aError.length > 0) {
        const error = res.aError[0];
        setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      setErrorMessage('Failed to add entry. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmNewPassword = formData.get('confirmNewPassword');
    const identifier = sessionStorage.getItem('identifier');

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(identifier, currentPassword, newPassword);

      if (res && res.oBody && res.oBody.payLoad && res.oBody.payLoad.sStatus === "200") {
        setSuccessMessage(res.oBody.payLoad.sResponseMessage);
        setTimeout(() => {
          setSuccessMessage('');
          setIsChangePasswordModalOpen(false);
        }, 2400);
      } else if (res && res.aError && res.aError.length > 0) {
        const error = res.aError[0];
        setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage('Failed to update password. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {

      const res = await callLogout(sessionStorage.getItem('username'));

      if (res && res.oBody && res.oBody.payLoad) {
        setSuccessMessage(res.oBody.payLoad.responseMessage);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (res && res.aError && res.aError.length > 0) {
        const error = res.aError[0];
        setErrorMessage(error?.sMessage || "An unexpected error occurred. Please try again.");
        setTimeout(() => setErrorMessage(''), 5000);
      } else {
        setErrorMessage("An unexpected error occurred. Please contact system administrator.");
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      sessionStorage.clear();

      // Initialize new AES key after clearing session
      try {
        await initializeAESKey();
      } catch (error) {
        console.error("Failed to initialize new AES key after logout:", error);
      }
      navigate('/')
    }
  };

  const renderAddEditModal = (mode) => {
    const entry = mode === 'edit' ? selectedEntry : {};

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {mode === 'add' ? 'Add New Entry' : 'Edit Entry'}
          </h2>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Transform form data to match API structure
            const apiData = {
              longUrl: data.longurl || entry.longUrl,
              expiryDay: parseInt(data.expiryDay) || entry.expiryDay,
            };

            mode === 'add' ? handleAddEntry(apiData) : handleUpdateEntry(apiData);
          }}>
            <div className="space-y-4">
              <input
                type="text"
                name="longurl"
                placeholder="Long Url"
                defaultValue={entry.longUrl || ''}
                disabled={mode !== "add"}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="number"
                name="expiryDay"
                placeholder="Expiry Days"
                defaultValue={entry.expiryDay || ''}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => mode === 'add' ? setIsAddModalOpen(false) : setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? mode === 'add' ? 'Adding...' : 'Updating...' : mode === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderChangePasswordModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Change Password</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="currentPassword"
                  placeholder="Current Password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="New Password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>


              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmNewPassword"
                  placeholder="Confirm New Password"
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-lg ${loading ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderQRCodeModal = () => {
    if (!selectedEntry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <button
            onClick={() => setIsQRCodeModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h2 className="text-xl font-bold mb-4">QR Code</h2>
          
          <div className="flex flex-col items-center space-y-4">
            <img
              src={`data:image/png;base64,${selectedEntry.qrCode}`}
              alt="QR Code"
              className="w-64 h-64 object-contain"
            />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Scan this QR code to visit:</p>
              <a 
                href={selectedEntry.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {selectedEntry.shortUrl}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link className="text-blue-600 h-8 w-8" />
          <h1 className="text-2xl font-bold text-gray-800">URL Shortener</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
          >
            Change Password
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Entry
          </button>
          <button
            onClick={() => handleLogout()}
            className="text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6 space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Long URL</th>
                  <th className="p-3 text-left">Short URL</th>
                  <th className="p-3 text-left">Created At</th>
                  <th className="p-3 text-left">Expired At</th>
                  <th className="p-3 text-left">QR Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(entry => (
                  <tr key={entry.shortCode} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="text-gray-400" />
                        <span className="truncate max-w-xs"><a href={entry.longUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {entry.longUrl}
                        </a></span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Link className="text-gray-400" />
                        <a href={entry.shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {entry.shortUrl}
                        </a>
                      </div>
                    </td>
                    <td className="p-3">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      {new Date(entry.expiredAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsQRCodeModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                          title="View QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsEditModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Modals */}
      {isAddModalOpen && renderAddEditModal('add')}
      {isEditModalOpen && renderAddEditModal('edit')}
      {isChangePasswordModalOpen && renderChangePasswordModal()}
      {isQRCodeModalOpen && renderQRCodeModal()}
    </div>
  );
};

export default PasswordManagerDashboard;