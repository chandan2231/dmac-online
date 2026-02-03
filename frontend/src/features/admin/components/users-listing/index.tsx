import * as Yup from 'yup';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import ModernSwitch from '../../../../components/switch';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import { useGetUsersListing } from '../../hooks/useGetUsersListing';
import type { IUserDetails } from '../../admin.interface';
import { get } from 'lodash';
import AdminService from '../../admin.service';
import CustomLoader from '../../../../components/loader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { ListItemIcon, ListItemText } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import { TabHeaderLayout } from '../../../../components/tab-header';

type ChangePasswordFormValues = {
  password: string;
};

function UsersTable() {
  const { data, isLoading, refetch } = useGetUsersListing('USER');

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserDetails | null>(null);
  const [menuUser, setMenuUser] = useState<IUserDetails | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { showToast } = useToast();

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateUserStatus(id, status);
    if (result.success) {
      await refetch();
    } else {
      console.error('Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const schema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Min 6 characters'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(schema),
  });

  const handleOpenPasswordModal = (user: IUserDetails) => {
    setSelectedUser(user);
    reset({ password: '' });
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedUser(null);
    reset({ password: '' });
  };

  const onSubmitChangePassword = async (values: ChangePasswordFormValues) => {
    if (!selectedUser) return;
    setIsLoadingStatus(true);
    const result = await AdminService.changeUserPassword({
      id: selectedUser.id,
      password: values.password,
    });
    if (result.success) {
      showToast(result.message, 'success');
      handleClosePasswordModal();
      await refetch();
    } else {
      console.error('Password change failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: IUserDetails
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleOpenViewModal = (user: IUserDetails) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const columns: GridColDef<IUserDetails>[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 300 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
    { field: 'language_name', headerName: 'Language', width: 120 },
    { field: 'state', headerName: 'State', width: 140 },
    { field: 'zip_code', headerName: 'Zip Code', width: 120 },
    { field: 'country', headerName: 'Country', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: params => {
        const isActive = params.row.status === 1;
        return (
          <Box display="flex" alignItems="center" height="100%">
            <ModernSwitch
              checked={isActive}
              onChange={() =>
                handleUpdateStatus(params.row.id, isActive ? 0 : 1)
              }
              trackColor={isActive ? '#4caf50' : '#ccc'}
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'sticky-right--header',
      cellClassName: 'sticky-right--cell',
      sortable: false,
      filterable: false,
      renderCell: params => (
        <>
          <IconButton
            onClick={e => handleMenuClick(e, params.row)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </>
      ),
    },
  ];

  if (isLoading || isLoadingStatus) {
    return <CustomLoader />;
  }

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as IUserDetails[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
        disableVirtualization
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ elevation: 6, sx: { minWidth: 220, borderRadius: 2 } }}
      >
        <MenuItem
          onClick={() => {
            if (menuUser) {
              handleMenuClose();
              handleOpenViewModal(menuUser);
            }
          }}
          sx={{ py: 1, px: 1.5 }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon sx={{ fontSize: 21 }} />
          </ListItemIcon>
          <ListItemText primary="View Details" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) {
              handleMenuClose();
              handleOpenPasswordModal(menuUser);
            }
          }}
          sx={{ py: 1, px: 1.5 }}
        >
          <ListItemIcon>
            <LockResetOutlinedIcon sx={{ fontSize: 21 }} />
          </ListItemIcon>
          <ListItemText primary="Change Password" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
        </MenuItem>
      </Menu>

      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Change Password${selectedUser ? ` - ${selectedUser.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitChangePassword)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-end',
              mt: 2,
              minWidth: '140px',
              maxWidth: '180px',
            }}
          >
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title={`User Details${selectedUser ? ` - ${selectedUser.name}` : ''}`}
        hideCancelButton
      >
        {selectedUser && (
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
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  User:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'name', '')}
                </Typography>
              </Box>

              {/* Email */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'email', '')}
                </Typography>
              </Box>

              {/* Mobile */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Mobile:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'mobile', '')}
                </Typography>
              </Box>

              {/* Language */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Language:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'language_name', '')}
                </Typography>
              </Box>

              {/* State */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  State:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'state', '')}
                </Typography>
              </Box>

              {/* Zip Code */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Zip Code:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'zip_code', '')}
                </Typography>
              </Box>

              {/* Country */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'country', '')}
                </Typography>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'status', 0) === 1 ? 'Active' : 'Inactive'}
                </Typography>
              </Box>

              {/* Created Date */}
              <Box display="flex" alignItems="center" gap={1} width={'50%'}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={100}
                >
                  Created Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedUser, 'created_date', '')}
                </Typography>
              </Box>
            </Box>

            {/* Other Details Section */}
            {(() => {
              try {
                const meta = selectedUser.patient_meta
                  ? JSON.parse(selectedUser.patient_meta)
                  : {};
                return (
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
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      width="100%"
                      gutterBottom
                    >
                      Other Details
                    </Typography>

                    {/* Latitude */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width={'50%'}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        minWidth={100}
                      >
                        Latitude:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {meta.lat || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Longitude */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width={'50%'}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        minWidth={100}
                      >
                        Longitude:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {meta.long || 'N/A'}
                      </Typography>
                    </Box>

                    {/* OS Details */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width={'50%'}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        minWidth={100}
                      >
                        OS Details:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {meta.osDetails || 'N/A'}
                      </Typography>
                    </Box>

                    {/* IP Address */}
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      width={'50%'}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        minWidth={100}
                      >
                        IP Address:
                      </Typography>
                      <Typography variant="body1" fontWeight="600">
                        {meta.ipAddress || 'N/A'}
                      </Typography>
                    </Box>

                    {/* Network Info */}
                    <Box width={'100%'} mt={1}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Network Info
                      </Typography>
                      <Box pl={2}>
                        <Typography variant="body2">
                          Effective Type:{' '}
                          {meta.networkInfo?.effectiveType || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          RTT: {meta.networkInfo?.rtt || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Downlink: {meta.networkInfo?.downlink || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Device Info */}
                    <Box width={'100%'} mt={1}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Device Info
                      </Typography>
                      <Box pl={2}>
                        <Typography variant="body2">
                          Platform: {meta.deviceInfo?.platform || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Vendor: {meta.deviceInfo?.vendor || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          User Agent: {meta.deviceInfo?.userAgent || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              } catch {
                return <Typography color="error">Invalid Meta Data</Typography>;
              }
            })()}
          </Box>
        )}
      </GenericModal>
    </>
  );
}

const UsersListing = () => {
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
      <TabHeaderLayout
        leftNode={
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              padding: 0,
            }}
          >
            Users List
          </Typography>
        }
      />
      <UsersTable />
    </Box>
  );
};

export default UsersListing;
