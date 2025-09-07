import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import MorenButton from '../../../../components/button';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GenericModal from '../../../../components/modal';
import ModernSwitch from '../../../../components/switch';
import { useGetConsultantsListing } from '../../hooks/useGetConsultantsListing';
import type { IConsultant } from '../../admin.interface';
import { get } from 'lodash';
import CustomLoader from '../../../../components/loader';
import AdminService from '../../admin.service';

function UserTable() {
  const { data, isLoading, refetch } = useGetConsultantsListing();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateConsultantStatus(id, status);
    if (result.success) {
      await refetch();
    } else {
      console.error('Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const columns: GridColDef<IConsultant>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
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
              onChange={() => {
                handleUpdateStatus(params.row.id, isActive ? 0 : 1);
              }}
              trackColor={isActive ? '#4caf50' : '#ccc'}
            />
          </Box>
        );
      },
    },
  ];

  if (isLoading || isLoadingStatus) {
    return <CustomLoader />;
  }

  return (
    <GenericTable
      rows={get(data, 'data', []) as IConsultant[]}
      columns={columns}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      maxHeight="calc(100vh - 200px)"
      minHeight="calc(100vh - 200px)"
      loading={isLoading}
    />
  );
}

const ConsultantsListing = () => {
  const [createConsultantModalOpen, setCreateConsultantModalOpen] =
    useState(false);

  const handleOpenCreateConsultantModal = () => {
    setCreateConsultantModalOpen(true);
  };

  const handleCloseCreateConsultantModal = () => {
    setCreateConsultantModalOpen(false);
  };

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
          <Typography variant="h6" sx={{ padding: 0 }}>
            Consultant Management Dashboard
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateConsultantModal}
          >
            Add New Consultant
          </MorenButton>
        }
      />
      <UserTable />

      {/* Modal */}
      <GenericModal
        isOpen={createConsultantModalOpen}
        onClose={handleCloseCreateConsultantModal}
        title="Create New Consultant"
      />
    </Box>
  );
};

export default ConsultantsListing;
