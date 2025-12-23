import {
  Box,
  Typography,
  Chip,
  Link,
  IconButton,
  Menu,
  MenuItem,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSelector } from 'react-redux';
import { get } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { GridColDef } from '@mui/x-data-grid';
import type { RootState } from '../../../store';
import { GenericTable } from '../../../components/table';
import { TabHeaderLayout } from '../../../components/tab-header';
import { useGetConsultations } from '../hooks/useGetConsultations';
import { useGetExpertPatients } from '../hooks/useGetExpertPatients';
import { type MouseEvent, useState } from 'react';
import UpdateStatusModal from './UpdateStatusModal';
import ReviewModal from './ReviewModal';
import { useUpdateConsultationStatus } from '../hooks/useUpdateConsultationStatus';
import { useToast } from '../../../providers/toast-provider';
import { useNavigate } from 'react-router-dom';

dayjs.extend(utc);
dayjs.extend(timezone);

interface IConsultation {
  id: number;
  event_start: string;
  event_end: string;
  meet_link: string;
  consultation_status: number;
  consultation_date: string;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  product_name: string;
}

const ConsultationList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  const { data: consultationsData, isLoading } = useGetConsultations({
    expertId: get(user, 'id'),
    patientName: selectedPatient?.name || '',
  });

  const { data: patientsResponse } = useGetExpertPatients({
    expertId: get(user, 'id'),
  });

  const patients = get(patientsResponse, 'data', []);

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateConsultationStatus();

  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuConsultation, setMenuConsultation] =
    useState<IConsultation | null>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewConsultationId, setSelectedReviewConsultationId] =
    useState<number | null>(null);

  const handleOpenModal = (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConsultation(null);
  };

  const handleMenuClick = (
    event: MouseEvent<HTMLButtonElement>,
    consultation: IConsultation
  ) => {
    setMenuAnchor(event.currentTarget);
    setMenuConsultation(consultation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuConsultation(null);
  };

  const handleEditStatusClick = () => {
    if (menuConsultation) {
      handleOpenModal(menuConsultation);
    }
    handleMenuClose();
  };

  const handleOpenReviewModal = (consultationId: number) => {
    setSelectedReviewConsultationId(consultationId);
    setReviewModalOpen(true);
  };

  const handleViewDocumentsClick = () => {
    if (menuConsultation) {
      navigate(`/expert/patient-assessment/${menuConsultation.patient_id}`);
    }
    handleMenuClose();
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedReviewConsultationId(null);
  };

  const handleSubmitStatus = (status: number, notes: string) => {
    if (selectedConsultation) {
      if (status === 4) {
        const expertTimezone = get(user, 'time_zone') || 'UTC';
        const now = dayjs().tz(expertTimezone);
        const start = dayjs(selectedConsultation.event_start).tz(
          expertTimezone
        );
        const consultationDate = dayjs(
          selectedConsultation.consultation_date
        ).tz(expertTimezone);

        if (now.isBefore(start) && now.isBefore(consultationDate)) {
          showToast(
            'meeting is not started, so you cant completed it now',
            'error'
          );
          return;
        }
      }

      updateStatus(
        { consultationId: selectedConsultation.id, status, notes },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    }
  };

  const consultations = get(consultationsData, 'data', []) as IConsultation[];
  const userTimezone = get(user, 'time_zone') || 'UTC';

  const columns: GridColDef<IConsultation>[] = [
    {
      field: 'consultation_date',
      headerName: 'Consultation Date',
      flex: 1,
      renderCell: params =>
        dayjs(params.row.event_start).tz(userTimezone).format('MMM D, YYYY'),
    },
    {
      field: 'event_start',
      headerName: 'Time',
      flex: 1,
      renderCell: params => {
        const start = dayjs(params.row.event_start)
          .tz(userTimezone)
          .format('HH:mm');
        const end = dayjs(params.row.event_end)
          .tz(userTimezone)
          .format('HH:mm');
        return `${start} - ${end}`;
      },
    },
    { field: 'patient_name', headerName: 'Patient Name', flex: 1 },
    {
      field: 'meet_link',
      headerName: 'Meeting Link',
      flex: 1,
      renderCell: params =>
        params.value ? (
          <Link href={params.value} target="_blank" rel="noopener noreferrer">
            Join Meeting
          </Link>
        ) : (
          'N/A'
        ),
    },
    {
      field: 'consultation_status',
      headerName: 'Status',
      flex: 1,
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
      field: 'review',
      headerName: 'Review',
      flex: 1,
      maxWidth: 140,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Chip
          label="View Review"
          size="small"
          variant="filled"
          clickable
          color="primary"
          onClick={() => handleOpenReviewModal(params.row.id)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      maxWidth: 80,
      renderCell: params => (
        <IconButton onClick={e => handleMenuClick(e, params.row)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box p={3} height="100%" width="100%">
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
              }}
            >
              My Consultations
            </Typography>
          </Box>
        }
        rightNode={
          <Box display="flex" gap={2} alignItems="center">
            <Autocomplete
              options={patients}
              getOptionLabel={option => option.name}
              value={selectedPatient}
              onChange={(_, newValue) => setSelectedPatient(newValue)}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Search Patient"
                  variant="outlined"
                  size="small"
                  sx={{ width: 250 }}
                />
              )}
            />
            <Button
              variant="outlined"
              onClick={() => setSelectedPatient(null)}
              disabled={!selectedPatient}
            >
              Clear
            </Button>
          </Box>
        }
      />
      <GenericTable
        rows={consultations}
        columns={columns}
        loading={isLoading}
      />
      <UpdateStatusModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitStatus}
        isLoading={isUpdating}
      />
      <ReviewModal
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        consultationId={selectedReviewConsultationId}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={handleEditStatusClick}
          disabled={menuConsultation?.consultation_status === 4}
        >
          Edit Status
        </MenuItem>
        <MenuItem onClick={handleViewDocumentsClick}>
          View Assessment & Documents
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ConsultationList;
