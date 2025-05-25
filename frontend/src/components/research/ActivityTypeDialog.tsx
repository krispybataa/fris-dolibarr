import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';

// FRIS colors
const FRIS_COLORS = {
  burgundy: '#8b1f41',
  green: '#006747',
  gold: '#f2c75c'
};

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
  const activityTypes = [
    {
      id: 'publications',
      title: 'Publications',
      description: 'Journal articles, conference papers, and other academic publications',
      icon: <ArticleIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    },
    {
      id: 'other-publications',
      title: 'Other Publications',
      description: 'Books, book chapters, and other non-journal publications',
      icon: <MenuBookIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'Research projects and grants',
      icon: <ScienceIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    },
    {
      id: 'conference',
      title: 'Conference Presentations',
      description: 'Presentations at academic conferences',
      icon: <SchoolIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    },
    {
      id: 'ip-claims',
      title: 'Intellectual Property Claims',
      description: 'Patents, trademarks, and other IP',
      icon: <WorkIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    },
    {
      id: 'dept-presentations',
      title: 'Department Presentations',
      description: 'Presentations within the university',
      icon: <BusinessIcon sx={{ fontSize: 40, color: FRIS_COLORS.burgundy }} />
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ bgcolor: FRIS_COLORS.burgundy, color: 'white', py: 2 }}>
        Select Research Activity Type
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {activityTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type.id}>
              <Card 
                elevation={3} 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' } 
                }}
              >
                <CardActionArea 
                  onClick={() => onSelectType(type.id)}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" component="div" gutterBottom>
                      {type.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivityTypeDialog;
