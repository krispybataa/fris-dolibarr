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
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { facultyApi, authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Faculty {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  dolibarr_id?: number;
  role?: string;
}

interface FacultyFormData {
  full_name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
}

const FacultyManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState<FacultyFormData>({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    role: 'faculty'
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        const data = await facultyApi.getAll();
        setFaculties(data);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        setError('Failed to load faculty data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleOpenDialog = (faculty?: Faculty) => {
    if (faculty) {
      setEditingFaculty(faculty);
      setFormData({
        full_name: faculty.full_name,
        email: faculty.email,
        phone: faculty.phone || '',
        department: faculty.department,
        role: faculty.role || 'faculty'
      });
    } else {
      setEditingFaculty(null);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        department: '',
        role: 'faculty'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate username from email or name
  const generateUsername = (email: string, fullName: string): string => {
    // Try to get username from email (before @)
    const emailUsername = email.split('@')[0];
    if (emailUsername && emailUsername.length >= 3) {
      return emailUsername.toLowerCase();
    }
    
    // If email username is too short, use name initials + random number
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      const initials = nameParts.map(part => part[0].toLowerCase()).join('');
      return `${initials}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    // Fallback
    return `user${Math.floor(1000 + Math.random() * 9000)}`;
  };
  
  // Generate a temporary password
  const generatePassword = (): string => {
    return `faculty${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Validate form data
      if (!formData.full_name || !formData.email || !formData.department) {
        setError('Please fill in all required fields.');
        return;
      }
      
      let facultyId: number;
      
      if (editingFaculty) {
        // Update existing faculty
        const updatedFaculty = await facultyApi.update(editingFaculty.id, formData);
        facultyId = updatedFaculty.id;
        setSuccess(`Faculty ${formData.full_name} updated successfully.`);
      } else {
        // Create new faculty
        const newFaculty = await facultyApi.create(formData);
        facultyId = newFaculty.id;
        
        // Generate username and password
        const username = generateUsername(formData.email, formData.full_name);
        const password = generatePassword();
        
        // Create user account
        try {
          await authApi.registerUser({
            username,
            email: formData.email,
            password,
            role: formData.role,
            faculty_id: facultyId,
            is_active: true
          });
          
          setSuccess(
            `Faculty ${formData.full_name} created successfully.\n` +
            `User account created with:\n` +
            `Username: ${username}\n` +
            `Password: ${password}\n` +
            `Please save these credentials!`
          );
        } catch (userErr: any) {
          console.error('Error creating user account:', userErr);
          // Extract detailed error information
          let errorDetail = 'Unknown error';
          if (userErr.response?.data) {
            if (typeof userErr.response.data === 'object') {
              errorDetail = JSON.stringify(userErr.response.data, null, 2);
            } else {
              errorDetail = userErr.response.data.toString();
            }
          }
          setSuccess(
            `Faculty ${formData.full_name} created successfully, but failed to create user account.\n` +
            `Error: ${errorDetail}`
          );
        }
      }
      
      // Refresh faculty list
      const data = await facultyApi.getAll();
      setFaculties(data);
      
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving faculty:', err);
      setError(err.response?.data?.detail || 'An error occurred while saving the faculty.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this faculty? This action cannot be undone.')) {
      try {
        await facultyApi.delete(id);
        setFaculties(faculties.filter(f => f.id !== id));
        setSuccess('Faculty deleted successfully.');
      } catch (err: any) {
        console.error('Error deleting faculty:', err);
        setError(err.response?.data?.detail || 'An error occurred while deleting the faculty.');
      }
    }
  };

  const handleSyncWithDolibarr = async (id: number) => {
    try {
      await facultyApi.syncWithDolibarr(id);
      // Refresh faculty list to get updated dolibarr_id
      const data = await facultyApi.getAll();
      setFaculties(data);
      setSuccess('Faculty synced with Dolibarr successfully.');
    } catch (err: any) {
      console.error('Error syncing with Dolibarr:', err);
      setError(err.response?.data?.detail || 'An error occurred while syncing with Dolibarr.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Faculty Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Faculty
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Dolibarr ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No faculty records found.
                </TableCell>
              </TableRow>
            ) : (
              faculties.map((faculty) => (
                <TableRow key={faculty.id}>
                  <TableCell>{faculty.id}</TableCell>
                  <TableCell>{faculty.full_name}</TableCell>
                  <TableCell>{faculty.email}</TableCell>
                  <TableCell>{faculty.department}</TableCell>
                  <TableCell>{faculty.phone || '-'}</TableCell>
                  <TableCell>
                    {faculty.role === 'dean' ? (
                      <Chip label="Dean" color="primary" size="small" />
                    ) : faculty.role === 'admin' ? (
                      <Chip label="Admin" color="secondary" size="small" />
                    ) : (
                      <Chip label="Faculty" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {faculty.dolibarr_id || '-'}
                    {!faculty.dolibarr_id && (
                      <Button 
                        size="small" 
                        onClick={() => handleSyncWithDolibarr(faculty.id)}
                        sx={{ ml: 1 }}
                      >
                        Sync
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenDialog(faculty)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDelete(faculty.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Faculty Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleSelectChange}
              >
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="dean">Dean</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyManagement;
