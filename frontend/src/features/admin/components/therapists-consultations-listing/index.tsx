import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import { GenericTable } from '../../../../components/table';
import CustomLoader from '../../../../components/loader';
import { useGetConsultationsListing } from '../../hooks/useGetConsultationsListing';
import { useGetTherapistListing } from '../../hooks/useGetTherapistListing';
import type { IConsultation } from '../../admin.interface';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GenericModal from '../../../../components/modal';
import ModernSelect, { type IOption } from '../../../../components/select';
import { TabHeaderLayout } from '../../../../components/tab-header';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../router/router';

dayjs.extend(utc);
dayjs.extend(timezone);

function TherapistConsultationsTable() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userTimezone = get(user, 'time_zone') || 'UTC';
  const navigate = useNavigate();

  const [consultantFilter, setConsultantFilter] = useState<number | null>(null);
  const { data, isLoading } = useGetConsultationsListing({
    consultant_id: consultantFilter,
    consultant_role: 'THERAPIST',
  });
  const { data: therapistsData } = useGetTherapistListing();

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

  const handleViewDocuments = () => {
    if (menuConsultation) {
      navigate(
        ROUTES.ADMIN_PATIENT_ASSESSMENT.replace(
          ':patientId',
          String(menuConsultation.user_id)
        )
      );
      handleMenuClose();
    }
  };

  // Prepare therapist options for filter
  const therapistOptions: IOption[] = [
    { label: 'All Therapists', value: '' },
    ...(therapistsData?.data?.map(therapist => ({
      label: therapist.name,
      value: String(therapist.id),
    })) || []),
  ];

  const handleConsultantFilterChange = (value: IOption) => {
    const { value: val } = value;
    const parsedValue = val === '' ? null : Number(val);
    setConsultantFilter(parsedValue);
  };

  const columns: GridColDef<IConsultation>[] = [
    {
      field: 'consultation_id',
      headerName: 'Consultation ID',
      flex: 1,
      minWidth: 150,
    },
    { field: 'user_name', headerName: 'User Name', flex: 1, minWidth: 150 },
    { field: 'user_email', headerName: 'User Email', flex: 1, minWidth: 150 },
    {
      field: 'consultant_name',
      headerName: 'Therapist Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'consultant_email',
      headerName: 'Therapist Email',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'product_name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'time_slot',
      headerName: 'Time Slot',
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        if (params.row.event_start && params.row.event_end) {
          const start = dayjs(params.row.event_start)
            .tz(userTimezone)
            .format('HH:mm');
          const end = dayjs(params.row.event_end)
            .tz(userTimezone)
            .format('HH:mm');
          return `${start} - ${end}`;
        }
        return params.value;
      },
    },
    {
      field: 'consultation_date',
      headerName: 'Consultation Date',
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        const dateToUse =
          params.row.event_start || params.row.consultation_date;
        return dateToUse
          ? dayjs(dateToUse).tz(userTimezone).format('MMM D, YYYY')
          : '';
      },
    },
    {
      field: 'consultation_country',
      headerName: 'Country',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'consultation_status',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      renderCell: params => {
        let label = 'Unknown';
        let color:
          | 'default'
          | 'primary'
          | 'secondary'
          | 'error'
          | 'info'
          | 'success'
          | 'warning' = 'default';

        switch (params.value) {
          case 0:
          case 1:
            label = 'Created';
            color = 'info';
            break;
          case 2:
            label = 'Pending';
            color = 'warning';
            break;
          case 3:
            label = 'Accepted';
            color = 'success';
            break;
          case 4:
            label = 'Completed';
            color = 'success';
            break;
          case 5:
            label = 'Cancelled';
            color = 'error';
            break;
          case 6:
            label = 'Rescheduled';
            color = 'warning';
            break;
          case 7:
            label = 'Paid';
            color = 'success';
            break;
          default:
            label = `Status ${params.value}`;
        }

        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      field: 'created_date',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 150,
    },
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
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              Therapist Consultations List
            </Typography>
          </Box>
        }
        rightNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">Filter by Therapist:</Typography>
            <ModernSelect
              options={therapistOptions}
              value={
                therapistOptions.find(
                  opt => opt.value === String(consultantFilter)
                ) || therapistOptions[0]
              }
              onChange={handleConsultantFilterChange}
              placeholder="Select Therapist"
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
                  Therapist Name:
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
                  Therapist Email:
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
                  {selectedConsultation.event_start &&
                  selectedConsultation.event_end
                    ? `${dayjs(selectedConsultation.event_start)
                        .tz(selectedConsultation.time_zone || userTimezone)
                        .format('HH:mm')} - ${dayjs(
                        selectedConsultation.event_end
                      )
                        .tz(selectedConsultation.time_zone || userTimezone)
                        .format('HH:mm')}`
                    : selectedConsultation.time_slot || ''}
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
                  {selectedConsultation.event_start
                    ? dayjs(selectedConsultation.event_start)
                        .tz(selectedConsultation.time_zone || userTimezone)
                        .format('MMM D, YYYY')
                    : selectedConsultation.consultation_date || ''}
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
                  {selectedConsultation.user_timezone || ''}
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
        <MenuItem onClick={handleViewDocuments}>View Documents</MenuItem>
      </Menu>
    </Box>
  );
}

export default TherapistConsultationsTable;
