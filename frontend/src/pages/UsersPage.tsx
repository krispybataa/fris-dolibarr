import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { usersAPI } from '../services/api';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface User {
  userId: number;
  userName: string;
  userEmail: string;
  role: string;
  college: string;
  department: string;
  isDepartmentHead: boolean;
  isDean: boolean;
  password?: string;
  dolibarrId?: number | null;
  dolibarr_third_party_id?: number | null;
}

const UsersPage = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [generatedPassword, setGeneratedPassword] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          // Real API call with timeout
          const data = await usersAPI.getAll();
          setUsers(data.map((user: any) => ({
            ...user,
            dolibarrId: user.dolibarr_third_party_id
          })));
        } catch (apiError) {
          console.error('API Error fetching users:', apiError);
          
          // Fallback to mock data if API call fails
          console.log('Falling back to mock data');
          const mockUsers: User[] = [
            {
              userId: 1,
              userName: 'Admin User',
              userEmail: 'admin@upm.edu.ph',
              role: 'admin',
              college: 'College of Medicine',
              department: 'Department of Biochemistry',
              isDepartmentHead: false,
              isDean: false
            },
            {
              userId: 2,
              userName: 'Department Head',
              userEmail: 'dept_head@upm.edu.ph',
              role: 'faculty',
              college: 'College of Medicine',
              department: 'Department of Biochemistry',
              isDepartmentHead: true,
              isDean: false
            },
            {
              userId: 3,
              userName: 'Dean User',
              userEmail: 'dean@upm.edu.ph',
              role: 'faculty',
              college: 'College of Medicine',
              department: 'Department of Biochemistry',
              isDepartmentHead: false,
              isDean: true
            },
            {
              userId: 4,
              userName: 'Faculty User',
              userEmail: 'faculty@upm.edu.ph',
              role: 'faculty',
              college: 'College of Medicine',
              department: 'Department of Biochemistry',
              isDepartmentHead: false,
              isDean: false
            }
          ];
          
          setUsers(mockUsers);
          setError('Using mock data - API connection failed. Changes will not be saved.');
        }
      } catch (err) {
        console.error('Error in fetchUsers:', err);
        setError('Failed to load users data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, currentUser]);

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setSelectedUser(null);
    setGeneratedPassword('');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setGeneratedPassword('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleOpenDeleteConfirm = (userId: number) => {
    setDeleteUserId(userId);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setDeleteUserId(null);
  };

  const handleDeleteUser = async () => {
    if (deleteUserId === null) return;
    
    try {
      setLoading(true);
      
      try {
        // Real API call
        await usersAPI.delete(deleteUserId);
        setSnackbarMessage('User deleted successfully');
        setSnackbarSeverity('success');
      } catch (apiError) {
        console.error('API Error deleting user:', apiError);
        setSnackbarMessage('API connection failed. Using mock data - user removed from UI only.');
        setSnackbarSeverity('warning');
      }
      
      // Update UI regardless of API success
      setUsers(users.filter(user => user.userId !== deleteUserId));
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbarMessage('Failed to delete user');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      handleCloseDeleteConfirm();
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSyncWithDolibarr = async (userId: number) => {
    try {
      setLoading(true);
      
      try {
        // Real API call
        const syncedUser = await usersAPI.syncWithDolibarr(userId);
        const updatedUsers = users.map(u => 
          u.userId === userId ? { 
            ...u, 
            dolibarrId: syncedUser.dolibarr_third_party_id 
          } : u
        );
        setUsers(updatedUsers);
        setSnackbarMessage('User synced with Dolibarr successfully');
        setSnackbarSeverity('success');
      } catch (apiError) {
        console.error('API Error syncing with Dolibarr:', apiError);
        
        // Mock sync for demo purposes
        const mockDolibarrId = Math.floor(Math.random() * 10000);
        const updatedUsers = users.map(u => 
          u.userId === userId ? { 
            ...u, 
            dolibarrId: mockDolibarrId 
          } : u
        );
        setUsers(updatedUsers);
        setSnackbarMessage('API connection failed. Using mock Dolibarr ID for demonstration.');
        setSnackbarSeverity('warning');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error syncing user with Dolibarr:', err);
      setSnackbarMessage('Failed to sync user with Dolibarr');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSyncAllWithDolibarr = async () => {
    try {
      setSyncingAll(true);
      
      try {
        // Real API call
        const syncedUsers = await usersAPI.syncAllWithDolibarr();
        setUsers(syncedUsers.map((user: any) => ({
          ...user,
          dolibarrId: user.dolibarr_third_party_id
        })));
        setSnackbarMessage('All users synced with Dolibarr successfully');
        setSnackbarSeverity('success');
      } catch (apiError) {
        console.error('API Error syncing all users with Dolibarr:', apiError);
        
        // Mock sync all for demo purposes
        const updatedUsers = users.map(u => ({
          ...u,
          dolibarrId: u.dolibarrId || Math.floor(Math.random() * 10000)
        }));
        setUsers(updatedUsers);
        setSnackbarMessage('API connection failed. Using mock Dolibarr IDs for demonstration.');
        setSnackbarSeverity('warning');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error syncing all users with Dolibarr:', err);
      setSnackbarMessage('Failed to sync all users with Dolibarr');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSubmitUser = async (values: User) => {
    try {
      setLoading(true);
      
      if (dialogMode === 'add') {
        // Generate a random password for new users
        const password = generateRandomPassword();
        values.password = password;
        setGeneratedPassword(password);
        
        try {
          // Real API call
          const newUser = await usersAPI.create(values);
          setUsers([...users, {
            ...newUser,
            dolibarrId: newUser.dolibarr_third_party_id
          }]);
          setSnackbarMessage('User added successfully. Please sync with Dolibarr.');
          setSnackbarSeverity('success');
        } catch (apiError) {
          console.error('API Error creating user:', apiError);
          
          // Mock user creation for demo purposes
          const mockUser = {
            ...values,
            userId: Math.max(...users.map(u => u.userId), 0) + 1,
            dolibarrId: null
          };
          setUsers([...users, mockUser]);
          setSnackbarMessage('API connection failed. User added to UI only (mock data).');
          setSnackbarSeverity('warning');
        }
        
        setSnackbarOpen(true);
      } else {
        // Edit existing user
        try {
          // Real API call
          const updatedUser = await usersAPI.update(selectedUser?.userId as number, values);
          const updatedUsers = users.map(u => 
            u.userId === selectedUser?.userId ? {
              ...updatedUser,
              dolibarrId: updatedUser.dolibarr_third_party_id
            } : u
          );
          setUsers(updatedUsers);
          setSnackbarMessage('User updated successfully');
          setSnackbarSeverity('success');
        } catch (apiError) {
          console.error('API Error updating user:', apiError);
          
          // Mock user update for demo purposes
          const updatedUsers = users.map(u => 
            u.userId === selectedUser?.userId ? {
              ...u,
              ...values
            } : u
          );
          setUsers(updatedUsers);
          setSnackbarMessage('API connection failed. User updated in UI only (mock data).');
          setSnackbarSeverity('warning');
        }
        
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbarMessage('Failed to save user');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      // Don't close dialog if we're showing a generated password
      if (dialogMode !== 'add' || !generatedPassword) {
        handleCloseDialog();
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const validationSchema = Yup.object({
    userName: Yup.string().required('Name is required'),
    userEmail: Yup.string().email('Invalid email address').required('Email is required'),
    role: Yup.string().required('Role is required'),
    college: Yup.string().required('College is required'),
    department: Yup.string().required('Department is required')
  });

  const initialValues: User = selectedUser || {
    userId: 0,
    userName: '',
    userEmail: '',
    role: 'faculty',
    college: '',
    department: '',
    isDepartmentHead: false,
    isDean: false
  };

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <Layout>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="warning">
            You do not have permission to access this page. Only administrators can manage users.
          </Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSyncAllWithDolibarr}
            disabled={syncingAll}
            startIcon={syncingAll ? <CircularProgress size={20} /> : null}
          >
            {syncingAll ? 'Syncing...' : 'Sync All with Dolibarr'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
          {loading && users.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>College</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dolibarr</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId} hover>
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{user.userEmail}</TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Chip 
                          label="Admin" 
                          size="small" 
                          sx={{ bgcolor: FRIS_COLORS.burgundy, color: 'white' }}
                        />
                      ) : (
                        <Chip 
                          label="Faculty" 
                          size="small" 
                          sx={{ bgcolor: FRIS_COLORS.green, color: 'white' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.college}</TableCell>
                    <TableCell>
                      {user.isDean && (
                        <Chip 
                          label="Dean" 
                          size="small" 
                          sx={{ mr: 0.5, bgcolor: FRIS_COLORS.gold, color: 'black' }}
                        />
                      )}
                      {user.isDepartmentHead && (
                        <Chip 
                          label="Dept. Head" 
                          size="small" 
                          sx={{ bgcolor: '#2196f3', color: 'white' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {user.dolibarrId ? (
                        <Chip 
                          label={`ID: ${user.dolibarrId}`}
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip 
                          label="Not Synced"
                          size="small"
                          color="warning"
                          onClick={() => handleSyncWithDolibarr(user.userId)}
                          sx={{ cursor: 'pointer' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteConfirm(user.userId)}
                        size="small"
                        disabled={user.userId === currentUser?.userId} // Prevent deleting self
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmitUser}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <DialogContent>
                {generatedPassword && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Generated Password: {generatedPassword}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Please save this password as it will not be shown again.
                    </Typography>
                  </Alert>
                )}
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="userName"
                    value={values.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.userName && Boolean(errors.userName)}
                    helperText={touched.userName && errors.userName}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="userEmail"
                    value={values.userEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.userEmail && Boolean(errors.userEmail)}
                    helperText={touched.userEmail && errors.userEmail}
                  />
                  
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.role && Boolean(errors.role)}
                      label="Role"
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="faculty">Faculty</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label="College"
                    name="college"
                    value={values.college}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.college && Boolean(errors.college)}
                    helperText={touched.college && errors.college}
                  />
                  
                  <TextField
                    fullWidth
                    label="Department"
                    name="department"
                    value={values.department}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.department && Boolean(errors.department)}
                    helperText={touched.department && errors.department}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Department Head</InputLabel>
                      <Select
                        name="isDepartmentHead"
                        value={values.isDepartmentHead ? 'true' : 'false'}
                        onChange={handleChange}
                        label="Department Head"
                      >
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>Dean</InputLabel>
                      <Select
                        name="isDean"
                        value={values.isDean ? 'true' : 'false'}
                        onChange={handleChange}
                        label="Dean"
                      >
                        <MenuItem value="true">Yes</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ 
                    bgcolor: FRIS_COLORS.green,
                    '&:hover': {
                      bgcolor: '#004d34'
                    }
                  }}
                >
                  {dialogMode === 'add' ? 'Add User' : 'Save Changes'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default UsersPage;
