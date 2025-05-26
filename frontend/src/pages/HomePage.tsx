import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Chip
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
import { FRIS_COLORS } from '../theme';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  // Responsive design variables have been removed for now
  // They can be re-implemented when needed for responsive layouts

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
      {/* Hero section with responsive height and text size */}
      <Box 
        sx={{ 
          backgroundImage: 'url(/assets/oblation.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: { xs: '180px', sm: '250px', md: '300px', lg: '350px' },
          width: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          mb: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            p: { xs: 2, sm: 3 }, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))'
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            color="white"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2.25rem', md: '3rem', lg: '3.5rem' },
              fontWeight: 'bold',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              maxWidth: { md: '80%', lg: '70%' },
              mx: { md: 'auto' }
            }}
          >
            Faculty and REPS Information System
          </Typography>
        </Box>
      </Box>

      {/* Main content area - full width with responsive padding */}
      <Box sx={{ 
        width: '100%', 
        px: { xs: 2, sm: 3, md: 4, lg: 5 },
        maxWidth: '100%'
      }}>
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 4, md: 6 } }}>
          {/* Profile Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: 8
                } 
              }}
            >
              <CardActionArea 
                onClick={() => handleNavigate('/profile')} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ 
                    mb: 2, 
                    color: FRIS_COLORS.burgundy,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <PersonIcon sx={{ 
                      fontSize: { xs: 50, sm: 55, md: 60, lg: 65 },
                      transition: 'all 0.3s ease',
                      '.MuiCardActionArea-root:hover &': { transform: 'scale(1.1)' }
                    }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
                      mb: { xs: 1, sm: 1.5, md: 2 }
                    }}
                  >
                    View Profile
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                      lineHeight: 1.5
                    }}
                  >
                    Edit Biography and Personal Details, Export and Print Curriculum Vitae
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Records Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-8px)', 
                  boxShadow: 8
                } 
              }}
            >
              <CardActionArea 
                onClick={() => handleNavigate('/records')} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ 
                    mb: 2, 
                    color: FRIS_COLORS.green,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <ArticleIcon sx={{ 
                      fontSize: { xs: 50, sm: 55, md: 60, lg: 65 },
                      transition: 'all 0.3s ease',
                      '.MuiCardActionArea-root:hover &': { transform: 'scale(1.1)' }
                    }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    component="div" 
                    gutterBottom 
                    fontWeight="bold"
                    sx={{ 
                      fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
                      mb: { xs: 1, sm: 1.5, md: 2 }
                    }}
                  >
                    View Records
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                      lineHeight: 1.5
                    }}
                  >
                    Add Research Activities, Teaching Activities and Extension/Public Services
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Publication Approval Card - Visible to department heads, dean and admin */}
          {(user?.isDepartmentHead || user?.isDean || user?.role === 'admin') && (
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: 8
                  } 
                }}
              >
                <CardActionArea 
                  onClick={() => handleNavigate('/publication-approval')} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    p: { xs: 1, sm: 1.5 }
                  }}
                >
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{ 
                      mb: 2, 
                      color: FRIS_COLORS.gold,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <AssignmentIcon sx={{ 
                        fontSize: { xs: 50, sm: 55, md: 60, lg: 65 },
                        transition: 'all 0.3s ease',
                        '.MuiCardActionArea-root:hover &': { transform: 'scale(1.1)' }
                      }} />
                    </Box>
                    <Typography 
                      variant="h5" 
                      component="div" 
                      gutterBottom 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
                        mb: { xs: 1, sm: 1.5, md: 2 }
                      }}
                    >
                      View Publication Approval
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
                        lineHeight: 1.5
                      }}
                    >
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
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          '.MuiCardActionArea-root:hover &': { 
                            bgcolor: FRIS_COLORS.gold,
                            color: '#fff'
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )}
        </Grid>

        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 3, md: 4 }, 
          mt: { xs: 2, md: 4 }, 
          opacity: 0.7,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          maxWidth: { sm: '90%', md: '80%', lg: '70%' },
          mx: 'auto'
        }}>
          <Typography variant="body2" color="text.secondary">
            2025 FRIS, All Rights Reserved
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version 1.2
          </Typography>
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;
