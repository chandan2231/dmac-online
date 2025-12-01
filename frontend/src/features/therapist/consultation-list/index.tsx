import { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { get } from 'lodash';
import type { RootState } from '../../../store';
import TherapistService from '../therapist.service';
import CustomLoader from '../../../components/loader';
import { useDebounce } from '../../../hooks/useDebouce';
import UpdateStatusModal from './UpdateStatusModal';
import { useUpdateConsultationStatus } from '../hooks/useUpdateConsultationStatus';

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
  const [consultations, setConsultations] = useState<IConsultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateConsultationStatus();

  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuConsultation, setMenuConsultation] =
    useState<IConsultation | null>(null);

  const fetchConsultations = async () => {
    if (!user?.id) return;
    setLoading(true);
    const response = await TherapistService.getConsultationList(
      String(user.id),
      debouncedSearchTerm
    );
    if (response.success) {
      setConsultations(response.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [user?.id, debouncedSearchTerm]);

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
            fetchConsultations(); // Refresh list after update
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
        <TextField
          variant="outlined"
          placeholder="Search by Patient Name"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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
