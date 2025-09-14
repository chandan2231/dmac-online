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
      {/* View Modal */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={`Transaction Details${
          selectedTransaction
            ? ` - ${get(selectedTransaction, 'product_name', '')}`
            : ''
        }`}
        hideCancelButton
        maxWidth="md"
      >
        {selectedTransaction && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              flexDirection="row"
              p={2}
              border="1px solid #e0e0e0"
              borderRadius="8px"
              bgcolor="#fafafa"
              width="100%"
              flexWrap="wrap"
              rowGap={1}
            >
              {/* User Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  User Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'name', '')}
                </Typography>
              </Box>

              {/* User Email */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  User Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'email', '')}
                </Typography>
              </Box>

              {/* Product Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Product Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'product_name', '')}
                </Typography>
              </Box>

              {/* Product Description */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Product Description:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'product_description', '')}
                </Typography>
              </Box>

              {/* Amount */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Amount:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'amount', '')}
                </Typography>
              </Box>

              {/* Currency */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Currency:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'currency', '')}
                </Typography>
              </Box>

              {/* Payment Type */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Payment Type:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'payment_type', '')}
                </Typography>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'status', '')}
                </Typography>
              </Box>

              {/* Created Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={130}
                >
                  Created Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedTransaction, 'created_date', '')}
                </Typography>
              </Box>
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
