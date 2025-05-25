import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ActivityTypeDialog from '../components/teaching/ActivityTypeDialog';
import CourseForm from '../components/teaching/CourseForm';
import AuthorshipForm from '../components/teaching/AuthorshipForm';

// Define the form value interfaces locally
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
import BatchUploadForm from '../components/teaching/BatchUploadForm';
// Import APIs for teaching activities
import { teachingAPI, authorshipAPI } from '../services/api';

const AddTeachingActivityPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activityType, setActivityType] = useState<'courses' | 'authorships' | null>(null);
  const [isBatchUpload, setIsBatchUpload] = useState<boolean>(false);
  const [showTypeDialog, setShowTypeDialog] = useState<boolean>(false);

  // Check if user is authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleTypeSelect = (type: 'courses' | 'authorships') => {
    setActivityType(type);
    setShowTypeDialog(false);
  };

  const handleChangeType = () => {
    setShowTypeDialog(true);
  };

  const handleCancel = () => {
    navigate('/teaching');
  };

  const handleCourseSubmit = async (values: CourseFormValues) => {
    try {
      console.log('Submitting course data:', values);
      
      // Convert form values to API format
      const courseData: {
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
      
      // Handle file upload if there's a supporting document
      if (values.supportingDocument) {
        console.log('Uploading supporting document:', values.supportingDocument.name);
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', values.supportingDocument);
        // Upload the file first
        const fileResponse = await teachingAPI.uploadSupportingDocument(formData);
        // Add the file ID to the course data
        courseData.supportingDocumentId = fileResponse.fileId;
      }
      
      // Call the API to create the course
      await teachingAPI.createCourse(courseData);
      
      alert('Course saved successfully!');
      navigate('/teaching');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const handleAuthorshipSubmit = async (values: AuthorshipFormValues) => {
    try {
      console.log('Submitting authorship data:', values);
      
      // Convert form values to API format
      const authorshipData: {
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
      
      // Handle file upload if there's a supporting document
      if (values.supportingDocument) {
        console.log('Uploading supporting document:', values.supportingDocument.name);
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', values.supportingDocument);
        // Upload the file first
        const fileResponse = await authorshipAPI.uploadSupportingDocument(formData);
        // Add the file ID to the authorship data
        authorshipData.supportingDocumentId = fileResponse.fileId;
      }
      
      // Call the API to create the authorship
      await authorshipAPI.create(authorshipData);
      
      alert('Authorship saved successfully!');
      navigate('/teaching');
    } catch (error) {
      console.error('Error saving authorship:', error);
      alert('Failed to save authorship. Please try again.');
    }
  };

  const handleBatchUpload = async (file: File) => {
    try {
      console.log(`Uploading ${activityType} batch file:`, file.name);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the appropriate API based on activity type
      if (activityType === 'courses') {
        await teachingAPI.createMultipleCourses(formData);
      } else {
        await authorshipAPI.createMultiple(formData);
      }
      
      alert(`${activityType === 'courses' ? 'Courses' : 'Authorships'} uploaded successfully!`);
      navigate('/teaching');
    } catch (error) {
      console.error('Error uploading batch file:', error);
      throw new Error('Failed to upload batch file. Please try again.');
    }
  };

  // Handle the location state to determine if we're adding a single entry or batch
  React.useEffect(() => {
    // Get state from location if available
    const locationState = window.history.state?.usr || {};
    
    if (locationState.batch) {
      setIsBatchUpload(true);
    }
    
    if (locationState.type === 'courses' || locationState.type === 'authorships') {
      setActivityType(locationState.type);
      setShowTypeDialog(false);
    } else {
      // If no type is specified, show the dialog
      setShowTypeDialog(true);
    }
  }, []);

  return (
    <Layout>
      {/* Activity Type Selection Dialog */}
      <ActivityTypeDialog
        open={showTypeDialog}
        onClose={() => navigate('/teaching')}
        onSelectType={handleTypeSelect}
      />
      
      {/* Single Entry Forms */}
      {!isBatchUpload && activityType === 'courses' && (
        <CourseForm
          onSubmit={handleCourseSubmit}
          onCancel={handleCancel}
        />
      )}
      
      {!isBatchUpload && activityType === 'authorships' && (
        <AuthorshipForm
          onSubmit={handleAuthorshipSubmit}
          onCancel={handleCancel}
        />
      )}
      
      {/* Batch Upload Form */}
      {isBatchUpload && activityType && (
        <BatchUploadForm
          type={activityType}
          onSubmit={handleBatchUpload}
          onCancel={handleCancel}
          onChangeType={handleChangeType}
        />
      )}
    </Layout>
  );
};

export default AddTeachingActivityPage;
