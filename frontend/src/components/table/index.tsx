import { Box } from '@mui/material';
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
};

export function GenericTable<T extends { id: string | number }>({
  rows,
  columns,
  rowIdKey = 'id',
  onRowClick,
  paginationModel,
  onPaginationModelChange,
  loading = false,
}: GenericTableProps<T>) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: 'calc(100vh - 200px)', // Adjust based on your layout
        minHeight: 'calc(100vh - 200px)', // Adjust based on your layout
        overflow: 'scroll',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={row => row[rowIdKey] as string | number}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pagination
        loading={loading}
        autoHeight
        onRowClick={params => onRowClick?.(params.row)}
        sx={{
          backgroundColor: 'background.paper',
          maxHeight: 'calc(100vh - 200px)', // Adjust based on your layout
          minHeight: 'calc(100vh - 200px)', // Adjust based on your layout
        }}
      />
    </Box>
  );
}
