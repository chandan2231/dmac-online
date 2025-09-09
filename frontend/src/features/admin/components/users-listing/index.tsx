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
import type { IUser } from '../../admin.interface';
import { get } from 'lodash';
import AdminService from '../../admin.service';
import CustomLoader from '../../../../components/loader';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';

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
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
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

  const handleOpenPasswordModal = (user: IUser) => {
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

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenViewModal = (user: IUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const columns: GridColDef<IUser>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
    { field: 'language_name', headerName: 'Language', width: 120 },
    { field: 'state', headerName: 'State', width: 140 },
    { field: 'zip_code', headerName: 'Zip Code', width: 120 },
    { field: 'country', headerName: 'Country', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 140 },
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
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <>
          <IconButton onClick={handleMenuClick} size="small">
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleOpenViewModal(params.row);
              }}
            >
              View Details
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleOpenPasswordModal(params.row);
              }}
            >
              Change Password
            </MenuItem>
          </Menu>
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
        rows={get(data, 'data', []) as IUser[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

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
        maxWidth="md"
      >
        {selectedUser && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Name"
                value={get(selectedUser, 'name', '')}
                disabled
              />
              <ModernInput
                label="Email"
                value={get(selectedUser, 'email', '')}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Mobile"
                value={get(selectedUser, 'mobile', '')}
                disabled
              />
              <ModernInput
                label="Language"
                value={get(selectedUser, 'language_name', '')}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="State"
                value={get(selectedUser, 'state', '')}
                disabled
              />
              <ModernInput
                label="Zip Code"
                value={get(selectedUser, 'zip_code', '')}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Country"
                value={get(selectedUser, 'country', '')}
                disabled
              />
              <ModernInput
                label="Status"
                value={
                  get(selectedUser, 'status', 0) === 1 ? 'Active' : 'Inactive'
                }
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Created Date"
                value={get(selectedUser, 'created_date', '')}
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
      <Typography variant="h6" sx={{ padding: 0 }}>
        Users List
      </Typography>
      <UsersTable />
    </Box>
  );
};

export default UsersListing;
