import React from 'react';
import { Card, CardContent, Typography, Box, CardActionArea } from '@mui/material';
import { FRIS_COLORS } from '../../theme';

interface CardWithIconProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  height?: number | string;
}

const CardWithIcon: React.FC<CardWithIconProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled = false,
  height = 200
}) => {
  const cardContent = (
    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', p: 3 }}>
      <Box sx={{ 
        color: FRIS_COLORS.deepBlue, 
        fontSize: '3rem', 
        mb: 2,
        display: 'flex',
        justifyContent: 'center',
        '& svg': {
          fontSize: '3rem',
        }
      }}>
        {icon}
      </Box>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </CardContent>
  );

  return (
    <Card 
      sx={{ 
        height: height, 
        display: 'flex', 
        flexDirection: 'column',
        opacity: disabled ? 0.7 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick && !disabled ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        } : {}
      }}
    >
      {onClick && !disabled ? (
        <CardActionArea sx={{ height: '100%' }} onClick={onClick}>
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
};

export default CardWithIcon;
