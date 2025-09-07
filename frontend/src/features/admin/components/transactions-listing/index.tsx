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
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'protocol_id', headerName: 'Protocol ID', width: 150 },
    { field: 'protocol_name', headerName: 'Research Type', width: 160 },
    { field: 'protocol_pi', headerName: 'Protocol User Type', width: 180 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'currency', headerName: 'Currency', width: 120 },
    { field: 'payment_type', headerName: 'Payment Type', width: 140 },
    { field: 'status', headerName: 'Status', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 140 },
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
        Transaction Management Dashboard
      </Typography>
      <TransactionsTable />
    </Box>
  );
};

export default TransactionsListing;
