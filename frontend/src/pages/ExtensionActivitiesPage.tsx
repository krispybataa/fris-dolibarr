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
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
// Import APIs for extension activities
import { extensionAPI } from '../services/api';
import { FRIS_COLORS } from '../theme';

// Interface for Extension Activity
interface ExtensionActivity {
  extensionId: number;
  position: string;
  office: string;
  startDate: string;
  endDate?: string;
  number?: string;
  extOfService: string;
  status: string;
  supportingDocument?: string;
}

const ExtensionActivitiesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('service-to-up');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [extensions, setExtensions] = useState<ExtensionActivity[]>([]);
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
        
        // Attempt to fetch extensions with better error handling
        try {
          console.log('Fetching extension activities...');
          // Call with correct pagination parameters expected by the backend
          const extensionsResponse = await extensionAPI.getAll({
            skip: 0,  // Start from the first record
            limit: 100 // Get up to 100 records
          });
          console.log('Extensions from API:', extensionsResponse);
          setExtensions(extensionsResponse);
        } catch (extErr: any) {
          console.error('Error fetching extensions:', extErr);
          console.error('Response status:', extErr?.response?.status);
          console.error('Response data:', extErr?.response?.data);
          setError(`Failed to load extension activities: ${extErr?.response?.data?.detail || extErr.message}`);
        }
      } catch (err) {
        console.error('General error fetching extension activities:', err);
        setError('Failed to load extension activities. Please try again later.');
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
    // Navigate to the add extension activity page with the appropriate type
    navigate('/extension/add', { state: { type: activeTab } });
  };

  const handleAddMultiple = () => {
    // Navigate to the add extension activity page with batch mode and the appropriate type
    navigate('/extension/add', { state: { type: activeTab, batch: true } });
  };

  const handleEdit = (id: number) => {
    // Navigate to the edit form
    navigate(`/extension/${id}/edit`);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Helper function to convert tab value to service type
  const getServiceTypeFromTab = (tab: string): string => {
    switch (tab) {
      case 'service-to-up':
        return 'Service to UP';
      case 'other-service-to-up':
        return 'Other Service to UP';
      case 'service-to-profession':
        return 'Service to the Profession';
      case 'service-to-nation':
        return 'Service to the Nation';
      case 'service-to-science-education':
        return 'Service to Science Education';
      default:
        return 'Service to UP';
    }
  };

  // Filter extensions based on search query and active tab
  const filteredExtensions = extensions.filter(extension => {
    const matchesSearch = 
      extension.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.office.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.extOfService.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = getServiceTypeFromTab(activeTab) === extension.extOfService;
    
    return matchesSearch && matchesTab;
  });

  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Layout>
      {/* Header with background image */}
      <Box 
        sx={{ 
          bgcolor: FRIS_COLORS.gold,
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
              <PublicIcon sx={{ fontSize: 30, mr: 1 }} />
              <Typography variant="h4" component="h1">
                Extension / Public Services
              </Typography>
            </Box>
          </Box>

          {/* Tabs for different service types */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
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
            <Tab label="Service to UP" value="service-to-up" />
            <Tab label="Other Service to UP" value="other-service-to-up" />
            <Tab label="Service to the Profession" value="service-to-profession" />
            <Tab label="Service to the Nation" value="service-to-nation" />
            <Tab label="Service to Science Education" value="service-to-science-education" />
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
              sx={{ mr: 2, bgcolor: FRIS_COLORS.gold, color: '#000' }}
              onClick={handleAddSingle}
            >
              Single
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              sx={{ color: FRIS_COLORS.gold, borderColor: FRIS_COLORS.gold }}
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
            <CircularProgress sx={{ color: FRIS_COLORS.gold }} />
          </Box>
        ) : (
          <>
            {filteredExtensions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  No extension activities found for {getServiceTypeFromTab(activeTab)}. Click "Single" or "Multiple" to add new activities.
                </Typography>
              </Box>
            ) : (
              filteredExtensions.map((extension) => (
                <Card key={extension.extensionId} sx={{ mb: 2 }}>
                  <CardContent sx={{ position: 'relative', p: 3 }}>
                    <IconButton 
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                      onClick={() => handleEdit(extension.extensionId)}
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <WorkIcon sx={{ color: FRIS_COLORS.gold, mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {extension.position}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Office:</strong> {extension.office}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ pl: 7 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Service Type:</strong> {extension.extOfService}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Duration:</strong> {formatDate(extension.startDate)} - {formatDate(extension.endDate)}
                      </Typography>
                      {extension.number && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Number:</strong> {extension.number}
                        </Typography>
                      )}
                      
                      {/* Status chip */}
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Chip 
                          label={extension.status}
                          size="small"
                          sx={{ 
                            bgcolor: extension.status === 'approved' 
                              ? '#e6f4ea' 
                              : extension.status === 'rejected'
                              ? '#fce8e6'
                              : '#fff8e1',
                            color: extension.status === 'approved' 
                              ? '#137333' 
                              : extension.status === 'rejected'
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
      </Container>
    </Layout>
  );
};

export default ExtensionActivitiesPage;
