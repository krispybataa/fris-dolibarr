import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import ActivityTypeDialog from '../components/research/ActivityTypeDialog';
import ResearchForm from '../components/research/ResearchForm';
import BatchUploadForm from '../components/research/BatchUploadForm';
import { researchAPI } from '../services/api';

// Define the form value interfaces
interface ResearchFormValues {
  title: string;
  institute: string;
  authors: string;
  datePublished: string;
  startDate?: string;
  endDate?: string;
  journal?: string;
  citedAs?: string;
  doi?: string;
  publicationType: string;
  sdgs: Array<{sdgNum: number, sdgDesc: string}>;
  supportingDocument?: File | null;
}

const AddResearchActivityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [activityType, setActivityType] = useState<string | null>(null);
  const [isBatchUpload, setIsBatchUpload] = useState<boolean>(false);
  const [showTypeDialog, setShowTypeDialog] = useState<boolean>(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Handle the location state to determine if we're adding a single entry or batch
  useEffect(() => {
    // Get state from location
    const locationState = location.state as { type?: string; batch?: boolean } || {};
    
    if (locationState.batch) {
      setIsBatchUpload(true);
    }
    
    if (locationState.type) {
      setActivityType(locationState.type);
      setShowTypeDialog(false);
    } else {
      // If no type is specified, show the dialog
      setShowTypeDialog(true);
    }
  }, [location]);

  const handleTypeSelect = (type: string) => {
    setActivityType(type);
    setShowTypeDialog(false);
  };

  const handleChangeType = () => {
    setShowTypeDialog(true);
  };

  const handleCancel = () => {
    navigate('/research');
  };

  const handleResearchSubmit = async (values: ResearchFormValues) => {
    try {
      console.log('Submitting research data:', values);
      
      // Convert form values to API format
      const researchData: {
        title: string;
        institute: string;
        authors: string;
        datePublished: string;
        startDate?: string;
        endDate?: string;
        journal?: string;
        citedAs?: string;
        doi?: string;
        publicationType: string;
        sdgs?: Array<{sdgNum: number, sdgDesc: string}>;
        supportingDocument?: string;
      } = {
        title: values.title,
        institute: values.institute,
        authors: values.authors,
        datePublished: values.datePublished,
        publicationType: values.publicationType
      };
      
      // Add optional fields if they exist
      if (values.startDate) researchData.startDate = values.startDate;
      if (values.endDate) researchData.endDate = values.endDate;
      if (values.journal) researchData.journal = values.journal;
      if (values.citedAs) researchData.citedAs = values.citedAs;
      if (values.doi) researchData.doi = values.doi;
      if (values.sdgs && values.sdgs.length > 0) researchData.sdgs = values.sdgs;
      
      // Handle file upload if there's a supporting document
      if (values.supportingDocument) {
        console.log('Uploading supporting document:', values.supportingDocument.name);
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', values.supportingDocument);
        // Upload the file first
        const fileResponse = await researchAPI.uploadSupportingDocument(formData);
        // Add the file ID to the research data
        researchData.supportingDocument = fileResponse.fileId;
      }
      
      // Call the API to create the research activity
      await researchAPI.create(researchData);
      
      alert('Research activity saved successfully!');
      navigate('/research');
    } catch (error: any) {
      console.error('Error saving research activity:', error);
      alert(`Failed to save research activity: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleBatchUpload = async (file: File) => {
    try {
      console.log(`Uploading research batch file:`, file.name);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the API to upload the batch file
      await researchAPI.createMultiple(formData);
      
      alert('Research activities uploaded successfully!');
      navigate('/research');
    } catch (error: any) {
      console.error('Error uploading batch file:', error);
      throw new Error(`Failed to upload batch file: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <Layout>
      {/* Activity Type Selection Dialog */}
      <ActivityTypeDialog
        open={showTypeDialog}
        onClose={() => navigate('/research')}
        onSelectType={handleTypeSelect}
      />
      
      {/* Single Entry Form */}
      {!isBatchUpload && activityType && (
        <ResearchForm
          onSubmit={handleResearchSubmit}
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

export default AddResearchActivityPage;
