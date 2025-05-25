import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';

// Define our own FieldProps interface instead of importing it
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
import * as Yup from 'yup';
import {
  Box,
  Button,
  Paper,
  MenuItem,
  TextField,
  Typography,
  InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';



interface CourseFormProps {
  initialValues?: any;
  onSubmit: (values: any, file: File | null) => void;
  submitButtonText?: string;
  onCancel?: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialValues = {
    academicYear: '',
    term: '',
    courseNum: '',
    section: '',
    courseDesc: '',
    courseType: '',
    percentContribution: '',
    loadCreditUnits: '',
    partOneStudent: '',
    partTwoCourse: '',
    partThreeTeaching: ''
  },
  onSubmit,
  submitButtonText = 'Submit',
  onCancel = () => window.history.back()
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const validationSchema = Yup.object().shape({
    academicYear: Yup.string().required('Academic Year is required'),
    term: Yup.string().required('Term is required'),
    courseNum: Yup.string().required('Course Number is required'),
    section: Yup.string().required('Section is required'),
    courseDesc: Yup.string().required('Course Description is required'),
    courseType: Yup.string().required('Course Type is required'),
    percentContribution: Yup.number()
      .typeError('Percent Contribution must be a number')
      .required('Percent Contribution is required')
      .min(0, 'Percent Contribution must be at least 0')
      .max(100, 'Percent Contribution must be at most 100'),
    loadCreditUnits: Yup.number()
      .typeError('Load Credit Units must be a number')
      .required('Load Credit Units is required')
      .min(0, 'Load Credit Units must be at least 0'),
    partOneStudent: Yup.number()
      .typeError('Part 1 Student must be a number')
      .required('Part 1 Student is required')
      .min(0, 'Part 1 Student must be at least 0')
      .max(5, 'Part 1 Student must be at most 5'),
    partTwoCourse: Yup.number()
      .typeError('Part 2 Course must be a number')
      .required('Part 2 Course is required')
      .min(0, 'Part 2 Course must be at least 0')
      .max(5, 'Part 2 Course must be at most 5'),
    partThreeTeaching: Yup.number()
      .typeError('Part 3 Teaching must be a number')
      .required('Part 3 Teaching is required')
      .min(0, 'Part 3 Teaching must be at least 0')
      .max(5, 'Part 3 Teaching must be at most 5'),
  });

  const handleSubmit = (values: any) => {
    onSubmit(values, file);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Course Information
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="academicYear">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Academic Year"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="term">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Term"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    >
                      <MenuItem value="First">First</MenuItem>
                      <MenuItem value="Second">Second</MenuItem>
                      <MenuItem value="Summer">Summer</MenuItem>
                    </TextField>
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="courseNum">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Course Number"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="section">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Section"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: 'span 12' }}>
                <Field name="courseDesc">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Course Description"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="courseType">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      select
                      label="Course Type"
                      variant="outlined"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    >
                      <MenuItem value="Lecture">Lecture</MenuItem>
                      <MenuItem value="Laboratory">Laboratory</MenuItem>
                      <MenuItem value="Lecture and Laboratory">Lecture and Laboratory</MenuItem>
                    </TextField>
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="percentContribution">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Percent Contribution"
                      variant="outlined"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="loadCreditUnits">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Load Credit Units"
                      variant="outlined"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="partOneStudent">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Part 1 Student (0-5)"
                      variant="outlined"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="partTwoCourse">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Part 2 Course (0-5)"
                      variant="outlined"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <Field name="partThreeTeaching">
                  {({ field, meta }: CustomFieldProps) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Part 3 Teaching (0-5)"
                      variant="outlined"
                      type="number"
                      error={meta.touched && Boolean(meta.error)}
                      helperText={meta.touched && meta.error}
                    />
                  )}
                </Field>
              </Box>
              
              <Box sx={{ gridColumn: 'span 12' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Supporting Document
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span">
                      Upload
                    </Button>
                  </label>
                </Box>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {file.name}
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ gridColumn: 'span 12', mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
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

export default CourseForm;
