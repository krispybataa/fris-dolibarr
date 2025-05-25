import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';
import ScienceIcon from '@mui/icons-material/Science';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

// Extension service types with icons
const SERVICE_TYPES = [
  {
    id: 'service-to-up',
    name: 'Service to UP',
    description: 'Service provided to the University of the Philippines',
    icon: <SchoolIcon sx={{ color: FRIS_COLORS.burgundy }} />
  },
  {
    id: 'other-service-to-up',
    name: 'Other Service to UP',
    description: 'Additional services provided to the University of the Philippines',
    icon: <BusinessIcon sx={{ color: FRIS_COLORS.burgundy }} />
  },
  {
    id: 'service-to-profession',
    name: 'Service to the Profession',
    description: 'Service provided to professional organizations and communities',
    icon: <WorkIcon sx={{ color: FRIS_COLORS.burgundy }} />
  },
  {
    id: 'service-to-nation',
    name: 'Service to the Nation',
    description: 'Service provided to national organizations, government, or the public',
    icon: <PublicIcon sx={{ color: FRIS_COLORS.burgundy }} />
  },
  {
    id: 'service-to-science-education',
    name: 'Service to Science Education',
    description: 'Service provided to science education initiatives and organizations',
    icon: <ScienceIcon sx={{ color: FRIS_COLORS.burgundy }} />
  }
];

interface ActivityTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
}

const ActivityTypeDialog: React.FC<ActivityTypeDialogProps> = ({ 
  open, 
  onClose, 
  onSelectType 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PublicIcon sx={{ mr: 1, color: FRIS_COLORS.burgundy }} />
          <Typography variant="h6">Select Extension Activity Type</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please select the type of extension or public service activity you would like to add:
        </Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {SERVICE_TYPES.map((type, index) => (
            <React.Fragment key={type.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem disablePadding>
                <ListItemButton onClick={() => onSelectType(type.id)}>
                  <ListItemIcon>
                    {type.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={type.name} 
                    secondary={type.description}
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: FRIS_COLORS.burgundy }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityTypeDialog;
