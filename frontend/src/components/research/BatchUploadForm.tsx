import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArticleIcon from '@mui/icons-material/Article';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface BatchUploadFormProps {
  type: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Check if file is CSV or Excel
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a CSV or Excel file');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onSubmit(selectedFile);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <ArticleIcon sx={{ color: FRIS_COLORS.burgundy, mr: 2, fontSize: 30 }} />
          <Typography variant="h5" component="h1">
            Batch Upload Research Publications
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            File uploaded successfully!
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            Upload a CSV or Excel file containing multiple research publications. 
            The file should have the following columns:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>title (required)</li>
            <li>institute (required)</li>
            <li>authors (required, comma-separated)</li>
            <li>datePublished (required, YYYY-MM-DD format)</li>
            <li>publicationType (required)</li>
            <li>journal (for journal articles)</li>
            <li>doi</li>
            <li>citedAs</li>
            <li>startDate (YYYY-MM-DD format)</li>
            <li>endDate (YYYY-MM-DD format)</li>
            <li>sdgs (format: "1: No Poverty, 2: Zero Hunger")</li>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <input
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: 'none' }}
            id="batch-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="batch-file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ 
                color: FRIS_COLORS.burgundy, 
                borderColor: FRIS_COLORS.burgundy,
                mb: 2
              }}
            >
              Select File
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body2">
              Selected file: {selectedFile.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="outlined"
              onClick={onChangeType}
              disabled={loading}
              sx={{ 
                color: FRIS_COLORS.green, 
                borderColor: FRIS_COLORS.green
              }}
            >
              Change Type
            </Button>
          </Box>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedFile || loading}
            sx={{ bgcolor: FRIS_COLORS.burgundy }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Upload'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BatchUploadForm;
