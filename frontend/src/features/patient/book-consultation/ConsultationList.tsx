import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { get } from 'lodash';
import { GenericTable } from '../../../components/table';
import type { IConsultation } from '../patient.interface';
import type { GridColDef } from '@mui/x-data-grid';
import type { IUser } from '../../auth/auth.interface';
import { TabHeaderLayout } from '../../../components/tab-header';
import { formatToTimezone, getUserTimezone } from '../../../utils/dateUtils';

interface ConsultationListProps {
  consultations: IConsultation[];
  loading: boolean;
  onAddClick: () => void;
  isAddDisabled: boolean;
  onReviewClick: (consultation: IConsultation) => void;
  onRescheduleClick: (consultation: IConsultation) => void;
  user: IUser | null;
  enableReviews: boolean;
}

const ConsultationList = ({
  consultations,
  loading,
  onAddClick,
  isAddDisabled,
  onReviewClick,
  onRescheduleClick,
  user,
  enableReviews,
}: ConsultationListProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConsultation, setSelectedConsultation] =
    useState<IConsultation | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    consultation: IConsultation
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedConsultation(consultation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedConsultation(null);
  };

  const handleRateClick = () => {
    if (selectedConsultation) {
      onReviewClick(selectedConsultation);
    }
    handleMenuClose();
  };

  const handleRescheduleClick = () => {
    if (selectedConsultation) {
      onRescheduleClick(selectedConsultation);
    }
    handleMenuClose();
  };

  const columns: GridColDef[] = [
    { field: 'expert_name', headerName: 'Expert Name', flex: 1 },
    {
      field: 'booked_slot',
      headerName: 'Booked Slot',
      flex: 1,
      renderCell: params => {
        const userTimezone = get(user, 'time_zone') || getUserTimezone();
        const start = formatToTimezone(
          params.row.event_start,
          userTimezone,
          'HH:mm'
        );
        const end = formatToTimezone(
          params.row.event_end,
          userTimezone,
          'HH:mm'
        );
        return `${start} - ${end}`;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: params => {
        let statusLabel = 'Unknown';
        let statusColor:
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
            statusLabel = 'Created';
            statusColor = 'info';
            break;
          case 2:
            statusLabel = 'Pending';
            statusColor = 'warning';
            break;
          case 3:
            statusLabel = 'Accepted';
            statusColor = 'success';
            break;
          case 4:
            statusLabel = 'Completed';
            statusColor = 'success';
            break;
          case 5:
            statusLabel = 'Cancelled';
            statusColor = 'error';
            break;
          case 6:
            statusLabel = 'Rescheduled';
            statusColor = 'warning';
            break;
          case 7:
            statusLabel = 'Paid';
            statusColor = 'success';
            break;
          default:
            statusLabel = `Status ${params.value}`;
        }
        return <Chip label={statusLabel} color={statusColor} size="small" />;
      },
    },
    {
      field: 'consultation_date',
      headerName: 'Booking Date',
      flex: 1,
      renderCell: params => {
        const userTimezone = get(user, 'time_zone') || getUserTimezone();
        return formatToTimezone(params.value, userTimezone, 'MMM D, YYYY');
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
      field: 'actions',
      headerName: 'Action',
      flex: 0.5,
      width: 80,
      renderCell: params => (
        <IconButton onClick={e => handleMenuOpen(e, params.row)}>
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
              Consultations
            </Typography>
          </Box>
        }
        rightNode={
          <Box display="flex" gap={2} alignItems="center">
            <Button
              variant="contained"
              onClick={onAddClick}
              disabled={isAddDisabled}
            >
              Add Book Consultation
            </Button>
          </Box>
        }
      />
      <GenericTable rows={consultations} columns={columns} loading={loading} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedConsultation && selectedConsultation.status !== 4 && (
          <MenuItem onClick={handleRescheduleClick}>
            Reschedule Booking
          </MenuItem>
        )}
        {selectedConsultation &&
          selectedConsultation.status === 4 &&
          enableReviews && (
            <MenuItem onClick={handleRateClick}>Rating</MenuItem>
          )}
      </Menu>
    </Box>
  );
};

export default ConsultationList;
