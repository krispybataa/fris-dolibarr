// React component for the Records page
import { 
  Box, 
  Typography, 
  Container,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';
const Grid = MuiGrid as any; // Type casting to avoid TypeScript errors
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FRIS_COLORS } from '../theme';

const RecordsPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Layout>
      {/* Header with background image */}
      <Box 
        sx={{ 
          backgroundImage: 'url(/assets/pgh.jpg)', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '250px',
          display: 'flex',
          alignItems: 'flex-end',
          mb: 4,
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: 20,
            left: 20,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={handleGoBack}
        >
          <ArrowBackIcon sx={{ mr: 1 }} />
          <Typography variant="body1">Go Back</Typography>
        </Box>
        <Box 
          sx={{ 
            width: '100%', 
            p: 3, 
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom color="white">
            Records
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Research Activities Card */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                bgcolor: FRIS_COLORS.burgundy,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' } 
              }}
            >
              <CardActionArea 
                onClick={() => navigate('/research')} 
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MenuBookIcon sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="div" fontWeight="bold">
                      Research Activities
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    List of Journals, Other Publications, Projects, Presentations, Intellectual Property Claims
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Teaching Activities Card */}
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                bgcolor: FRIS_COLORS.green,
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' } 
              }}
            >
              <CardActionArea 
                onClick={() => navigate('/teaching')} 
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="div" fontWeight="bold">
                      Teaching Activities
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    Courses and SETs, Authorship of Books, Modules
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Extension/Public Services Card */}
          <Grid item xs={12}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%',
                bgcolor: '#999999',
                color: 'white',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)' } 
              }}
            >
              <CardActionArea 
                onClick={() => navigate('/extension')} 
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PublicIcon sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="div" fontWeight="bold">
                      Extension / Public Services
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    Service to UP, Other Service to UP, Service to Profession, Service to Science Education, Service to Nation
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', py: 4, opacity: 0.7 }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 FRIS, All Rights Reserved
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Version 1.2
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default RecordsPage;
