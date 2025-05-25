import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Chip,
  Container
} from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';
const Grid = MuiGrid as any; // Type casting to avoid TypeScript errors
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { summaryAPI } from '../services/api';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // We don't need to track loading state for this simple page
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    // Fetch pending approvals count for admin/dean users
    const fetchPendingApprovals = async () => {
      if (!isAuthenticated) return;
      if (!(user?.role === 'admin' || user?.isDean)) return;
      
      try {
        const summaryData = await summaryAPI.getRecordSummary();
        setPendingApprovals(summaryData.pendingApprovals);
      } catch (err) {
        console.error('Error fetching pending approvals:', err);
      }
    };

    fetchPendingApprovals();
  }, [isAuthenticated, user]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <Box 
        sx={{ 
          backgroundImage: 'url(/assets/oblation.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'flex-end',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            p: 3, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom color="white">
            Faculty and REPS Information System
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' } 
              }}
            >
              <CardActionArea onClick={() => handleNavigate('/profile')} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, color: FRIS_COLORS.burgundy }}>
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                    View Profile
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Edit Biography and Personal Details, Export and Print Curriculum Vitae
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Records Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' } 
              }}
            >
              <CardActionArea onClick={() => handleNavigate('/records')} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2, color: FRIS_COLORS.green }}>
                    <ArticleIcon sx={{ fontSize: 60 }} />
                  </Box>
                  <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                    View Records
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Add Research Activities, Teaching Activities and Extension/Public Services
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Publication Approval Card - Visible to department heads, dean and admin */}
          {(user?.isDepartmentHead || user?.isDean || user?.role === 'admin') && (
            <Grid item xs={12} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' } 
                }}
              >
                <CardActionArea onClick={() => handleNavigate('/publication-approval')} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ mb: 2, color: FRIS_COLORS.gold }}>
                      <AssignmentIcon sx={{ fontSize: 60 }} />
                    </Box>
                    <Typography variant="h5" component="div" gutterBottom fontWeight="bold">
                      View Publication Approval
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      See progress and current stages on publication approval for research activity record verification
                    </Typography>
                    {pendingApprovals > 0 && (
                      <Chip 
                        label={`${pendingApprovals} pending`} 
                        size="small"
                        sx={{ 
                          mt: 2,
                          bgcolor: `${FRIS_COLORS.gold}20`,
                          color: '#a87900',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
          <Typography variant="body2" color="text.secondary">
            2025 FRIS, All Rights Reserved
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version 1.2
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default HomePage;
