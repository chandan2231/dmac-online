import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import CustomLoader from '../../../../components/loader';
import { useGetTransactionsListing } from '../../hooks/useGetTransactionsListing';
import type { ITransaction, TransactionFilter } from '../../admin.interface';
import { get } from 'lodash';

function TransactionsTable() {
  const [filter] = useState<TransactionFilter>('');
  const { data, isLoading } = useGetTransactionsListing(filter);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const columns: GridColDef<ITransaction>[] = [
    { field: 'name', headerName: 'User Name', flex: 1 },
    { field: 'email', headerName: 'User Email', flex: 1 },
    { field: 'product_name', headerName: 'Product Name', flex: 1 },
    { field: 'product_description', headerName: 'Product Description', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'currency', headerName: 'Currency', flex: 1 },
    { field: 'payment_type', headerName: 'Payment Type', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'created_date', headerName: 'Created Date', flex: 1 },
  ];

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <GenericTable
      rows={get(data, 'data', []) as ITransaction[]}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      loading={isLoading}
    />
  );
}

const TransactionsListing = () => {
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
        Users Transaction List
      </Typography>
      <TransactionsTable />
    </Box>
  );
};

export default TransactionsListing;
