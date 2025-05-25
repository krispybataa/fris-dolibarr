import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  backgroundImage?: string;
  height?: string | number;
  showBackButton?: boolean;
  backPath?: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  backgroundImage = '/assets/oblation.jpg', 
  height = '250px',
  showBackButton = true,
  backPath = '/',
  icon
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(backPath);
  };

  return (
    <Box 
      sx={{ 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: height,
        display: 'flex',
        alignItems: 'flex-end',
        mb: 4,
        position: 'relative'
      }}
    >
      {showBackButton && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 20,
            left: 20,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': { opacity: 0.8 }
          }}
          onClick={handleGoBack}
        >
          <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="body1">Go Back</Typography>
        </Box>
      )}
      <Box 
        sx={{ 
          width: '100%', 
          p: 3, 
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && <Box sx={{ mr: 2, color: 'white' }}>{icon}</Box>}
          <Typography variant="h2" component="h1" gutterBottom color="white">
            {title}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;
