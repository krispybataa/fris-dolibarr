import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Define a custom field props interface for our components
interface CustomFieldProps {
  field: {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
  };
  meta: {
    touched: boolean;
    error?: string;
  };
}

export interface AuthorshipFormValues {
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

export interface AuthorshipFormProps {
  initialValues?: AuthorshipFormValues;
  onSubmit: (values: AuthorshipFormValues) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

const defaultValues: AuthorshipFormValues = {
  title: '',
  authors: '',
  date: '',
  upCourse: '',
  recommendingUnit: '',
  publisher: '',
  authorshipType: '',
  numberOfAuthors: '1',
  supportingDocument: null
};

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  authors: Yup.string().required('Authors is required'),
  date: Yup.string().required('Date is required'),
  recommendingUnit: Yup.string().required('Recommending Unit is required'),
  publisher: Yup.string().required('Publisher is required'),
  authorshipType: Yup.string().required('Authorship Type is required'),
  numberOfAuthors: Yup.number()
    .typeError('Number of Authors must be a number')
    .min(1, 'Number of Authors must be at least 1')
    .required('Number of Authors is required')
});

const AuthorshipForm: React.FC<AuthorshipFormProps> = ({ initialValues, onSubmit, onCancel, submitButtonText = 'Save Authorship' }) => {
  const [file, setFile] = useState<File | null>(null);

  const formInitialValues = initialValues || defaultValues;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFieldValue('supportingDocument', selectedFile);
    }
  };

  const handleSubmit = (values: AuthorshipFormValues) => {
    onSubmit(values);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Authorship Information
      </Typography>

      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
              {/* Title */}
              <Box sx={{ gridColumn: 'span 12' }}>
                <Field name="title">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Title *"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MenuBookIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>
              </Box>

              {/* Authors */}
              <Box sx={{ gridColumn: 'span 12' }}>
                <Field name="authors">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Author/s *"
                      placeholder="e.g., Dela Cruz, J., Santos, M"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>
              </Box>

              {/* Date */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="date">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Date *"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>
              </Box>

              {/* UP Course */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="upCourse">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="UP Course *"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>

              {/* Recommending Unit */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="recommendingUnit">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Recommending Unit *"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>

              {/* Publisher */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="publisher">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Publisher *"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>

              {/* Authorship Type */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="authorshipType">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Authorship Type *"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>

              {/* Number of Authors */}
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="numberOfAuthors">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Number of Authors *"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>

              {/* Supporting Document */}
              <Box sx={{ gridColumn: 'span 12' }}>
                <Typography variant="body2" gutterBottom>
                  Supporting Document
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {file ? file.name : 'No file chosen'}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileChange(e, setFieldValue)}
                    />
                  </Button>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ gridColumn: 'span 12', mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  sx={{ color: FRIS_COLORS.burgundy, borderColor: FRIS_COLORS.burgundy }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 1 }}>
                  {submitButtonText}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default AuthorshipForm;
