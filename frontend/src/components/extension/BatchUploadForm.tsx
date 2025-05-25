import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import * as Yup from 'yup';
import { useFormik } from 'formik';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Styled components for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Extension service types
const SERVICE_TYPES = [
  'Service to UP',
  'Other Service to UP',
  'Service to the Profession',
  'Service to the Nation',
  'Service to Science Education'
];

// Interface for form values
interface BatchUploadFormValues {
  file: File | null;
  extOfService: string;
}

// Interface for component props
interface BatchUploadFormProps {
  onSubmit: (values: FormData) => Promise<void>;
  onCancel: () => void;
  defaultServiceType?: string;
}

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({ 
  onSubmit, 
  onCancel,
  defaultServiceType = 'Service to UP'
}) => {
  const [uploadError, setUploadError] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Validation schema
  const validationSchema = Yup.object({
    file: Yup.mixed()
      .required('Please upload a file')
      .test(
        'fileFormat',
        'Unsupported file format. Please upload a CSV or Excel file',
        (value) => {
          if (!value) return false;
          const file = value as File;
          const validExtensions = ['csv', 'xlsx', 'xls'];
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
          return validExtensions.includes(fileExtension);
        }
      ),
    extOfService: Yup.string().required('Service type is required'),
  });

  // Initialize form with Formik
  const formik = useFormik<BatchUploadFormValues>({
    initialValues: {
      file: null,
      extOfService: defaultServiceType,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setUploadError('');
        
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add file to FormData
        if (values.file) {
          formData.append('file', values.file);
        }
        
        // Add service type to FormData
        formData.append('extOfService', values.extOfService);
        
        // Call the onSubmit function passed as prop
        await onSubmit(formData);
      } catch (error: any) {
        console.error('Error uploading file:', error);
        setUploadError(error.message || 'Failed to upload file. Please try again.');
      }
    },
  });

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      formik.setFieldValue('file', file);
    }
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    // This would typically download a template file from the server
    // For now, we'll just log this action
    console.log('Download template clicked');
    // In a real implementation, you would use a link to the template file on the server
    // window.open('/templates/extension_template.xlsx', '_blank');
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Batch Upload Extension Activities
      </Typography>
      
      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError('')}>
          {uploadError}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" paragraph>
          Upload multiple extension activities at once using a CSV or Excel file. Please ensure your file follows the required format.
        </Typography>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
          sx={{ color: FRIS_COLORS.burgundy }}
        >
          Download Template
        </Button>
      </Box>
      
      <form onSubmit={formik.handleSubmit}>
        {/* Service Type */}
        <FormControl 
          fullWidth
          sx={{ mb: 3 }}
          error={formik.touched.extOfService && Boolean(formik.errors.extOfService)}
        >
          <InputLabel id="service-type-label">Service Type</InputLabel>
          <Select
            labelId="service-type-label"
            id="extOfService"
            name="extOfService"
            value={formik.values.extOfService}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            label="Service Type"
          >
            {SERVICE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.extOfService && formik.errors.extOfService && (
            <FormHelperText>{formik.errors.extOfService}</FormHelperText>
          )}
        </FormControl>
        
        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload File
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ bgcolor: FRIS_COLORS.gold, color: '#000', '&:hover': { bgcolor: '#d4a93f' } }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Select File'}
              <VisuallyHiddenInput 
                type="file" 
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
              />
            </Button>
            {fileName && (
              <Typography variant="body2" color="text.secondary">
                {fileName}
              </Typography>
            )}
          </Box>
          {formik.touched.file && formik.errors.file && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {formik.errors.file as string}
            </Typography>
          )}
        </Box>
        
        {/* Instructions */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Instructions:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Use the template file for the correct format</li>
            <li>Required columns: Position, Office, Start Date, Service Type</li>
            <li>Date format should be YYYY-MM-DD</li>
            <li>Maximum file size: 5MB</li>
            <li>Maximum 100 records per upload</li>
          </Typography>
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            onClick={onCancel}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid || !formik.values.file}
            sx={{ bgcolor: FRIS_COLORS.burgundy }}
          >
            {formik.isSubmitting ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default BatchUploadForm;
