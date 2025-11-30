import { Box, Typography, Chip, Link } from '@mui/material';
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

dayjs.extend(utc);
dayjs.extend(timezone);

interface IConsultation {
  id: number;
  event_start: string;
  event_end: string;
  meet_link: string;
  consultation_status: number;
  consultation_date: string;
  patient_name: string;
  patient_email: string;
  product_name: string;
}

const ConsultationList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: consultationsData, isLoading } = useGetConsultations({
    expertId: get(user, 'id'),
  });

  const consultations = get(consultationsData, 'data', []) as IConsultation[];
  const userTimezone = get(user, 'time_zone') || 'UTC';

  const columns: GridColDef<IConsultation>[] = [
    {
      field: 'consultation_date',
      headerName: 'Date',
      flex: 1,
      valueFormatter: (params: { value: string | null }) =>
        dayjs(params.value).tz(userTimezone).format('MMM D, YYYY'),
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
  ];

  return (
    <Box p={3} height="100%" width="100%">
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography variant="h6">My Consultations</Typography>
          </Box>
        }
      />
      <Box mt={2} height="calc(100% - 60px)">
        <GenericTable
          rows={consultations}
          columns={columns}
          loading={isLoading}
        />
      </Box>
    </Box>
  );
};

export default ConsultationList;
