import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
  useTheme
} from '@mui/material';
import { FRIS_COLORS } from '../../theme';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  pagination = true,
  rowsPerPageOptions = [10, 25, 50],
  onRowClick
}) => {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const displayedData = pagination 
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : data;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        p: 4,
        backgroundColor: FRIS_COLORS.paleBlue,
        borderRadius: 2,
        height: 200
      }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ 
                    minWidth: column.minWidth,
                    backgroundColor: FRIS_COLORS.deepBlue,
                    color: FRIS_COLORS.white,
                    fontWeight: 600
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedData.map((row, index) => {
              return (
                <TableRow 
                  hover 
                  role="checkbox" 
                  tabIndex={-1} 
                  key={index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:nth-of-type(odd)': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default DataTable;
