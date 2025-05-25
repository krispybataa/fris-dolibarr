import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { approvalAPI } from '../services/api';
import PageHeader from '../components/common/PageHeader';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import { FRIS_COLORS } from '../theme';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Interfaces for API responses
interface Approver {
  id: number;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Publication {
  id: number;
  title: string;
  type: 'research_activity' | 'course' | 'extension' | 'authorship';
  submitter_id: number;
  submitter_name: string;
  date_submitted: string;
  status: 'pending' | 'approved' | 'rejected';
  current_approver?: string;
  approvers?: Approver[];
}

const PublicationApprovalPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [pendingPublications, setPendingPublications] = useState<Publication[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Publication[]>([]);
  const [approvedPublications, setApprovedPublications] = useState<Publication[]>([]);
  const [rejectedPublications, setRejectedPublications] = useState<Publication[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'rejected' | ''>('');
  const [comments, setComments] = useState('');

  // Check if user has permission to view this page
  useEffect(() => {
    if (isAuthenticated && !(user?.isDean || user?.role === 'admin' || user?.isDepartmentHead)) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch pending approvals
        const pendingResponse = await approvalAPI.getPending();
        const pendingData = pendingResponse.data;
        
        // Process and flatten the data
        const allPendingItems: Publication[] = [];
        
        // Process research activities
        if (pendingData.research_activities) {
          const researchItems = pendingData.research_activities.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: 'research_activity' as const,
            submitter_id: item.submitter_id,
            submitter_name: item.submitter_name,
            date_submitted: item.date_submitted,
            status: 'pending' as const
          }));
          allPendingItems.push(...researchItems);
        }
        
        // Process courses
        if (pendingData.courses) {
          const courseItems = pendingData.courses.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: 'course' as const,
            submitter_id: item.submitter_id,
            submitter_name: item.submitter_name,
            date_submitted: item.date_submitted,
            status: 'pending' as const
          }));
          allPendingItems.push(...courseItems);
        }
        
        // Process extensions
        if (pendingData.extensions) {
          const extensionItems = pendingData.extensions.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: 'extension' as const,
            submitter_id: item.submitter_id,
            submitter_name: item.submitter_name,
            date_submitted: item.date_submitted,
            status: 'pending' as const
          }));
          allPendingItems.push(...extensionItems);
        }
        
        // Process authorships
        if (pendingData.authorships) {
          const authorshipItems = pendingData.authorships.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: 'authorship' as const,
            submitter_id: item.submitter_id,
            submitter_name: item.submitter_name,
            date_submitted: item.date_submitted,
            status: 'pending' as const
          }));
          allPendingItems.push(...authorshipItems);
        }
        
        setPendingPublications(allPendingItems);
        
        // Fetch my submissions
        const submissionsResponse = await approvalAPI.getMySubmissions();
        const submissionsData = submissionsResponse.data;
        
        // Process and categorize submissions by status
        const myItems: Publication[] = [];
        const approvedItems: Publication[] = [];
        const rejectedItems: Publication[] = [];
        
        // Helper function to process items by type
        const processItems = (items: any[], typeKey: keyof typeof typeMap) => {
          return items.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: typeMap[typeKey],
            submitter_id: user?.userId || 0,
            submitter_name: user?.userName || '',
            date_submitted: item.date_submitted,
            status: item.status as 'pending' | 'approved' | 'rejected',
            current_approver: item.current_approver
          }));
        };
        
        // Process all types
        const typeMap = {
          'research_activities': 'research_activity' as const,
          'courses': 'course' as const,
          'extensions': 'extension' as const,
          'authorships': 'authorship' as const
        };
        
        Object.keys(typeMap).forEach(key => {
          if (submissionsData[key]) {
            const items = processItems(submissionsData[key], key as keyof typeof typeMap);
            
            // Categorize by status
            items.forEach(item => {
              myItems.push(item);
              
              if (item.status === 'approved') {
                approvedItems.push(item);
              } else if (item.status === 'rejected') {
                rejectedItems.push(item);
              }
            });
          }
        });
        
        setMySubmissions(myItems);
        setApprovedPublications(approvedItems);
        setRejectedPublications(rejectedItems);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (publication: Publication) => {
    // Navigate to the detailed view based on publication type
    const typeRouteMap = {
      'research_activity': 'research',
      'course': 'teaching',
      'extension': 'extension',
      'authorship': 'publications'
    };
    
    const basePath = typeRouteMap[publication.type];
    navigate(`/${basePath}/${publication.id}`);
  };

  const handleApproveClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setApprovalAction('approved');
    setDialogOpen(true);
  };

  const handleRejectClick = (publication: Publication) => {
    setSelectedPublication(publication);
    setApprovalAction('rejected');
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPublication(null);
    setApprovalAction('');
    setComments('');
  };

  const handleConfirmAction = async () => {
    if (!selectedPublication || !approvalAction) return;
    
    try {
      await approvalAPI.updateStatus(
        selectedPublication.type,
        selectedPublication.id,
        approvalAction,
        comments
      );
      
      // Update the local state
      setPendingPublications(prevPublications => 
        prevPublications.filter(pub => !(pub.id === selectedPublication.id && pub.type === selectedPublication.type))
      );
      
      // Show success message
      const actionText = approvalAction === 'approved' ? 'approved' : 'rejected';
      setError(`Publication ${actionText} successfully`);
      
      // Close dialog and reset state
      handleDialogClose();
      
      // Refresh data - in a real implementation we would refetch all data here
      
    } catch (err) {
      console.error(`Error ${approvalAction} publication:`, err);
      setError(`Failed to ${approvalAction} publication`);
    }
  };

  if (!isAuthenticated || !(user?.isDean || user?.role === 'admin')) {
    return null;
  }

  return (
    <ResponsiveContainer>
      <PageHeader title="Publication Approvals" />

      {error && (
        <Alert 
          severity={error.includes('successfully') ? 'success' : 'error'} 
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="publication approval tabs"
              sx={{
                '& .MuiTab-root': {
                  color: FRIS_COLORS.darkBlue,
                  '&.Mui-selected': {
                    color: FRIS_COLORS.deepBlue,
                    fontWeight: 'bold'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: FRIS_COLORS.deepBlue
                }
              }}
            >
              <Tab label="Pending Approvals" />
              <Tab label="My Submissions" />
              <Tab label="Approved" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>
          
          {/* Tab 0: Pending Approvals */}
          {activeTab === 0 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                {pendingPublications.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2 }}>
                    No publications pending your approval.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: FRIS_COLORS.lightBlue }}>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Submitter</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Submitted Date</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pendingPublications.map((publication) => (
                          <TableRow key={`${publication.type}-${publication.id}`}>
                            <TableCell>{publication.title}</TableCell>
                            <TableCell>{publication.submitter_name}</TableCell>
                            <TableCell>
                              {publication.type === 'research_activity' && 'Research Activity'}
                              {publication.type === 'course' && 'Teaching Activity'}
                              {publication.type === 'extension' && 'Extension Activity'}
                              {publication.type === 'authorship' && 'Publication'}
                            </TableCell>
                            <TableCell>
                              {new Date(publication.date_submitted).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handleViewDetails(publication)}
                                  sx={{ color: FRIS_COLORS.deepBlue, borderColor: FRIS_COLORS.deepBlue }}
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
              </CardContent>
            </Card>
          )}

          {/* Tab 1: My Submissions */}
          {activeTab === 1 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                {mySubmissions.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2 }}>
                    You haven't submitted any publications yet.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: FRIS_COLORS.lightBlue }}>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Submitted Date</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Current Approver</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mySubmissions.map((publication) => (
                          <TableRow key={`${publication.type}-${publication.id}`}>
                            <TableCell>{publication.title}</TableCell>
                            <TableCell>
                              {publication.type === 'research_activity' && 'Research Activity'}
                              {publication.type === 'course' && 'Teaching Activity'}
                              {publication.type === 'extension' && 'Extension Activity'}
                              {publication.type === 'authorship' && 'Publication'}
                            </TableCell>
                            <TableCell>
                              {new Date(publication.date_submitted).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={publication.status}
                                color={
                                  publication.status === 'approved' ? 'success' :
                                    publication.status === 'rejected' ? 'error' : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {publication.current_approver || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(publication)}
                                sx={{ color: FRIS_COLORS.deepBlue, borderColor: FRIS_COLORS.deepBlue }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 2: Approved */}
          {activeTab === 2 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                {approvedPublications.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2 }}>
                    No approved publications found.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: FRIS_COLORS.lightBlue }}>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Submitted Date</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {approvedPublications.map((publication) => (
                          <TableRow key={`${publication.type}-${publication.id}`}>
                            <TableCell>{publication.title}</TableCell>
                            <TableCell>
                              {publication.type === 'research_activity' && 'Research Activity'}
                              {publication.type === 'course' && 'Teaching Activity'}
                              {publication.type === 'extension' && 'Extension Activity'}
                              {publication.type === 'authorship' && 'Publication'}
                            </TableCell>
                            <TableCell>
                              {new Date(publication.date_submitted).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(publication)}
                                sx={{ color: FRIS_COLORS.deepBlue, borderColor: FRIS_COLORS.deepBlue }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab 3: Rejected */}
          {activeTab === 3 && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                {rejectedPublications.length === 0 ? (
                  <Alert severity="info" sx={{ my: 2 }}>
                    No rejected publications found.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: FRIS_COLORS.lightBlue }}>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Submitted Date</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rejectedPublications.map((publication) => (
                          <TableRow key={`${publication.type}-${publication.id}`}>
                            <TableCell>{publication.title}</TableCell>
                            <TableCell>
                              {publication.type === 'research_activity' && 'Research Activity'}
                              {publication.type === 'course' && 'Teaching Activity'}
                              {publication.type === 'extension' && 'Extension Activity'}
                              {publication.type === 'authorship' && 'Publication'}
                            </TableCell>
                            <TableCell>
                              {new Date(publication.date_submitted).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(publication)}
                                sx={{ color: FRIS_COLORS.deepBlue, borderColor: FRIS_COLORS.deepBlue }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity={error.includes('successfully') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Approval/Rejection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
      >
        <DialogTitle>
          {approvalAction === 'approved' ? 'Approve Publication' : 'Reject Publication'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {approvalAction === 'approved' ? 'approve' : 'reject'} "{selectedPublication?.title}"?
          </Typography>
          <TextField
            label={approvalAction === 'approved' ? 'Comments (Optional)' : 'Reason for Rejection (Required)'}
            multiline
            rows={4}
            fullWidth
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            required={approvalAction === 'rejected'}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            color={approvalAction === 'approved' ? 'success' : 'error'}
            disabled={approvalAction === 'rejected' && !comments.trim()}
            startIcon={approvalAction === 'approved' ? <CheckCircleIcon /> : <CancelIcon />}
          >
            {approvalAction === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default PublicationApprovalPage;
