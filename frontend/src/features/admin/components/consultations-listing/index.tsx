import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import CustomLoader from '../../../../components/loader';
import { useGetConsultationsListing } from '../../hooks/useGetConsultationsListing';
import { useGetConsultantsListing } from '../../hooks/useGetConsultantsListing';
import type { IConsultation, ConsultationFilter } from '../../admin.interface';
import { get } from 'lodash';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GenericModal from '../../../../components/modal';
import ModernSelect, { type IOption } from '../../../../components/select';
import { TabHeaderLayout } from '../../../../components/tab-header';
import ModernSwitch from '../../../../components/switch';
import ModernInput from '../../../../components/input';

function ConsultationsTable() {
  const [consultantFilter, setConsultantFilter] =
    useState<ConsultationFilter>(null);
  const { data, isLoading } = useGetConsultationsListing(consultantFilter);
  const { data: consultantsData } = useGetConsultantsListing();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuConsultation, setMenuConsultation] =
    useState<IConsultation | null>(null);

  // Modal state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    consultation: IConsultation
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuConsultation(consultation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuConsultation(null);
  };

  const handleOpenViewModal = (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedConsultation(null);
    setIsViewModalOpen(false);
  };

  // Prepare consultant options for filter
  const consultantOptions: IOption[] = [
    { label: 'All Consultants', value: '' },
    ...(consultantsData?.data?.map(consultant => ({
      label: consultant.name,
      value: String(consultant.id),
    })) || []),
  ];

  const handleConsultantFilterChange = (value: IOption) => {
    const { value: val } = value;
    const parsedValue = val === '' ? null : Number(val);
    setConsultantFilter(parsedValue);
  };

  const handleUpdateStatus = (id: number, newStatus: number) => {
    // Here you would typically call an API to update the status
    console.log(`Update consultation ${id} to status ${newStatus}`);
  };

  const columns: GridColDef<IConsultation>[] = [
    { field: 'consultation_id', headerName: 'Consultation ID', flex: 1 },
    { field: 'user_name', headerName: 'User Name', flex: 1 },
    { field: 'user_email', headerName: 'User Email', flex: 1 },
    { field: 'consultant_name', headerName: 'Consultant Name', flex: 1 },
    { field: 'consultant_email', headerName: 'Consultant Email', flex: 1 },
    { field: 'product_name', headerName: 'Product Name', flex: 1 },
    { field: 'time_slot', headerName: 'Time Slot', flex: 1 },
    { field: 'consultation_date', headerName: 'Consultation Date', flex: 1 },
    { field: 'consultation_country', headerName: 'Country', flex: 1 },
    {
      field: 'consultation_status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => {
        const status = get(params, 'row.consultation_status');
        const isActive = status === 1;
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
    { field: 'created_date', headerName: 'Created Date', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
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
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      p={2}
      gap={1}
    >
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography variant="h6">Consultations List</Typography>
          </Box>
        }
        rightNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Filter by Consultant:</Typography>
            <ModernSelect
              options={consultantOptions}
              value={
                consultantOptions.find(
                  opt => opt.value === String(consultantFilter)
                ) || consultantOptions[0]
              }
              onChange={handleConsultantFilterChange}
              placeholder="Select Consultant"
              variant="standard"
              sx={{ minWidth: 200 }}
            />
          </Box>
        }
      />

      <GenericTable
        rows={data?.data || []}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* View Details Modal */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Consultation Details"
        submitButtonText="Close"
        hideCancelButton
        maxWidth="md"
      >
        {selectedConsultation && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Consultation ID"
                value={selectedConsultation.consultation_id || ''}
                disabled
              />
              <ModernInput
                label="User Name"
                value={selectedConsultation.user_name || ''}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="User Email"
                value={selectedConsultation.user_email || ''}
                disabled
              />
              <ModernInput
                label="Consultant Name"
                value={selectedConsultation.consultant_name || ''}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Consultant Email"
                value={selectedConsultation.consultant_email || ''}
                disabled
              />
              <ModernInput
                label="Product Name"
                value={selectedConsultation.product_name || ''}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Product Description"
                value={selectedConsultation.product_description || ''}
                disabled
              />
              <ModernInput
                label="Time Slot"
                value={selectedConsultation.time_slot || ''}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Consultation Date"
                value={selectedConsultation.consultation_date || ''}
                disabled
              />
              <ModernInput
                label="Time Zone"
                value={selectedConsultation.time_zone || ''}
                disabled
              />
            </Box>
            <Box display="flex" gap={2}>
              <ModernInput
                label="Country"
                value={selectedConsultation.consultation_country || ''}
                disabled
              />
              <ModernInput
                label="Status"
                value={
                  selectedConsultation.consultation_status === 1
                    ? 'Active'
                    : 'Inactive'
                }
                disabled
              />
            </Box>
            {selectedConsultation.payment_date && (
              <Box display="flex" gap={2}>
                <ModernInput
                  label="Payment Date"
                  value={selectedConsultation.payment_date || ''}
                  disabled
                />
                <ModernInput
                  label="Consultation Notes"
                  value={selectedConsultation.consultation_notes || ''}
                  disabled
                />
              </Box>
            )}
            <Box display="flex" gap={2}>
              <ModernInput
                label="Created Date"
                value={selectedConsultation.created_date || ''}
                disabled
              />
              <Box width="100%"></Box>
            </Box>
          </Box>
        )}
      </GenericModal>

      {/* Actions Menu */}
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
            handleMenuClose();
            if (menuConsultation) {
              handleOpenViewModal(menuConsultation);
            }
          }}
        >
          View Details
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default ConsultationsTable;
