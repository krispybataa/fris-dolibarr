import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// This would normally come from an API
interface PublicationApproval {
  id: number;
  title: string;
  author: string;
  department: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
}

const PublicationApprovalPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingPublications, setPendingPublications] = useState<PublicationApproval[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<PublicationApproval | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [comments, setComments] = useState('');

  // Check if user has permission to view this page
  useEffect(() => {
    if (isAuthenticated && !(user?.isDean || user?.role === 'admin')) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch pending publications
  useEffect(() => {
    const fetchPendingPublications = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        // This would be replaced with an actual API call
        // const response = await approvalAPI.getPendingPublications();
        
        // Mock data for skeleton
        const mockData: PublicationApproval[] = [
          {
            id: 1,
            title: 'Advances in Machine Learning Applications for Healthcare',
            author: 'Juan Dela Cruz',
            department: 'Computer Science',
            submittedDate: '2025-05-20',
            status: 'pending',
            type: 'Research Paper'
          },
          {
            id: 2,
            title: 'Sustainable Agriculture Practices in the Philippines',
            author: 'Maria Santos',
            department: 'Agriculture',
            submittedDate: '2025-05-18',
            status: 'pending',
            type: 'Conference Paper'
          },
          {
            id: 3,
            title: 'Economic Impact of COVID-19 on Small Businesses',
            author: 'Pedro Reyes',
            department: 'Economics',
            submittedDate: '2025-05-15',
            status: 'pending',
            type: 'Journal Article'
          }
        ];
        
        setPendingPublications(mockData);
      } catch (err) {
        console.error('Error fetching pending publications:', err);
        setError('Failed to load pending publications');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPublications();
  }, [isAuthenticated]);

  const handleViewDetails = (publication: PublicationApproval) => {
    // In a real implementation, this would navigate to a detailed view
    // For now, just log the action
    console.log('Viewing details for publication:', publication);
    navigate(`/publications/${publication.id}`);
  };

  const handleApproveClick = (publication: PublicationApproval) => {
    setSelectedPublication(publication);
    setApprovalDialogOpen(true);
  };

  const handleRejectClick = (publication: PublicationApproval) => {
    setSelectedPublication(publication);
    setRejectionDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedPublication) return;
    
    try {
      // This would be replaced with an actual API call
      // await approvalAPI.approvePublication(selectedPublication.id, comments);
      console.log(`Approved publication ${selectedPublication.id} with comments: ${comments}`);
      
      // Update the local state
      setPendingPublications(prevPublications => 
        prevPublications.filter(pub => pub.id !== selectedPublication.id)
      );
      
      setApprovalDialogOpen(false);
      setComments('');
      setSelectedPublication(null);
    } catch (err) {
      console.error('Error approving publication:', err);
      setError('Failed to approve publication');
    }
  };

  const handleReject = async () => {
    if (!selectedPublication) return;
    
    try {
      // This would be replaced with an actual API call
      // await approvalAPI.rejectPublication(selectedPublication.id, comments);
      console.log(`Rejected publication ${selectedPublication.id} with comments: ${comments}`);
      
      // Update the local state
      setPendingPublications(prevPublications => 
        prevPublications.filter(pub => pub.id !== selectedPublication.id)
      );
      
      setRejectionDialogOpen(false);
      setComments('');
      setSelectedPublication(null);
    } catch (err) {
      console.error('Error rejecting publication:', err);
      setError('Failed to reject publication');
    }
  };

  if (!isAuthenticated || !(user?.isDean || user?.role === 'admin')) {
    return null;
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: FRIS_COLORS.burgundy }}>
          Publication Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve faculty research publications
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Pending Approvals
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingPublications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1">
              No pending publications to approve
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingPublications.map((publication) => (
                  <TableRow key={publication.id}>
                    <TableCell>{publication.title}</TableCell>
                    <TableCell>{publication.author}</TableCell>
                    <TableCell>{publication.department}</TableCell>
                    <TableCell>{publication.type}</TableCell>
                    <TableCell>{new Date(publication.submittedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={publication.status.toUpperCase()} 
                        color={
                          publication.status === 'approved' ? 'success' : 
                          publication.status === 'rejected' ? 'error' : 
                          'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(publication)}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApproveClick(publication)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleRejectClick(publication)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
        <DialogTitle>Approve Publication</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to approve the publication "{selectedPublication?.title}"?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="comments"
            label="Comments (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
        <DialogTitle>Reject Publication</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to reject the publication "{selectedPublication?.title}"?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="comments"
            label="Reason for Rejection (Required)"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            variant="contained" 
            color="error"
            disabled={!comments.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PublicationApprovalPage;
