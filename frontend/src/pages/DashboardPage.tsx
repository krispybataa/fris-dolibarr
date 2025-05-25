import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import axios from 'axios';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface Publication {
  id: number;
  title: string;
  type: string;
  authors: string[];
  year: number;
  status: 'pending' | 'approved' | 'rejected';
  sdgs: string[];
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdminOrDean = user?.role === 'admin' || user?.isDean;

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        // Only fetch publications if user is admin or dean
        if (isAuthenticated && isAdminOrDean) {
          const response = await axios.get('http://localhost:8000/publications/');
          setPublications(response.data);
        }
      } catch (err) {
        console.error('Error fetching publications:', err);
        setError('Failed to load publications data');
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [isAuthenticated, isAdminOrDean]);

  const handleViewPublication = (id: number) => {
    navigate(`/publications/${id}`);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (!isAdminOrDean) {
    return (
      <Layout>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            You do not have permission to view the dashboard. Only deans and administrators can access this page.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Publications Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of all faculty research publications
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          startIcon={<FilterListIcon />} 
          sx={{ mr: 2 }}
        >
          Filter
        </Button>
        <Button 
          startIcon={<SortIcon />}
        >
          Sort
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : (
        <Grid container spacing={3}>
          {publications.length > 0 ? (
            publications.map((publication) => (
              <Grid item xs={12} md={6} key={publication.id}>
                <Card 
                  elevation={2}
                  sx={{ 
                    height: '100%',
                    borderLeft: `4px solid ${
                      publication.status === 'approved' ? FRIS_COLORS.green : 
                      publication.status === 'rejected' ? FRIS_COLORS.burgundy : 
                      FRIS_COLORS.gold
                    }`
                  }}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
                          {publication.title}
                        </Typography>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewPublication(publication.id)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    }
                    subheader={`${publication.type} • ${publication.year}`}
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Authors: {publication.authors.join(', ')}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Status: 
                        <Chip 
                          label={publication.status.toUpperCase()} 
                          size="small"
                          sx={{ 
                            ml: 1,
                            bgcolor: publication.status === 'approved' ? FRIS_COLORS.green : 
                                    publication.status === 'rejected' ? FRIS_COLORS.burgundy : 
                                    FRIS_COLORS.gold,
                            color: 'white'
                          }}
                        />
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {publication.sdgs.map((sdg, index) => (
                        <Chip 
                          key={index} 
                          label={sdg} 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e0e0e0',
                            '&:hover': {
                              bgcolor: '#d5d5d5'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No publications found. Publications will appear here once faculty members submit them.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Layout>
  );
};

export default DashboardPage;
