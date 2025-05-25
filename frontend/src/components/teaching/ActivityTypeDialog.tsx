import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  Grid
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

interface ActivityTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'courses' | 'authorships') => void;
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
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', color: FRIS_COLORS.burgundy }}>
        Add Teaching Activity
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2 }}>
          Select Activity Type
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onSelectType('courses')}
              sx={{
                p: 2,
                borderColor: FRIS_COLORS.green,
                color: FRIS_COLORS.green,
                '&:hover': {
                  borderColor: FRIS_COLORS.green,
                  backgroundColor: `${FRIS_COLORS.green}10`
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1">Courses and Sets</Typography>
            </Button>
          </Grid>
          
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => onSelectType('authorships')}
              sx={{
                p: 2,
                borderColor: FRIS_COLORS.burgundy,
                color: FRIS_COLORS.burgundy,
                '&:hover': {
                  borderColor: FRIS_COLORS.burgundy,
                  backgroundColor: `${FRIS_COLORS.burgundy}10`
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <MenuBookIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1">Authorships</Typography>
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityTypeDialog;
