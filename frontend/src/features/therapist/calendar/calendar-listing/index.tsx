import type { IAvailabilitySlot, ISlotsData } from '../../therapist.interface';
import { useEffect, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import ModernSwitch from '../../../../components/switch';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { get } from 'lodash';
import TherapistService from '../../therapist.service';
import { useToast } from '../../../../providers/toast-provider';
import ViewSlotDetails from './view-slot-details';
import UpdateSlot from './update-slot';

const CalendarListing = ({
  slotsData,
  onRefresh,
}: {
  slotsData: ISlotsData;
  onRefresh: () => void;
}) => {
  const [rows, setRows] = useState<IAvailabilitySlot[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<IAvailabilitySlot | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  useEffect(() => {
    const transformedData: IAvailabilitySlot[] = [];
    Object.entries(slotsData).forEach(([date, slots]) => {
      transformedData.push({
        id: date,
        date,
        slots,
        is_day_off: slots.length > 0 ? slots[0].is_day_off : 0,
        start_time: slots.length > 0 ? slots[0].start_time : '',
        end_time: slots.length > 0 ? slots[slots.length - 1].end_time : '',
      });
    });
    setRows(transformedData);
  }, [slotsData]);

  const handleDayOffChange = async (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;

    const newIsDayOff = row.is_day_off === 1 ? 0 : 1;

    // Optimistic update
    setRows(prevRows =>
      prevRows.map(r => {
        if (r.id === id) {
          return {
            ...r,
            is_day_off: newIsDayOff,
            slots: r.slots.map(slot => ({
              ...slot,
              is_day_off: newIsDayOff,
            })),
          };
        }
        return r;
      })
    );

    // API Call
    const response = await TherapistService.toggleDayOff({
      consultant_id: get(user, 'id', ''),
      date: row.date,
      is_day_off: newIsDayOff,
    });

    if (response.success) {
      showToast(response.message || 'Updated successfully', 'success');
    } else {
      showToast(response.message || 'Update failed', 'error');
      // Revert on failure
      setRows(prevRows =>
        prevRows.map(r => {
          if (r.id === id) {
            return {
              ...r,
              is_day_off: row.is_day_off, // Revert to old value
              slots: r.slots.map(slot => ({
                ...slot,
                is_day_off: row.is_day_off,
              })),
            };
          }
          return r;
        })
      );
    }
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: IAvailabilitySlot
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setIsViewModalOpen(true);
    handleMenuClose();
  };

  const handleUpdateSlot = () => {
    setIsUpdateModalOpen(true);
    handleMenuClose();
  };

  const handleUpdateSuccess = () => {
    setIsUpdateModalOpen(false);
    if (onRefresh) {
      onRefresh();
    }
  };

  const columns: GridColDef<IAvailabilitySlot>[] = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'start_time', headerName: 'Start Time', flex: 1 },
    { field: 'end_time', headerName: 'End Time', flex: 1 },
    {
      field: 'day_off',
      headerName: 'Is Available',
      flex: 1,
      renderCell: params => {
        const isDayOff = params.row.is_day_off === 1;
        return (
          <Box display="flex" alignItems="center" height="100%">
            <ModernSwitch
              checked={isDayOff}
              onChange={() => handleDayOffChange(params.row.id)}
              trackColor={isDayOff ? '#4caf50' : '#ccc'}
            />
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      renderCell: params => {
        return (
          <IconButton
            onClick={e => handleMenuClick(e, params.row)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        );
      },
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      p={3}
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
              Availability List
            </Typography>
          </Box>
        }
      />
      <GenericTable rows={rows} columns={columns} loading={false} />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
        <MenuItem
          onClick={handleUpdateSlot}
          disabled={selectedRow?.is_day_off !== 1}
        >
          Update Slot
        </MenuItem>
      </Menu>

      <ViewSlotDetails
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        slotData={selectedRow}
      />

      <UpdateSlot
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        slotData={selectedRow}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </Box>
  );
};

export default CalendarListing;
