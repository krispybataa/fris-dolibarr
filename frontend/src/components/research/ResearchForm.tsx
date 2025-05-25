import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Paper,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Chip,
  Grid
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';

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

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface ResearchFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  submitButtonText?: string;
  onCancel?: () => void;
}

const ResearchForm: React.FC<ResearchFormProps> = ({
  initialValues = {
    title: '',
    institute: '',
    authors: '',
    datePublished: '',
    startDate: '',
    endDate: '',
    journal: '',
    citedAs: '',
    doi: '',
    publicationType: '',
    sdgs: []
  },
  onSubmit,
  submitButtonText = 'Save',
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sdgInput, setSdgInput] = useState('');
  const [sdgList, setSdgList] = useState<Array<{sdgNum: number, sdgDesc: string}>>([]);

  // Publication types
  const publicationTypes = [
    'Journal Article',
    'Conference Paper',
    'Book Chapter',
    'Book',
    'Technical Report',
    'Patent',
    'Thesis',
    'Other'
  ];

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    institute: Yup.string().required('Institute is required'),
    authors: Yup.string().required('Authors are required'),
    datePublished: Yup.date().required('Date published is required'),
    publicationType: Yup.string().required('Publication type is required'),
    doi: Yup.string().test({
      name: 'conditionalRequired',
      test: function(value, context) {
        const { publicationType } = context.parent;
        if (['Journal Article', 'Conference Paper'].includes(publicationType) && !value) {
          return context.createError({ message: 'DOI is required for this publication type' });
        }
        return true;
      }
    }),
    journal: Yup.string().test({
      name: 'conditionalRequired',
      test: function(value, context) {
        const { publicationType } = context.parent;
        if (publicationType === 'Journal Article' && !value) {
          return context.createError({ message: 'Journal name is required for journal articles' });
        }
        return true;
      }
    })
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddSDG = (_values: any, setFieldValue: any) => {
    if (!sdgInput) return;
    
    const [sdgNum, ...sdgDescParts] = sdgInput.split(':');
    const sdgDesc = sdgDescParts.join(':').trim();
    
    if (!sdgNum || !sdgDesc) {
      alert('Please enter SDG in format "Number: Description"');
      return;
    }
    
    const newSDG = {
      sdgNum: parseInt(sdgNum.trim()),
      sdgDesc
    };
    
    const updatedSDGs = [...sdgList, newSDG];
    setSdgList(updatedSDGs);
    setFieldValue('sdgs', updatedSDGs);
    setSdgInput('');
  };

  const handleRemoveSDG = (index: number, setFieldValue: any) => {
    const updatedSDGs = sdgList.filter((_, i) => i !== index);
    setSdgList(updatedSDGs);
    setFieldValue('sdgs', updatedSDGs);
  };

  const handleFormSubmit = (values: any) => {
    // Include the file in the submission
    const formValues = {
      ...values,
      supportingDocument: selectedFile
    };
    
    onSubmit(formValues);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ArticleIcon sx={{ color: FRIS_COLORS.burgundy, mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h1">
            Add Research Publication
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                {/* Title */}
                <Grid item xs={12}>
                  <Field name="title">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="Title"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon sx={{ color: FRIS_COLORS.burgundy }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Publication Type */}
                <Grid item xs={12} sm={6}>
                  <Field name="publicationType">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        select
                        label="Publication Type"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      >
                        {publicationTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Field>
                </Grid>

                {/* Institute */}
                <Grid item xs={12} sm={6}>
                  <Field name="institute">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="Institute"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: FRIS_COLORS.burgundy }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Authors */}
                <Grid item xs={12}>
                  <Field name="authors">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="Authors (comma separated)"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PeopleIcon sx={{ color: FRIS_COLORS.burgundy }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Date Published */}
                <Grid item xs={12} sm={6}>
                  <Field name="datePublished">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="Date Published"
                        type="date"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon sx={{ color: FRIS_COLORS.burgundy }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Journal (conditional) */}
                {values.publicationType === 'Journal Article' && (
                  <Grid item xs={12} sm={6}>
                    <Field name="journal">
                      {({ field, meta }: CustomFieldProps) => (
                        <TextField
                          {...field}
                          label="Journal"
                          variant="outlined"
                          fullWidth
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                  </Grid>
                )}

                {/* DOI */}
                <Grid item xs={12} sm={6}>
                  <Field name="doi">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="DOI"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon sx={{ color: FRIS_COLORS.burgundy }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Cited As */}
                <Grid item xs={12} sm={6}>
                  <Field name="citedAs">
                    {({ field, meta }: CustomFieldProps) => (
                      <TextField
                        {...field}
                        label="Cited As"
                        variant="outlined"
                        fullWidth
                        error={meta.touched && Boolean(meta.error)}
                        helperText={meta.touched && meta.error}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Start Date (for projects) */}
                {values.publicationType === 'Technical Report' && (
                  <Grid item xs={12} sm={6}>
                    <Field name="startDate">
                      {({ field, meta }: CustomFieldProps) => (
                        <TextField
                          {...field}
                          label="Start Date"
                          type="date"
                          variant="outlined"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                  </Grid>
                )}

                {/* End Date (for projects) */}
                {values.publicationType === 'Technical Report' && (
                  <Grid item xs={12} sm={6}>
                    <Field name="endDate">
                      {({ field, meta }: CustomFieldProps) => (
                        <TextField
                          {...field}
                          label="End Date"
                          type="date"
                          variant="outlined"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          error={meta.touched && Boolean(meta.error)}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                  </Grid>
                )}

                {/* SDG Input */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Sustainable Development Goals (SDGs)
                  </Typography>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      label="Add SDG (format: Number: Description)"
                      variant="outlined"
                      fullWidth
                      value={sdgInput}
                      onChange={(e) => setSdgInput(e.target.value)}
                      sx={{ mr: 2 }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={() => handleAddSDG(values, setFieldValue)}
                      sx={{ bgcolor: FRIS_COLORS.burgundy }}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {sdgList.map((sdg, index) => (
                      <Chip
                        key={index}
                        label={`SDG ${sdg.sdgNum}: ${sdg.sdgDesc}`}
                        onDelete={() => handleRemoveSDG(index, setFieldValue)}
                        sx={{ 
                          bgcolor: `${FRIS_COLORS.gold}20`,
                          color: '#a87900',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Supporting Document */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Supporting Document
                  </Typography>
                  <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="supporting-document"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="supporting-document">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ 
                        color: FRIS_COLORS.burgundy, 
                        borderColor: FRIS_COLORS.burgundy,
                        mr: 2
                      }}
                    >
                      Upload Document
                    </Button>
                  </label>
                  {selectedFile && (
                    <Typography variant="body2" component="span">
                      {selectedFile.name}
                    </Typography>
                  )}
                </Grid>

                {/* Buttons */}
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  {onCancel && (
                    <Button
                      variant="outlined"
                      onClick={onCancel}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: FRIS_COLORS.burgundy }}
                  >
                    {submitButtonText}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default ResearchForm;
