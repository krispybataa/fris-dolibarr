import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PublicIcon from '@mui/icons-material/Public';
import ExtensionForm from '../components/extension/ExtensionForm';
import BatchUploadForm from '../components/extension/BatchUploadForm';
import ActivityTypeDialog from '../components/extension/ActivityTypeDialog';
import { extensionAPI } from '../services/api';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
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

const AddExtensionActivityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('single');
  const [serviceType, setServiceType] = useState<string>('service-to-up');
  const [showTypeDialog, setShowTypeDialog] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Extract type and batch mode from location state if available
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const state = location.state as { type?: string; batch?: boolean } | null;
    if (state) {
      if (state.type) {
        setServiceType(state.type);
      }
      if (state.batch) {
        setActiveTab('batch');
      }
    } else {
      // If no type is provided, show the dialog to select type
      setShowTypeDialog(true);
    }
  }, [isAuthenticated, location.state, navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate('/extension');
  };

  const handleSelectType = (type: string) => {
    setServiceType(type);
    setShowTypeDialog(false);
  };

  const handleSingleSubmit = async (formData: FormData) => {
    try {
      setError('');
      setSuccess('');
      
      // Add service type if not already in the form data
      if (!formData.has('extOfService')) {
        formData.append('extOfService', getServiceTypeFromTab(serviceType));
      }
      
      // Call API to create extension activity
      await extensionAPI.create(formData);
      
      setSuccess('Extension activity added successfully!');
      
      // Navigate back to extension activities page after a short delay
      setTimeout(() => {
        navigate('/extension');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating extension activity:', err);
      setError(err.response?.data?.detail || 'Failed to add extension activity. Please try again.');
    }
  };

  const handleBatchSubmit = async (formData: FormData) => {
    try {
      setError('');
      setSuccess('');
      
      // Add service type if not already in the form data
      if (!formData.has('extOfService')) {
        formData.append('extOfService', getServiceTypeFromTab(serviceType));
      }
      
      // Call API to create multiple extension activities
      await extensionAPI.createMultiple(formData);
      
      setSuccess('Extension activities uploaded successfully!');
      
      // Navigate back to extension activities page after a short delay
      setTimeout(() => {
        navigate('/extension');
      }, 2000);
    } catch (err: any) {
      console.error('Error uploading extension activities:', err);
      setError(err.response?.data?.detail || 'Failed to upload extension activities. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/extension');
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
                Add Extension Activity
              </Typography>
            </Box>
          </Box>

          {/* Tabs for single vs batch upload */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
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
            <Tab label="Single Entry" value="single" />
            <Tab label="Batch Upload" value="batch" />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Service Type Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {getServiceTypeFromTab(serviceType)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adding extension activity for {getServiceTypeFromTab(serviceType)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Form Content */}
        {activeTab === 'single' ? (
          <ExtensionForm 
            onSubmit={handleSingleSubmit} 
            onCancel={handleCancel}
            defaultServiceType={getServiceTypeFromTab(serviceType)}
          />
        ) : (
          <BatchUploadForm 
            onSubmit={handleBatchSubmit} 
            onCancel={handleCancel}
            defaultServiceType={getServiceTypeFromTab(serviceType)}
          />
        )}
      </Container>

      {/* Activity Type Selection Dialog */}
      <ActivityTypeDialog 
        open={showTypeDialog}
        onClose={() => navigate('/extension')}
        onSelectType={handleSelectType}
      />
    </Layout>
  );
};

export default AddExtensionActivityPage;
