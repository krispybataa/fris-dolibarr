import React from 'react';
import { Container, Box } from '@mui/material';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: number;
  sx?: any;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  maxWidth = 'lg', 
  spacing = 4,
  sx = {}
}) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        ...sx
      }}
    >
      <Box sx={{ mb: spacing }}>
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveContainer;
