import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import CourseForm from '../components/teaching/CourseForm';
import AuthorshipForm from '../components/teaching/AuthorshipForm';
import { teachingAPI, authorshipAPI } from '../services/api';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Define interfaces for form values
interface CourseFormValues {
  academicYear: string;
  term: string;
  courseNum: string;
  section: string;
  courseDesc: string;
  courseType: string;
  percentContribution: string;
  loadCreditUnits: string;
  partOneStudent?: string;
  partTwoCourse?: string;
  partThreeTeaching?: string;
  teachingPoints?: string;
  supportingDocument?: File | null;
}

interface AuthorshipFormValues {
  title: string;
  authors: string;
  date: string;
  upCourse?: string;
  recommendingUnit: string;
  publisher: string;
  authorshipType: string;
  numberOfAuthors: string;
  supportingDocument?: File | null;
}

const EditTeachingActivityPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [courseData, setCourseData] = useState<CourseFormValues | null>(null);
  const [authorshipData, setAuthorshipData] = useState<AuthorshipFormValues | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!type || !id) {
          throw new Error('Missing type or ID parameter');
        }

        if (type === 'courses') {
          const response = await teachingAPI.getCourseById(parseInt(id));
          console.log('Course data:', response);
          
          // Convert API response to form values
          setCourseData({
            academicYear: response.academicYear || '',
            term: response.term || '',
            courseNum: response.courseNum || '',
            section: response.section || '',
            courseDesc: response.courseDesc || '',
            courseType: response.courseType || '',
            percentContribution: response.percentContri?.toString() || '0',
            loadCreditUnits: response.loadCreditUnits?.toString() || '0',
            partOneStudent: response.partOneStudent?.toString() || '',
            partTwoCourse: response.partTwoCourse?.toString() || '',
            partThreeTeaching: response.partThreeTeaching?.toString() || '',
            teachingPoints: response.teachingPoints?.toString() || '',
            supportingDocument: null // Can't pre-load file, just show filename if available
          });
        } else if (type === 'authorships') {
          const response = await authorshipAPI.getById(parseInt(id));
          console.log('Authorship data:', response);
          
          // Convert API response to form values
          setAuthorshipData({
            title: response.title || '',
            authors: response.authors || '',
            date: response.date || '',
            upCourse: response.upCourse || '',
            recommendingUnit: response.recommendingUnit || '',
            publisher: response.publisher || '',
            authorshipType: response.authorshipType || '',
            numberOfAuthors: response.numberOfAuthors?.toString() || '1',
            supportingDocument: null // Can't pre-load file, just show filename if available
          });
        } else {
          throw new Error(`Invalid type: ${type}`);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, type, id]);

  const handleGoBack = () => {
    navigate('/teaching');
  };

  const handleCourseSubmit = async (values: CourseFormValues) => {
    try {
      console.log('Updating course data:', values);
      
      // Convert form values to API format
      const courseUpdateData: {
        academicYear: string;
        term: string;
        courseNum: string;
        section: string;
        courseDesc: string;
        courseType: string;
        percentContri: number;
        loadCreditUnits: number;
        noOfRespondents: number;
        partOneStudent: number | null;
        partTwoCourse: number | null;
        partThreeTeaching: number | null;
        teachingPoints: number | null;
        supportingDocumentId?: string;
      } = {
        academicYear: values.academicYear,
        term: values.term,
        courseNum: values.courseNum,
        section: values.section,
        courseDesc: values.courseDesc,
        courseType: values.courseType,
        percentContri: parseFloat(values.percentContribution),
        loadCreditUnits: parseFloat(values.loadCreditUnits),
        noOfRespondents: 0, // This would come from somewhere else
        partOneStudent: values.partOneStudent ? parseFloat(values.partOneStudent) : null,
        partTwoCourse: values.partTwoCourse ? parseFloat(values.partTwoCourse) : null,
        partThreeTeaching: values.partThreeTeaching ? parseFloat(values.partThreeTeaching) : null,
        teachingPoints: values.teachingPoints ? parseFloat(values.teachingPoints) : null
      };
      
      // Handle file upload if there's a new supporting document
      if (values.supportingDocument) {
        console.log('Uploading supporting document:', values.supportingDocument.name);
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', values.supportingDocument);
        // Upload the file first
        const fileResponse = await teachingAPI.uploadSupportingDocument(formData);
        // Add the file ID to the course data
        courseUpdateData.supportingDocumentId = fileResponse.fileId;
      }
      
      // Call the API to update the course
      await teachingAPI.updateCourse(parseInt(id!), courseUpdateData);
      
      alert('Course updated successfully!');
      navigate('/teaching');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleAuthorshipSubmit = async (values: AuthorshipFormValues) => {
    try {
      console.log('Updating authorship data:', values);
      
      // Convert form values to API format
      const authorshipUpdateData: {
        title: string;
        authors: string;
        date: string;
        upCourse?: string;
        recommendingUnit: string;
        publisher: string;
        authorshipType: string;
        numberOfAuthors: number;
        supportingDocumentId?: string;
      } = {
        title: values.title,
        authors: values.authors,
        date: values.date,
        upCourse: values.upCourse,
        recommendingUnit: values.recommendingUnit,
        publisher: values.publisher,
        authorshipType: values.authorshipType,
        numberOfAuthors: parseInt(values.numberOfAuthors)
      };
      
      // Handle file upload if there's a new supporting document
      if (values.supportingDocument) {
        console.log('Uploading supporting document:', values.supportingDocument.name);
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', values.supportingDocument);
        // Upload the file first
        const fileResponse = await authorshipAPI.uploadSupportingDocument(formData);
        // Add the file ID to the authorship data
        authorshipUpdateData.supportingDocumentId = fileResponse.fileId;
      }
      
      // Call the API to update the authorship
      await authorshipAPI.update(parseInt(id!), authorshipUpdateData);
      
      alert('Authorship updated successfully!');
      navigate('/teaching');
    } catch (error) {
      console.error('Error updating authorship:', error);
      alert('Failed to update authorship. Please try again.');
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mb: 2 }}
        >
          Back to Teaching Activities
        </Button>
        
        <Typography variant="h4" component="h1" sx={{ mb: 3, color: FRIS_COLORS.burgundy }}>
          Edit {type === 'courses' ? 'Course' : 'Authorship'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
            {type === 'courses' && courseData && (
              <CourseForm 
                initialValues={courseData}
                onSubmit={handleCourseSubmit}
                onCancel={handleGoBack}
                submitButtonText="Update Course"
              />
            )}
            
            {type === 'authorships' && authorshipData && (
              <AuthorshipForm 
                initialValues={authorshipData}
                onSubmit={handleAuthorshipSubmit}
                onCancel={handleGoBack}
                submitButtonText="Update Authorship"
              />
            )}
          </Paper>
        )}
      </Box>
    </Layout>
  );
};

export default EditTeachingActivityPage;
