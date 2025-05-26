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
  Alert,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import ArticleIcon from '@mui/icons-material/Article';
// Import APIs for research activities
import { researchAPI } from '../services/api';
import { FRIS_COLORS } from '../theme';

// Interface for Research Activities
interface ResearchActivity {
  raId: number;
  title: string;
  institute: string;
  authors: string;
  datePublished: string;
  startDate?: string;
  endDate?: string;
  journal?: string;
  citedAs?: string;
  doi?: string;
  publicationType: string;
  status: string;
  sdgs?: Array<{
    sdgId: number;
    sdgNum: number;
    sdgDesc: string;
  }>;
}

const ResearchActivitiesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('publications');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [publications, setPublications] = useState<ResearchActivity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

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
        
        // Attempt to fetch publications with better error handling
        try {
          console.log('Fetching publications...');
          // Call with correct pagination parameters expected by the backend
          const publicationsResponse = await researchAPI.getAll({
            skip: 0,  // Start from the first record
            limit: 100 // Get up to 100 records
          });
          console.log('Publications from API:', publicationsResponse);
          setPublications(publicationsResponse);
        } catch (pubErr: any) {
          console.error('Error fetching publications:', pubErr);
          console.error('Response status:', pubErr?.response?.status);
          console.error('Response data:', pubErr?.response?.data);
          setError(`Failed to load publications: ${pubErr?.response?.data?.detail || pubErr.message}`);
        }
      } catch (err) {
        console.error('General error fetching research activities:', err);
        setError('Failed to load research activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate('/records');
  };

  const handleAddSingle = () => {
    // Navigate to the add research activity page with the appropriate type
    navigate('/research/add', { state: { type: activeTab } });
  };

  const handleAddMultiple = () => {
    // Navigate to the add research activity page with batch mode and the appropriate type
    navigate('/research/add', { state: { type: activeTab, batch: true } });
  };

  const handleEdit = (id: number) => {
    // Navigate to the edit form based on the active tab and item ID
    navigate(`/research/publications/${id}/edit`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
  };

  // Filter publications based on search query and selected type
  const filteredPublications = publications.filter(publication => {
    const matchesSearch = 
      publication.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      publication.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      publication.institute.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (publication.journal && publication.journal.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === 'all' || publication.publicationType === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Get unique publication types for filter buttons
  const publicationTypes = ['all', ...new Set(publications.map(p => p.publicationType))];

  return (
    <Layout>
      {/* Header with background image */}
      <Box 
        sx={{ 
          bgcolor: FRIS_COLORS.burgundy,
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
              <MenuBookIcon sx={{ fontSize: 30, mr: 1 }} />
              <Typography variant="h4" component="h1">
                Research Activities
              </Typography>
            </Box>
          </Box>

          {/* Tabs for different research activity types */}
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
            <Tab label="Publications" value="publications" />
            <Tab label="Other Publications" value="other-publications" />
            <Tab label="Projects" value="projects" />
            <Tab label="Conference Presentations" value="conference" />
            <Tab label="Intellectual Property Claims" value="ip-claims" />
            <Tab label="Department/College/University Presentations" value="dept-presentations" />
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

        {/* Filter chips for publication types */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {publicationTypes.map((type) => (
            <Chip
              key={type}
              label={type === 'all' ? 'All Types' : type}
              onClick={() => handleTypeFilter(type)}
              color={selectedType === type ? 'primary' : 'default'}
              variant={selectedType === type ? 'filled' : 'outlined'}
              sx={{ 
                bgcolor: selectedType === type ? `${FRIS_COLORS.burgundy}` : 'transparent',
                borderColor: FRIS_COLORS.burgundy,
                '&.MuiChip-colorPrimary': {
                  color: 'white'
                }
              }}
            />
          ))}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: FRIS_COLORS.burgundy }} />
          </Box>
        ) : (
          <>
            {/* Publications Tab Content */}
            {activeTab === 'publications' && (
              <>
                {filteredPublications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1">
                      No publications found. Click "Single" or "Multiple" to add new publications.
                    </Typography>
                  </Box>
                ) : (
                  filteredPublications.map((publication) => (
                    <Card key={publication.raId} sx={{ mb: 2 }}>
                      <CardContent sx={{ position: 'relative', p: 3 }}>
                        <IconButton 
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                          onClick={() => handleEdit(publication.raId)}
                          aria-label="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <ArticleIcon sx={{ color: FRIS_COLORS.burgundy, mr: 2, fontSize: 40 }} />
                          <Box>
                            <Typography variant="h6" component="h2" gutterBottom>
                              {publication.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Authors:</strong> {publication.authors}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ pl: 7 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Publication Type:</strong> {publication.publicationType}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Institute:</strong> {publication.institute}
                          </Typography>
                          {publication.journal && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Journal:</strong> {publication.journal}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Date Published:</strong> {new Date(publication.datePublished).toLocaleDateString()}
                          </Typography>
                          {publication.doi && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>DOI:</strong> {publication.doi}
                            </Typography>
                          )}
                          
                          {/* SDG Tags if available */}
                          {publication.sdgs && publication.sdgs.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>SDGs:</strong>
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {publication.sdgs.map(sdg => (
                                  <Chip 
                                    key={sdg.sdgId}
                                    label={`SDG ${sdg.sdgNum}: ${sdg.sdgDesc}`}
                                    size="small"
                                    sx={{ 
                                      bgcolor: `${FRIS_COLORS.gold}20`,
                                      color: '#a87900',
                                    }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Status chip */}
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Chip 
                              label={publication.status}
                              size="small"
                              sx={{ 
                                bgcolor: publication.status === 'approved' 
                                  ? '#e6f4ea' 
                                  : publication.status === 'rejected'
                                  ? '#fce8e6'
                                  : '#fff8e1',
                                color: publication.status === 'approved' 
                                  ? '#137333' 
                                  : publication.status === 'rejected'
                                  ? '#c5221f'
                                  : '#e37400',
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </>
            )}
            
            {/* Other tabs would follow the same pattern */}
            {activeTab !== 'publications' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  This tab is currently under development. Please use the Publications tab for now.
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default ResearchActivitiesPage;
