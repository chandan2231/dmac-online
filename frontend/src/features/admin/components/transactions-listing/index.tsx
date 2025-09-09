import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import CustomLoader from '../../../../components/loader';
import { useGetTransactionsListing } from '../../hooks/useGetTransactionsListing';
import type { ITransaction, TransactionFilter } from '../../admin.interface';
import { get } from 'lodash';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';

function TransactionsTable() {
  const [filter] = useState<TransactionFilter>('');
  const { data, isLoading } = useGetTransactionsListing(filter);

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = useState<ITransaction | null>(
    null
  );

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<ITransaction | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    transaction: ITransaction
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuTransaction(transaction);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTransaction(null);
  };

  const handleOpenViewModal = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedTransaction(null);
    setIsViewModalOpen(false);
  };

  const columns: GridColDef<ITransaction>[] = [
    { field: 'name', headerName: 'User Name', flex: 1 },
    { field: 'email', headerName: 'User Email', flex: 1 },
    { field: 'product_name', headerName: 'Product Name', flex: 1 },
    {
      field: 'product_description',
      headerName: 'Product Description',
      flex: 1,
    },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'currency', headerName: 'Currency', flex: 1 },
    { field: 'payment_type', headerName: 'Payment Type', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'created_date', headerName: 'Created Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <>
          <IconButton onClick={e => handleMenuClick(e, params.row)}>
            <MoreVertIcon />
          </IconButton>
        </>
      ),
    },
  ];

  if (isLoading) {
    return <CustomLoader />;
  }

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as ITransaction[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* Row Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuTransaction) handleOpenViewModal(menuTransaction);
            handleMenuClose();
          }}
        >
          View Details
        </MenuItem>
      </Menu>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={`Transaction Details${
          selectedTransaction
            ? ` - ${get(selectedTransaction, 'product_name') || ''}`
            : ''
        }`}
        hideCancelButton
        maxWidth="md"
      >
        {selectedTransaction && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <ModernInput
                label="User Name"
                value={selectedTransaction.name}
                fullWidth
                disabled
              />
              <ModernInput
                label="User Email"
                value={selectedTransaction.email}
                fullWidth
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Product Name"
                value={get(selectedTransaction, 'product_name') || ''}
                fullWidth
                disabled
              />
              <ModernInput
                label="Product Description"
                value={get(selectedTransaction, 'product_description') || ''}
                fullWidth
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Amount"
                value={selectedTransaction.amount.toString()}
                fullWidth
                disabled
              />
              <ModernInput
                label="Currency"
                value={selectedTransaction.currency}
                fullWidth
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Payment Type"
                value={selectedTransaction.payment_type}
                fullWidth
                disabled
              />
              <ModernInput
                label="Status"
                value={selectedTransaction.status}
                fullWidth
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Created Date"
                value={selectedTransaction.created_date}
                fullWidth
                disabled
              />
              <Box width="100%"></Box>
            </Box>
          </Box>
        )}
      </GenericModal>
    </>
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
