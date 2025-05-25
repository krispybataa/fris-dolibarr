import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
// Import APIs for teaching activities
import { teachingAPI, authorshipAPI } from '../services/api';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Interface for Course and SET
interface CourseAndSET {
  caSId: number;
  academicYear: string;
  term: string;
  courseNum: string;
  section: string;
  courseDesc: string;
  courseType: string;
  percentContri: number;
  loadCreditUnits: number;
  noOfRespondents: number;
  partOneStudent?: number;
  partTwoCourse?: number;
  partThreeTeaching?: number;
  teachingPoints?: number;
  status: string;
}

// Interface for Authorship
interface Authorship {
  authorId: number;
  title: string;
  authors: string;
  date: string;
  upCourse?: string;
  recommendingUnit: string;
  publisher: string;
  authorshipType: string;
  numberOfAuthors: number;
  status: string;
}

const TeachingActivitiesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('courses');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [courses, setCourses] = useState<CourseAndSET[]>([]);
  const [authorships, setAuthorships] = useState<Authorship[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if token exists
        const token = localStorage.getItem('token');
        console.log('Token available for API calls:', !!token);
        
        // Attempt to fetch courses first with better error handling
        try {
          console.log('Fetching courses...');
          // Call with correct pagination parameters expected by the backend
          const coursesResponse = await teachingAPI.getAllCourses({
            skip: 0,  // Start from the first record
            limit: 100 // Get up to 100 records
          });
          console.log('Courses from API:', coursesResponse);
          setCourses(coursesResponse);
        } catch (courseErr: any) {
          console.error('Error fetching courses:', courseErr);
          console.error('Response status:', courseErr?.response?.status);
          console.error('Response data:', courseErr?.response?.data);
          setError(`Failed to load courses: ${courseErr?.response?.data?.detail || courseErr.message}`);
        }
        
        // Then fetch authorships separately
        try {
          console.log('Fetching authorships...');
          // Call with correct pagination parameters expected by the backend
          const authorshipsResponse = await authorshipAPI.getAll({
            skip: 0,  // Start from the first record
            limit: 100 // Get up to 100 records
          });
          console.log('Authorships from API:', authorshipsResponse);
          setAuthorships(authorshipsResponse);
        } catch (authorErr: any) {
          console.error('Error fetching authorships:', authorErr);
          console.error('Response status:', authorErr?.response?.status);
          console.error('Response data:', authorErr?.response?.data);
          setError(prev => prev ? `${prev}. Also failed to load authorships.` : 
            `Failed to load authorships: ${authorErr?.response?.data?.detail || authorErr.message}`);
        }
      } catch (err) {
        console.error('General error fetching teaching activities:', err);
        setError('Failed to load teaching activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // These functions are already defined below, so removing this duplicate declaration

  const handleGoBack = () => {
    navigate('/records');
  };

  const handleAddSingle = () => {
    // Navigate to the add teaching activity page with the appropriate type
    navigate('/teaching/add', { state: { type: activeTab } });
  };

  const handleAddMultiple = () => {
    // Navigate to the add teaching activity page with batch mode and the appropriate type
    navigate('/teaching/add', { state: { type: activeTab, batch: true } });
  };

  const handleEdit = (id: number) => {
    // Navigate to the edit form based on the active tab and item ID
    if (activeTab === 'courses') {
      navigate(`/teaching/courses/${id}/edit`);
    } else {
      navigate(`/teaching/authorships/${id}/edit`);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.courseNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter authorships based on search query
  const filteredAuthorships = authorships.filter(authorship => 
    authorship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    authorship.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    authorship.recommendingUnit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      {/* Header with background image */}
      <Box 
        sx={{ 
          bgcolor: FRIS_COLORS.green,
          color: 'white',
          position: 'relative',
          py: 3
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2
            }}
          >
            <IconButton 
              onClick={handleGoBack} 
              sx={{ color: 'white', mr: 1 }}
              aria-label="Go back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ fontSize: 30, mr: 1 }} />
              <Typography variant="h4" component="h1">
                Teaching Activities
              </Typography>
            </Box>
          </Box>

          {/* Tabs for switching between Courses and Authorships */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              '& .MuiTabs-indicator': { 
                backgroundColor: 'white' 
              },
              '& .MuiTab-root': { 
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-selected': { 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <Tab label="Courses and Sets" value="courses" />
            <Tab label="Authorships" value="authorships" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Action buttons and search */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              sx={{ mr: 2, bgcolor: FRIS_COLORS.burgundy }}
              onClick={handleAddSingle}
            >
              Single
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              sx={{ color: FRIS_COLORS.burgundy, borderColor: FRIS_COLORS.burgundy }}
              onClick={handleAddMultiple}
            >
              Multiple
            </Button>
          </Box>
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
            sx={{ width: 300 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: FRIS_COLORS.green }} />
          </Box>
        ) : (
          <>
            {/* Courses and SETs Tab Content */}
            {activeTab === 'courses' && (
              <>
                {filteredCourses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1">
                      No courses found. Click "Single" or "Multiple" to add new courses.
                    </Typography>
                  </Box>
                ) : (
                  filteredCourses.map((course) => (
                    <Card key={course.caSId} sx={{ mb: 2 }}>
                      <CardContent sx={{ position: 'relative', p: 3 }}>
                        <IconButton 
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                          onClick={() => handleEdit(course.caSId)}
                          aria-label="Edit course"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <Typography variant="h6" component="div" fontWeight="bold" color={FRIS_COLORS.green}>
                          {course.courseNum}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Section {course.section}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body1">
                            {course.courseType} - {course.teachingPoints ? `${course.teachingPoints} Teaching Points` : 'No Teaching Points'}
                          </Typography>
                          <DescriptionIcon sx={{ color: FRIS_COLORS.green, opacity: 0.7 }} />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {course.courseDesc}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}

            {/* Authorships Tab Content */}
            {activeTab === 'authorships' && (
              <>
                {filteredAuthorships.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1">
                      No authorships found. Click "Single" or "Multiple" to add new authorships.
                    </Typography>
                  </Box>
                ) : (
                  filteredAuthorships.map((authorship) => (
                    <Card key={authorship.authorId} sx={{ mb: 2 }}>
                      <CardContent sx={{ position: 'relative', p: 3 }}>
                        <IconButton 
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                          onClick={() => handleEdit(authorship.authorId)}
                          aria-label="Edit authorship"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <Typography variant="h6" component="div" fontWeight="bold" color={FRIS_COLORS.burgundy}>
                          {authorship.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {authorship.publisher}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body1">
                            {authorship.recommendingUnit}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {authorship.authorshipType}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default TeachingActivitiesPage;
