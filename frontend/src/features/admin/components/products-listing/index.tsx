import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import { useGetProductListing } from '../../hooks/useGetProductListing';
import type { IProduct } from '../../admin.interface';
import { get } from 'lodash';
import ModernSwitch from '../../../../components/switch';
import EditIcon from '@mui/icons-material/Edit';

// ✅ Define product columns
const columns: GridColDef<IProduct>[] = [
  // { field: 'id', headerName: 'ID', width: 80 },
  { field: 'product_name', headerName: 'Product Name', flex: 1 },
  { field: 'product_description', headerName: 'Description', flex: 2 },
  { field: 'product_amount', headerName: 'Amount', width: 120 },
  {
    field: 'status',
    headerName: 'Status',
    width: 150,
    renderCell: params => {
      const isActive = params.row.status === 1;

      return (
        <Box display="flex" alignItems="center" height="100%">
          <ModernSwitch
            checked={isActive}
            onChange={() => {
              console.log(
                `Toggled status for product ${params.row.id} → ${!isActive ? 1 : 0}`
              );
            }}
          />
        </Box>
      );
    },
  },
  { field: 'created_date', headerName: 'Created At', flex: 1 },
  { field: 'updated_date', headerName: 'Updated At', flex: 1 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 150,
    sortable: false,
    filterable: false,
    renderCell: params => {
      return (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
            }}
            onClick={() => {
              console.log(`Edit product ${params.row.id}`);
            }}
          >
            <EditIcon
              fontSize="small"
              sx={{ mr: 0.5, verticalAlign: 'middle' }}
            />{' '}
            Edit
          </Typography>
        </Box>
      );
    },
  },
];

function ProductsTable() {
  const { data, isLoading } = useGetProductListing();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  return (
    <GenericTable
      rows={get(data, 'data', []) as IProduct[]}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      loading={isLoading}
    />
  );
}

const ProductsListing = () => {
  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      gap={1}
    >
      <Typography variant="h6" sx={{ padding: 0 }}>
        Product Management Dashboard
      </Typography>
      <ProductsTable />
    </Box>
  );
};

export default ProductsListing;
