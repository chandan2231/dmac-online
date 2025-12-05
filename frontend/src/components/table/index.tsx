import { Box, useMediaQuery, useTheme } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from '@mui/x-data-grid';

type GenericTableProps<T> = {
  rows: T[];
  columns: GridColDef[];
  pageSize?: number;
  rowIdKey?: keyof T;
  onRowClick?: (row: T) => void;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  loading?: boolean;
  maxHeight?: string;
  minHeight?: string;
};

export function GenericTable<T extends { id: string | number }>({
  rows,
  columns,
  rowIdKey = 'id',
  onRowClick,
  paginationModel,
  onPaginationModelChange,
  loading = false,
  maxHeight = 'calc(100vh - 200px)',
  minHeight = 'calc(100vh - 200px)',
}: GenericTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const updatedCols = isMobile
    ? columns.map(col => ({ ...col, width: 200, maxWidth: 200, minWidth: 200 }))
    : columns;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: maxHeight, // Adjust based on your layout
        minHeight: minHeight, // Adjust based on your layout
        overflow: 'scroll',
      }}
    >
      <DataGrid
        rows={rows}
        columns={updatedCols}
        getRowId={row => row[rowIdKey] as string | number}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pagination
        loading={loading}
        disableRowSelectionOnClick
        onRowClick={params => onRowClick?.(params.row)}
        sx={{
          backgroundColor: 'background.paper',
          maxHeight: maxHeight, // Adjust based on your layout
          minHeight: minHeight, // Adjust based on your layout
          '.MuiDataGrid-columnHeaderTitle': {
            color: '#000000',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#eee',
          },
        }}
      />
    </Box>
  );
}
