import { type MouseEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Link,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Autocomplete,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { get } from 'lodash';
import type { RootState } from '../../../store';
import { GenericTable } from '../../../components/table';
import { useToast } from '../../../providers/toast-provider';
import UpdateStatusModal from './UpdateStatusModal';
import ReviewModal from './ReviewModal';
import { useUpdateConsultationStatus } from '../hooks/useUpdateConsultationStatus';
import { useGetConsultations } from '../hooks/useGetConsultations';
import { useGetTherapistPatients } from '../hooks/useGetTherapistPatients';
import type { GridColDef } from '@mui/x-data-grid';
import { TabHeaderLayout } from '../../../components/tab-header';
import { ROUTES } from '../../../router/router';

dayjs.extend(utc);
dayjs.extend(timezone);

interface IConsultation {
  id: number;
  consultation_date: string;
  event_start: string;
  event_end: string;
  consultation_status: number;
  meet_link: string;
  patient_id: number;
  patient_name: string;
  patient_email: string;
  consultant_timezone: string;
}

const TherapistConsultationList = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const { showToast } = useToast();
  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  const { data: consultationsResponse, isLoading: loading } =
    useGetConsultations({
      therapistId: user?.id ? String(user.id) : undefined,
      patientName: selectedPatient?.name || '',
    });

  const { data: patientsResponse } = useGetTherapistPatients({
    therapistId: user?.id ? String(user.id) : undefined,
  });

  const consultations = (consultationsResponse?.data || []) as IConsultation[];
  const patients = patientsResponse?.data || [];

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
      navigate(
        ROUTES.THERAPIST_PATIENT_ASSESSMENT.replace(
          ':patientId',
          String(menuConsultation.patient_id)
        )
      );
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
        const therapistTimezone =
          selectedConsultation.consultant_timezone ||
          get(user, 'time_zone') ||
          'UTC';
        const now = dayjs().tz(therapistTimezone);
        const start = dayjs(selectedConsultation.event_start).tz(
          therapistTimezone
        );
        const consultationDate = dayjs(
          selectedConsultation.consultation_date
        ).tz(therapistTimezone);

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

  const getStatusLabel = (
    status: number
  ): {
    label: string;
    color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
  } => {
    switch (status) {
      case 0:
      case 1:
        return { label: 'Created', color: 'info' };
      case 2:
        return { label: 'Pending', color: 'warning' };
      case 3:
        return { label: 'Accepted', color: 'success' };
      case 4:
        return { label: 'Completed', color: 'success' };
      case 5:
        return { label: 'Cancelled', color: 'error' };
      case 6:
        return { label: 'Rescheduled', color: 'warning' };
      case 7:
        return { label: 'Paid', color: 'success' };
      default:
        return { label: `Status ${status}`, color: 'default' };
    }
  };

  const columns: GridColDef[] = [
    { field: 'patient_name', headerName: 'Patient Name', flex: 1 },
    { field: 'patient_email', headerName: 'Patient Email', flex: 1 },
    {
      field: 'slot_time',
      headerName: 'Slot Time',
      flex: 1,
      renderCell: params => {
        const consultation = params.row;
        const therapistTimezone = get(user, 'time_zone') || 'UTC';
        const start = dayjs(consultation.event_start)
          .tz(therapistTimezone)
          .format('HH:mm');
        const end = dayjs(consultation.event_end)
          .tz(therapistTimezone)
          .format('HH:mm');
        return `${start} - ${end}`;
      },
    },
    {
      field: 'consultation_status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => {
        const { label, color } = getStatusLabel(params.value);
        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      field: 'consultation_date',
      headerName: 'Date',
      flex: 1,
      renderCell: params => {
        const therapistTimezone = get(user, 'time_zone') || 'UTC';
        return dayjs(params.row.event_start)
          .tz(therapistTimezone)
          .format('MMM D, YYYY');
      },
    },
    {
      field: 'meet_link',
      headerName: 'Meeting Link',
      flex: 1,
      renderCell: params => {
        return params.value ? (
          <Link href={params.value} target="_blank" rel="noopener">
            Join Meeting
          </Link>
        ) : (
          'N/A'
        );
      },
    },
    {
      field: 'review',
      headerName: 'Review',
      width: 140,
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
      width: 100,
      sortable: false,
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

      <GenericTable rows={consultations} columns={columns} loading={loading} />
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
        <MenuItem onClick={handleViewDocumentsClick}>View Documents</MenuItem>
      </Menu>
    </Box>
  );
};

export default TherapistConsultationList;
