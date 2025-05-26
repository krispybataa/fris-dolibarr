import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Grid as MuiGrid } from '@mui/material';
const Grid = MuiGrid as any; // Type casting to avoid TypeScript errors
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import InterestsIcon from '@mui/icons-material/Interests';
import { profileAPI } from '../services/api';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FRIS_COLORS } from '../theme';

// Additional colors for this component
const PROFILE_COLORS = {
  lightBurgundy: '#a84a66',
  lightGreen: '#4c9d84',
  lightGold: '#f7d88c'
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  style?: React.CSSProperties;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ProfileData {
  userId: number;
  userName: string;
  userEmail: string;
  college: string;
  department: string;
  role: string;
  degrees: Array<{
    id?: number;
    degree: string;
    institution: string;
    year: number;
  }>;
  researchInterests: Array<{
    id?: number;
    interest: string;
  }>;
  affiliations: Array<{
    id?: number;
    organization: string;
    position: string;
    yearJoined: number;
  }>;
}

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        console.log('Fetching profile data...');
        console.log('Current token:', token);
        
        const data = await profileAPI.getProfile();
        console.log('Received profile data:', data);
        
        // Check if data is empty or missing expected fields
        if (!data) {
          console.error('Profile data is null or undefined');
          setError('No profile data received from server');
        } else if (!data.user) {
          console.error('Profile data missing user object:', data);
          setError('Incomplete profile data received');
        } else {
          console.log('User data received:', data.user);
          console.log('Degrees:', data.degrees);
          console.log('Research interests:', data.research_interests);
          console.log('Affiliations:', data.affiliations);
          
          // Map the backend response to the frontend data structure
          const mappedData: ProfileData = {
            userId: data.user.userId,
            userName: data.user.userName,
            userEmail: data.user.userEmail,
            college: data.user.college,
            department: data.user.department,
            role: data.user.role,
            degrees: Array.isArray(data.degrees) ? data.degrees.map((d: any) => ({
              id: d.degreeId,
              degree: d.degreeType,
              institution: d.school,
              year: d.year
            })) : [],
            researchInterests: Array.isArray(data.research_interests) ? data.research_interests.map((ri: any) => ({
              id: ri.id,
              interest: ri.interest
            })) : [],
            affiliations: Array.isArray(data.affiliations) ? data.affiliations.map((a: any) => ({
              id: a.affId,
              organization: a.organization || a.affInt || '',
              position: a.position || '',
              yearJoined: a.yearJoined || new Date().getFullYear()
            })) : []
          };
          
          console.log('Mapped profile data:', mappedData);
          setProfileData(mappedData);
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Failed to load profile data: ' + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [token]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async (values: ProfileData) => {
    try {
      setLoading(true);
      console.log('Updating profile data...');
      const updatedData = await profileAPI.updateProfile(values);
      console.log('Profile updated successfully:', updatedData);
      setProfileData(updatedData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <Layout>
        <Box sx={{ display: 'block', textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error && !profileData) {
    return (
      <Layout>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      </Layout>
    );
  }

  // Ensure we have valid initial values with all required arrays
  const initialValues: ProfileData = {
    userId: profileData?.userId || user?.userId || 0,
    userName: profileData?.userName || user?.userName || '',
    userEmail: profileData?.userEmail || user?.userEmail || '',
    college: profileData?.college || user?.college || '',
    department: profileData?.department || user?.department || '',
    role: profileData?.role || user?.role || '',
    // Always ensure these are arrays, even if the data is missing
    degrees: Array.isArray(profileData?.degrees) ? profileData.degrees : [],
    researchInterests: Array.isArray(profileData?.researchInterests) ? profileData.researchInterests : [],
    affiliations: Array.isArray(profileData?.affiliations) ? profileData.affiliations : []
  };

  const validationSchema = Yup.object({
    userName: Yup.string().required('Name is required'),
    userEmail: Yup.string().email('Invalid email address').required('Email is required'),
    college: Yup.string().required('College is required'),
    department: Yup.string().required('Department is required'),
    degrees: Yup.array().of(
      Yup.object().shape({
        degree: Yup.string().required('Degree is required'),
        institution: Yup.string().required('Institution is required'),
        year: Yup.number().required('Year is required').integer('Must be a year')
      })
    ),
    researchInterests: Yup.array().of(
      Yup.object().shape({
        interest: Yup.string().required('Interest is required')
      })
    ),
    affiliations: Yup.array().of(
      Yup.object().shape({
        organization: Yup.string().required('Organization is required'),
        position: Yup.string().required('Position is required'),
        yearJoined: Yup.number().required('Year is required').integer('Must be a year')
      })
    )
  });

  return (
    <Layout>
      <Box sx={{ 
        mb: 4, 
        width: '100%',
        maxWidth: '100%'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and edit your personal information
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSaveProfile}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form style={{ width: '100%', maxWidth: '100%' }}>
            <Paper sx={{ 
              mb: 4, 
              width: '100%', 
              boxSizing: 'border-box',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 3, 
                bgcolor: FRIS_COLORS.burgundy, 
                color: 'white', 
                width: '100%'
              }}>
                <Box sx={{ display: 'table', width: '100%' }}>
                  <Box sx={{ display: 'table-cell', verticalAlign: 'middle', width: '120px' }}>
                    <Avatar 
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        border: '3px solid white'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {values.userName}
                    </Typography>
                    <Typography variant="body1">
                      {values.department}, {values.college}
                    </Typography>
                    <Typography variant="body2">
                      {values.role}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'right', width: '150px' }}>
                  {!editMode ? (
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                      sx={{ 
                        bgcolor: 'white', 
                        color: FRIS_COLORS.burgundy,
                        '&:hover': {
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box>
                      <Button 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        type="submit"
                        disabled={isSubmitting}
                        sx={{ 
                          mr: 1,
                          bgcolor: FRIS_COLORS.green,
                          '&:hover': {
                            bgcolor: '#004d34'
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<CancelIcon />}
                        onClick={() => setEditMode(false)}
                        sx={{ 
                          bgcolor: 'white', 
                          color: FRIS_COLORS.burgundy,
                          '&:hover': {
                            bgcolor: '#f5f5f5'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ 
                p: 3, 
                width: '100%', 
                boxSizing: 'border-box',
                display: 'block'
              }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  <Grid item xs={12} md={6}>
                    {/* content */}
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="userName"
                      value={values.userName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.userName && Boolean(errors.userName)}
                      helperText={touched.userName && errors.userName}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="userEmail"
                      value={values.userEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.userEmail && Boolean(errors.userEmail)}
                      helperText={touched.userEmail && errors.userEmail}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="College"
                      name="college"
                      value={values.college}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.college && Boolean(errors.college)}
                      helperText={touched.college && errors.college}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={values.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.department && Boolean(errors.department)}
                      helperText={touched.department && errors.department}
                      disabled={!editMode}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Paper 
              elevation={2}
              sx={{ 
                mb: 4,
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }
              }}
            >
              <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider'
              }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="profile tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#8b1f41', // Original burgundy color
                      height: 3
                    },
                    '& .MuiTab-root': {
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        color: '#8b1f41' // Original burgundy color
                      },
                      '&:hover': {
                        color: '#a84a66', // Original lightBurgundy color
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }
                  }}
                >
                  <Tab 
                    icon={<SchoolIcon />} 
                    label="Education" 
                    id="profile-tab-0" 
                    aria-controls="profile-tabpanel-0"
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<InterestsIcon />} 
                    label="Research Interests" 
                    id="profile-tab-1" 
                    aria-controls="profile-tabpanel-1"
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<WorkIcon />} 
                    label="Affiliations" 
                    id="profile-tab-2" 
                    aria-controls="profile-tabpanel-2"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0} style={{ width: '100%', overflow: 'hidden' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: FRIS_COLORS.burgundy,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <SchoolIcon /> Educational Background
                </Typography>
                
                <FieldArray name="degrees">
                  {({ push, remove }) => (
                    <>
                      {/* Ensure degrees is always an array before mapping */}
                      {(values.degrees || []).map((degree, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Degree"
                                  name={`degrees.${index}.degree`}
                                  value={degree.degree}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.degrees?.[index]?.degree && 
                                    Boolean(errors.degrees?.[index] && typeof errors.degrees[index] !== 'string' && errors.degrees[index]?.degree)
                                  }
                                  helperText={
                                    touched.degrees?.[index]?.degree && 
                                    (typeof errors.degrees?.[index] === 'object' ? errors.degrees[index]?.degree : undefined)
                                  }
                                  disabled={!editMode}
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Institution"
                                  name={`degrees.${index}.institution`}
                                  value={degree.institution}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.degrees?.[index]?.institution && 
                                    Boolean(errors.degrees?.[index] && typeof errors.degrees[index] !== 'string' && errors.degrees[index]?.institution)
                                  }
                                  helperText={
                                    touched.degrees?.[index]?.institution && 
                                    (typeof errors.degrees?.[index] === 'object' ? errors.degrees[index]?.institution : undefined)
                                  }
                                  disabled={!editMode}
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  label="Year"
                                  name={`degrees.${index}.year`}
                                  value={degree.year}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.degrees?.[index]?.year && 
                                    Boolean(errors.degrees?.[index] && typeof errors.degrees[index] !== 'string' && errors.degrees[index]?.year)
                                  }
                                  helperText={
                                    touched.degrees?.[index]?.year && 
                                    (typeof errors.degrees?.[index] === 'object' ? errors.degrees[index]?.year : undefined)
                                  }
                                  disabled={!editMode}
                                  type="number"
                                />
                              </Grid>
                              {editMode && (
                                <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => remove(index)}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {editMode && (
                        <Button
                          variant="outlined"
                          onClick={() => push({ degree: '', institution: '', year: new Date().getFullYear() })}
                          sx={{ 
                            mt: 2,
                            borderColor: FRIS_COLORS.burgundy,
                            color: FRIS_COLORS.burgundy,
                            '&:hover': {
                              borderColor: PROFILE_COLORS.lightBurgundy,
                              backgroundColor: 'rgba(139, 31, 65, 0.04)'
                            }
                          }}
                          startIcon={<SchoolIcon />}
                        >
                          Add Education
                        </Button>
                      )}
                    </>
                  )}
                </FieldArray>
              </TabPanel>

              <TabPanel value={tabValue} index={1} style={{ width: '100%', overflow: 'hidden' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: FRIS_COLORS.burgundy,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <InterestsIcon /> Research Interests
                </Typography>
                
                <FieldArray name="researchInterests">
                  {({ push, remove }) => (
                    <>
                      {/* Ensure researchInterests is always an array before mapping */}
                      {(values.researchInterests || []).map((researchInterest, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={11}>
                                <TextField
                                  fullWidth
                                  label="Research Interest"
                                  name={`researchInterests.${index}.interest`}
                                  value={researchInterest.interest}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.researchInterests?.[index]?.interest && 
                                    Boolean(errors.researchInterests?.[index] && typeof errors.researchInterests[index] !== 'string' && errors.researchInterests[index]?.interest)
                                  }
                                  helperText={
                                    touched.researchInterests?.[index]?.interest && 
                                    (typeof errors.researchInterests?.[index] === 'object' ? errors.researchInterests[index]?.interest : undefined)
                                  }
                                  disabled={!editMode}
                                />
                              </Grid>
                              {editMode && (
                                <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => remove(index)}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {editMode && (
                        <Button
                          variant="outlined"
                          onClick={() => push({ interest: '' })}
                          sx={{ 
                            mt: 2,
                            borderColor: FRIS_COLORS.burgundy,
                            color: FRIS_COLORS.burgundy,
                            '&:hover': {
                              borderColor: PROFILE_COLORS.lightBurgundy,
                              backgroundColor: 'rgba(139, 31, 65, 0.04)'
                            }
                          }}
                          startIcon={<InterestsIcon />}
                        >
                          Add Research Interest
                        </Button>
                      )}
                    </>
                  )}
                </FieldArray>
              </TabPanel>

              <TabPanel value={tabValue} index={2} style={{ width: '100%', overflow: 'hidden' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    color: FRIS_COLORS.burgundy,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <WorkIcon /> Professional Affiliations
                </Typography>
                
                <FieldArray name="affiliations">
                  {({ push, remove }) => (
                    <>
                      {/* Ensure affiliations is always an array before mapping */}
                      {(values.affiliations || []).map((affiliation, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={5}>
                                <TextField
                                  fullWidth
                                  label="Organization"
                                  name={`affiliations.${index}.organization`}
                                  value={affiliation.organization}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.affiliations?.[index]?.organization && 
                                    Boolean(errors.affiliations?.[index] && typeof errors.affiliations[index] !== 'string' && errors.affiliations[index]?.organization)
                                  }
                                  helperText={
                                    touched.affiliations?.[index]?.organization && 
                                    (typeof errors.affiliations?.[index] === 'object' ? errors.affiliations[index]?.organization : undefined)
                                  }
                                  disabled={!editMode}
                                />
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <TextField
                                  fullWidth
                                  label="Position"
                                  name={`affiliations.${index}.position`}
                                  value={affiliation.position}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.affiliations?.[index]?.position && 
                                    Boolean(errors.affiliations?.[index] && typeof errors.affiliations[index] !== 'string' && errors.affiliations[index]?.position)
                                  }
                                  helperText={
                                    touched.affiliations?.[index]?.position && 
                                    (typeof errors.affiliations?.[index] === 'object' ? errors.affiliations[index]?.position : undefined)
                                  }
                                  disabled={!editMode}
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  fullWidth
                                  label="Year Joined"
                                  name={`affiliations.${index}.yearJoined`}
                                  value={affiliation.yearJoined}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    touched.affiliations?.[index]?.yearJoined && 
                                    Boolean(errors.affiliations?.[index] && typeof errors.affiliations[index] !== 'string' && errors.affiliations[index]?.yearJoined)
                                  }
                                  helperText={
                                    touched.affiliations?.[index]?.yearJoined && 
                                    (typeof errors.affiliations?.[index] === 'object' ? errors.affiliations[index]?.yearJoined : undefined)
                                  }
                                  disabled={!editMode}
                                  type="number"
                                />
                              </Grid>
                              {editMode && (
                                <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => remove(index)}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {editMode && (
                        <Button
                          variant="outlined"
                          onClick={() => push({ organization: '', position: '', yearJoined: new Date().getFullYear() })}
                          sx={{ 
                            mt: 2,
                            borderColor: FRIS_COLORS.burgundy,
                            color: FRIS_COLORS.burgundy,
                            '&:hover': {
                               borderColor: PROFILE_COLORS.lightBurgundy,
                              backgroundColor: 'rgba(139, 31, 65, 0.04)'
                            }
                          }}
                          startIcon={<WorkIcon />}
                        >
                          Add Affiliation
                        </Button>
                      )}
                    </>
                  )}
                </FieldArray>
              </TabPanel>
            </Paper>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default ProfilePage;
