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
      >
        {selectedConsultation && (
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
              {/* Consultation ID */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Consultation ID:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultation_id || ''}
                </Typography>
              </Box>

              {/* User Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  User Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.user_name || ''}
                </Typography>
              </Box>

              {/* User Email */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  User Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.user_email || ''}
                </Typography>
              </Box>

              {/* Consultant Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Consultant Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultant_name || ''}
                </Typography>
              </Box>

              {/* Consultant Email */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Consultant Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultant_email || ''}
                </Typography>
              </Box>

              {/* Product Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Product Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.product_name || ''}
                </Typography>
              </Box>

              {/* Product Description */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Product Description:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.product_description || ''}
                </Typography>
              </Box>

              {/* Time Slot */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Time Slot:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.time_slot || ''}
                </Typography>
              </Box>

              {/* Consultation Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Consultation Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultation_date || ''}
                </Typography>
              </Box>

              {/* Time Zone */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Time Zone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.time_zone || ''}
                </Typography>
              </Box>

              {/* Country */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultation_country || ''}
                </Typography>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.consultation_status === 1
                    ? 'Active'
                    : 'Inactive'}
                </Typography>
              </Box>

              {/* Payment Date (if exists) */}
              {selectedConsultation.payment_date && (
                <>
                  <Box display="flex" alignItems="center" gap={1} width="50%">
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      minWidth={140}
                    >
                      Payment Date:
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedConsultation.payment_date || ''}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} width="50%">
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      minWidth={140}
                    >
                      Consultation Notes:
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                      {selectedConsultation.consultation_notes || ''}
                    </Typography>
                  </Box>
                </>
              )}

              {/* Created Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={140}
                >
                  Created Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedConsultation.created_date || ''}
                </Typography>
              </Box>
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
