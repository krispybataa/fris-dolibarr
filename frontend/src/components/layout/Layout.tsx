import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ 
      margin: 0,
      display: 'flex', 
      flexDirection: 'column', 
      placeItems: 'stretch',
      minWidth: '100px',
      minHeight: '100vh', 
      width: '100%',
      overflow: 'hidden' // Prevent any horizontal overflow
    }}>
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          // Removed justifyContent: 'center' to fix spacing issues
          overflow: 'hidden' // Prevent any horizontal overflow
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: '100%', // Allow content to use full width
            boxSizing: 'border-box',
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
            display: 'block' // Ensure block display instead of flex
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
