import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface RecordDetail {
  id: number;
  title: string;
  type: string;
  description: string;
  authors: string[];
  year: number;
  status: 'pending' | 'approved' | 'rejected';
  sdgs: string[];
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  attachmentUrl?: string;
  comments?: string;
  createdBy: {
    id: number;
    name: string;
    department: string;
  };
  createdAt: string;
  updatedAt: string;
  approvalHistory?: Array<{
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    comments: string;
    approvedBy: {
      id: number;
      name: string;
      role: string;
    };
    timestamp: string;
  }>;
}

const RecordDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const canEdit = user?.userId === record?.createdBy.id || user?.role === 'admin';
  const canApprove = (user?.isDepartmentHead || user?.isDean || user?.role === 'admin') && record?.status === 'pending';

  useEffect(() => {
    const fetchRecordDetail = async () => {
      if (!id || !isAuthenticated) return;
      
      try {
        setLoading(true);
        // Fetch the record details based on the ID
        const response = await axios.get(`http://localhost:8000/publications/${id}`);
        setRecord(response.data);
      } catch (err) {
        console.error('Error fetching record details:', err);
        setError('Failed to load record details');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordDetail();
  }, [id, isAuthenticated]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/publications/edit/${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8000/publications/${id}`);
      setDeleteDialogOpen(false);
      navigate('/records');
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record');
      setDeleteDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await axios.post(`http://localhost:8000/approval/publications/${id}/approve`);
      // Refresh the record data
      const response = await axios.get(`http://localhost:8000/publications/${id}`);
      setRecord(response.data);
    } catch (err) {
      console.error('Error approving record:', err);
      setError('Failed to approve record');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await axios.post(`http://localhost:8000/approval/publications/${id}/reject`);
      // Refresh the record data
      const response = await axios.get(`http://localhost:8000/publications/${id}`);
      setRecord(response.data);
    } catch (err) {
      console.error('Error rejecting record:', err);
      setError('Failed to reject record');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon sx={{ color: FRIS_COLORS.green }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: FRIS_COLORS.burgundy }} />;
      default:
        return <PendingIcon sx={{ color: FRIS_COLORS.gold }} />;
    }
  };

  if (loading && !record) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error && !record) {
    return (
      <Layout>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Go Back
        </Button>
      </Layout>
    );
  }

  if (!record) {
    return (
      <Layout>
        <Alert severity="warning" sx={{ my: 2 }}>Record not found</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack}>
          Go Back
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Publication Details
        </Typography>
        <Box>
          {canEdit && (
            <>
              <Button 
                startIcon={<EditIcon />} 
                variant="outlined" 
                onClick={handleEdit}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button 
                startIcon={<DeleteIcon />} 
                variant="outlined" 
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper 
        sx={{ 
          mb: 4, 
          overflow: 'hidden',
          borderTop: `4px solid ${
            record.status === 'approved' ? FRIS_COLORS.green : 
            record.status === 'rejected' ? FRIS_COLORS.burgundy : 
            FRIS_COLORS.gold
          }`
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
              {record.title}
            </Typography>
            <Chip 
              icon={getStatusIcon(record.status)} 
              label={record.status.toUpperCase()} 
              sx={{ 
                bgcolor: record.status === 'approved' ? `${FRIS_COLORS.green}20` : 
                        record.status === 'rejected' ? `${FRIS_COLORS.burgundy}20` : 
                        `${FRIS_COLORS.gold}20`,
                color: record.status === 'approved' ? FRIS_COLORS.green : 
                      record.status === 'rejected' ? FRIS_COLORS.burgundy : 
                      '#a87900'
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Publication Type" 
                    secondary={record.type} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Year" 
                    secondary={record.year} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Authors" 
                    secondary={record.authors.join(', ')} 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List dense>
                {record.journal && (
                  <ListItem>
                    <ListItemText 
                      primary="Journal" 
                      secondary={record.journal} 
                    />
                  </ListItem>
                )}
                {record.publisher && (
                  <ListItem>
                    <ListItemText 
                      primary="Publisher" 
                      secondary={record.publisher} 
                    />
                  </ListItem>
                )}
                {record.doi && (
                  <ListItem>
                    <ListItemText 
                      primary="DOI" 
                      secondary={record.doi} 
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Abstract/Description
          </Typography>
          <Typography variant="body1" paragraph>
            {record.description}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              SDG Alignment
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {record.sdgs.map((sdg, index) => (
                <Chip 
                  key={index} 
                  label={sdg} 
                  sx={{ 
                    bgcolor: '#e0e0e0',
                    '&:hover': {
                      bgcolor: '#d5d5d5'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {record.attachmentUrl && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={record.attachmentUrl}
                target="_blank"
                sx={{ 
                  bgcolor: FRIS_COLORS.burgundy,
                  '&:hover': {
                    bgcolor: '#6b1731'
                  }
                }}
              >
                Download Attachment
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {canApprove && (
        <Paper sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Approval Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleApprove}
              sx={{ 
                bgcolor: FRIS_COLORS.green,
                '&:hover': {
                  bgcolor: '#004d34'
                }
              }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={handleReject}
              sx={{ 
                bgcolor: FRIS_COLORS.burgundy,
                '&:hover': {
                  bgcolor: '#6b1731'
                }
              }}
            >
              Reject
            </Button>
          </Box>
        </Paper>
      )}

      {record.approvalHistory && record.approvalHistory.length > 0 && (
        <Paper sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Approval History
          </Typography>
          <List>
            {record.approvalHistory.map((history, index) => (
              <ListItem key={index} divider={index < record.approvalHistory!.length - 1}>
                <ListItemIcon>
                  {getStatusIcon(history.status)}
                </ListItemIcon>
                <ListItemText
                  primary={`${history.status.toUpperCase()} by ${history.approvedBy.name} (${history.approvedBy.role})`}
                  secondary={`${new Date(history.timestamp).toLocaleString()} - ${history.comments || 'No comments'}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this publication record? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default RecordDetailPage;
