import { useSelector } from 'react-redux';
import type { IAvailabilitySlot, ISlotsData } from '../../expert.interface';
import type { RootState } from '../../../../store';
import { useEffect, useState } from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import ModernSwitch from '../../../../components/switch';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const CalendarListing = ({ slotsData }: { slotsData: ISlotsData }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [rows, setRows] = useState<IAvailabilitySlot[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const transformedData: IAvailabilitySlot[] = [];
    Object.entries(slotsData).forEach(([date, slots]) => {
      transformedData.push({
        id: date,
        date,
        slots,
        day_off: slots.some(slot => slot.day_off === 1) ? 1 : 0,
        start_time: slots.length > 0 ? slots[0].start_time : '',
        end_time: slots.length > 0 ? slots[slots.length - 1].end_time : '',
      });
    });
    setRows(transformedData);
  }, [slotsData]);

  const handleDayOffChange = (id: string) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.id === id) {
          return { ...row, day_off: row.day_off === 1 ? 0 : 1 };
        }
        return row;
      })
    );
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const columns: GridColDef<IAvailabilitySlot>[] = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'start_time', headerName: 'Start Time', flex: 1 },
    { field: 'end_time', headerName: 'End Time', flex: 1 },
    {
      field: 'day_off',
      headerName: 'Day Off',
      flex: 1,
      renderCell: params => {
        const isDayOff = params.row.day_off === 1;
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
          <>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                }}
              >
                View Details
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                }}
              >
                Update Slot
              </MenuItem>
            </Menu>
          </>
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
      p={2}
      gap={1}
    >
      <TabHeaderLayout
        leftNode={
          <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
            <Typography variant="h6">Availability List</Typography>
          </Box>
        }
      />
      <GenericTable rows={rows} columns={columns} loading={false} />
    </Box>
  );
};

export default CalendarListing;
