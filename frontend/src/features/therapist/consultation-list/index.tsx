import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import CustomLoader from '../../../components/loader';
import UpdateStatusModal from './UpdateStatusModal';
import { useUpdateConsultationStatus } from '../hooks/useUpdateConsultationStatus';
import { useGetConsultations } from '../hooks/useGetConsultations';
import { useGetTherapistPatients } from '../hooks/useGetTherapistPatients';

dayjs.extend(utc);
dayjs.extend(timezone);

interface IConsultation {
  id: number;
  consultation_date: string;
  event_start: string;
  event_end: string;
  consultation_status: number;
  meet_link: string;
  patient_name: string;
  patient_email: string;
  consultant_timezone: string;
}

const TherapistConsultationList = () => {
  const user = useSelector((state: RootState) => state.auth.user);
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

  const handleOpenModal = (consultation: IConsultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConsultation(null);
  };

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

  const handleEditStatusClick = () => {
    if (menuConsultation) {
      handleOpenModal(menuConsultation);
    }
    handleMenuClose();
  };

  const handleSubmitStatus = (status: number, notes: string) => {
    if (selectedConsultation) {
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

  return (
    <Box p={3} height="100%" width="100%">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">My Consultations</Typography>
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
      </Box>

      {loading ? (
        <CustomLoader />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Patient Email</TableCell>
                <TableCell>Slot Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Meeting Link</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultations.length > 0 ? (
                consultations.map(consultation => {
                  const therapistTimezone = get(user, 'time_zone') || 'UTC';
                  const start = dayjs(consultation.event_start)
                    .tz(therapistTimezone)
                    .format('HH:mm');
                  const end = dayjs(consultation.event_end)
                    .tz(therapistTimezone)
                    .format('HH:mm');
                  const date = dayjs(consultation.consultation_date)
                    .tz(therapistTimezone)
                    .format('MMM D, YYYY');

                  const { label, color } = getStatusLabel(
                    consultation.consultation_status
                  );

                  return (
                    <TableRow key={consultation.id}>
                      <TableCell>{consultation.patient_name}</TableCell>
                      <TableCell>{consultation.patient_email}</TableCell>
                      <TableCell>{`${start} - ${end}`}</TableCell>
                      <TableCell>
                        <Chip label={label} color={color} size="small" />
                      </TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>
                        {consultation.meet_link ? (
                          <Link
                            href={consultation.meet_link}
                            target="_blank"
                            rel="noopener"
                          >
                            Join Meeting
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={e => handleMenuClick(e, consultation)}
                          disabled={consultation.consultation_status !== 1}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No consultations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <UpdateStatusModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitStatus}
        isLoading={isUpdating}
      />
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditStatusClick}>Edit Status</MenuItem>
      </Menu>
    </Box>
  );
};

export default TherapistConsultationList;
