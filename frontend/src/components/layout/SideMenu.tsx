import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Box, Typography, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
// import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../../../src/contexts/AuthContext';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

const SideMenu = ({ open, onClose }: SideMenuProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="h6" color="primary">
            Welcome!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role || 'Faculty'}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/records')}>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="Records" />
            </ListItemButton>
          </ListItem>
          
          {(user?.role === 'admin' || user?.isDepartmentHead || user?.isDean) && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/publication-approval')}>
                <ListItemIcon>
                  <AssignmentTurnedInIcon />
                </ListItemIcon>
                <ListItemText primary="Publication Approval" />
              </ListItemButton>
            </ListItem>
          )}
          
          {/* {user?.role === 'admin' || user?.isDepartmentHead || user?.isDean ? (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/approving-dashboard')}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Approving Dashboard" />
              </ListItemButton>
            </ListItem>
          ) : null} */}
          
          {user?.role === 'admin' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/users')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button 
            variant="contained" 
            fullWidth 
            startIcon={<LogoutIcon />} 
            onClick={handleLogout}
            sx={{ 
              bgcolor: FRIS_COLORS.green,
              '&:hover': {
                bgcolor: '#004d34'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideMenu;
