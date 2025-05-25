import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

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
interface ExtensionFormValues {
  position: string;
  office: string;
  startDate: Date | null;
  endDate: Date | null;
  number: string;
  extOfService: string;
  supportingDocument?: File | null;
}

// Interface for component props
interface ExtensionFormProps {
  onSubmit: (values: any) => void;
  onCancel: () => void;
  initialValues?: Partial<ExtensionFormValues>;
  defaultServiceType?: string;
}

const ExtensionForm: React.FC<ExtensionFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialValues,
  defaultServiceType = 'Service to UP'
}) => {
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>(typeof initialValues?.supportingDocument === 'string' ? initialValues?.supportingDocument : '');

  // Validation schema
  const validationSchema = Yup.object({
    position: Yup.string().required('Position is required'),
    office: Yup.string().required('Office is required'),
    startDate: Yup.date().required('Start date is required').nullable(),
    endDate: Yup.date().nullable().min(
      Yup.ref('startDate'),
      'End date must be after start date'
    ),
    number: Yup.string(),
    extOfService: Yup.string().required('Service type is required'),
  });

  // Initialize form with Formik
  const formik = useFormik<ExtensionFormValues>({
    initialValues: {
      position: initialValues?.position || '',
      office: initialValues?.office || '',
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : null,
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : null,
      number: initialValues?.number || '',
      extOfService: initialValues?.extOfService || defaultServiceType,
      supportingDocument: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add all form fields to FormData
        Object.keys(values).forEach((key) => {
          if (key !== 'supportingDocument') {
            const value = values[key as keyof ExtensionFormValues];
            if (value !== null && value !== undefined) {
              if (key === 'startDate' || key === 'endDate') {
                // Format dates as ISO strings for the API
                formData.append(key, value ? (value as Date).toISOString().split('T')[0] : '');
              } else {
                formData.append(key, value as string);
              }
            }
          }
        });
        
        // Add file if it exists
        if (values.supportingDocument) {
          formData.append('supportingDocument', values.supportingDocument);
        }
        
        // Call the onSubmit function passed as prop
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);
      formik.setFieldValue('supportingDocument', file);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Extension / Public Service Information
      </Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Position */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="position"
              name="position"
              label="Position"
              value={formik.values.position}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.position && Boolean(formik.errors.position)}
              helperText={formik.touched.position && formik.errors.position}
            />
          </Grid>

          {/* Office */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="office"
              name="office"
              label="Office"
              value={formik.values.office}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.office && Boolean(formik.errors.office)}
              helperText={formik.touched.office && formik.errors.office}
            />
          </Grid>

          {/* Number */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="number"
              name="number"
              label="Number (Optional)"
              value={formik.values.number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.number && Boolean(formik.errors.number)}
              helperText={formik.touched.number && formik.errors.number}
            />
          </Grid>

          {/* Start Date */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formik.values.startDate}
                onChange={(date: Date | null) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText: formik.touched.startDate && formik.errors.startDate as string,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* End Date */}
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date (Optional)"
                value={formik.values.endDate}
                onChange={(date: Date | null) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText: formik.touched.endDate && formik.errors.endDate as string,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Service Type */}
          <Grid item xs={12}>
            <FormControl 
              fullWidth
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
          </Grid>

          {/* Supporting Document */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Supporting Document (Optional)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ bgcolor: FRIS_COLORS.gold, color: '#000', '&:hover': { bgcolor: '#d4a93f' } }}
                disabled={fileUploading}
              >
                {fileUploading ? <CircularProgress size={24} /> : 'Upload File'}
                {/* Using setFileUploading when needed for file upload progress */}
                <VisuallyHiddenInput 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </Button>
              {fileName && (
                <Typography variant="body2" color="text.secondary">
                  {fileName}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={onCancel}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              sx={{ bgcolor: FRIS_COLORS.burgundy }}
            >
              {formik.isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ExtensionForm;
