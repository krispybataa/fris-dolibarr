import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import GetAppIcon from '@mui/icons-material/GetApp';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface BatchUploadFormProps {
  type: 'courses' | 'authorships';
  onSubmit: (file: File) => Promise<void>;
  onCancel: () => void;
  onChangeType: () => void;
}

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({ 
  type, 
  onSubmit, 
  onCancel, 
  onChangeType 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess(false);
    
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      
      // Check file type
      if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        setError('Please upload a CSV or Excel file');
        return;
      }
      
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await onSubmit(file);
      setSuccess(true);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // In a real implementation, this would download the template file
    // For now, we'll just alert
    alert(`Download ${type === 'courses' ? 'Courses and Sets' : 'Authorships'} template`);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center" color={FRIS_COLORS.burgundy}>
        Add Teaching Activity
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom align="center">
          {type === 'courses' ? 'Courses and Sets' : 'Authorships'} - Batch Upload
        </Typography>
        <Typography 
          variant="body2" 
          align="center" 
          color="primary" 
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onChangeType}
        >
          (Change Type)
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
          File uploaded successfully!
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" gutterBottom>
          Upload multiple {type === 'courses' ? 'courses' : 'authorships'} at once using a CSV or Excel file.
        </Typography>
        <Button
          startIcon={<GetAppIcon />}
          onClick={downloadTemplate}
          sx={{ mt: 1 }}
        >
          Download Template
        </Button>
      </Box>

      <Box
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          mb: 3,
          bgcolor: '#f9f9f9'
        }}
      >
        <input
          type="file"
          id="file-upload"
          hidden
          accept=".csv,.xlsx"
          onChange={handleFileChange}
        />
        
        {file ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DescriptionIcon sx={{ mr: 1, color: FRIS_COLORS.green }} />
            <Typography variant="body1" sx={{ mr: 2 }}>
              {file.name}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              size="small"
              htmlFor="file-upload"
            >
              Change File
            </Button>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 60, color: '#aaa', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and drop your file here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="outlined"
              component="label"
              htmlFor="file-upload"
              sx={{ mt: 1 }}
            >
              Browse Files
            </Button>
          </>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Accepted file formats: .csv, .xlsx (Max size: 5MB)
      </Typography>

      <Grid container spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
        <Grid item>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{ color: FRIS_COLORS.burgundy, borderColor: FRIS_COLORS.burgundy }}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!file || loading}
            sx={{ bgcolor: FRIS_COLORS.burgundy }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BatchUploadForm;
