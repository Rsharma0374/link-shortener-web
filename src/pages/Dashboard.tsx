import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';

interface DashboardDetails {
  oBody: {
    payLoad: Array<{
      id: number;
      longUrl: string;
      shortCode: string;
      shortUrl: string;
      qrCode: string;
      createdAt: string;
      expiredAt: string;
      user: string;
    }>;
  };
  oStatus: {
    iStatus: number;
    sStatus: string;
  };
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardDetails | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const identifier = sessionStorage.getItem('identifier');
        const username = sessionStorage.getItem('username');

        if (!token || !identifier || !username) {
          throw new Error('Missing required session data');
        }

        const data = await dashboardService.getDashboardDetails(username, identifier, token);
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', px: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Welcome, {user?.name}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total URLs
              </Typography>
              <Typography variant="h4">
                {dashboardData?.oBody.payLoad.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active URLs
              </Typography>
              <Typography variant="h4">
                {dashboardData?.oBody.payLoad.filter(url => new Date(url.expiredAt) > new Date()).length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expired URLs
              </Typography>
              <Typography variant="h4">
                {dashboardData?.oBody.payLoad.filter(url => new Date(url.expiredAt) <= new Date()).length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent URLs */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent URLs
              </Typography>
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Short URL</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Original URL</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Created</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.oBody.payLoad.map((url) => (
                      <tr key={url.id}>
                        <td style={{ padding: '8px' }}>
                          <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                            {url.shortUrl}
                          </a>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <a href={url.longUrl} target="_blank" rel="noopener noreferrer">
                            {url.longUrl}
                          </a>
                        </td>
                        <td style={{ padding: '8px' }}>
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {new Date(url.expiredAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}; 