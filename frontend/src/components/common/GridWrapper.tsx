import { Grid } from '@mui/material';
import type { GridProps } from '@mui/material';

// Create a wrapper component for Grid to fix TypeScript issues with Material UI v7
// The 'component' prop is required in v7 when using Grid with 'item' or 'container'
export const GridContainer = (props: GridProps) => {
  return <Grid component="div" container {...props} />;
};

export const GridItem = (props: GridProps) => {
  return <Grid component="div" item {...props} />;
};
