import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import EditIcon from '@mui/icons-material/Edit';
import ModernSelect, { type IOption } from '../../../../components/select';
import MorenButton from '../../../../components/button';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  COUNTRIES_LIST,
  TIMEZONES_BY_COUNTRY,
} from '../../../../utils/constants';
import ModernSwitch from '../../../../components/switch';
import { useGetConsultantsListing } from '../../hooks/useGetConsultantsListing';
import type {
  IConsultant,
  ICreateConsultantPayload,
} from '../../admin.interface';
import { get } from 'lodash';
import CustomLoader from '../../../../components/loader';
import AdminService from '../../admin.service';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useToast } from '../../../../providers/toast-provider';

const forgotPasswordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Min 6 characters'),
});

function UserTable() {
  const { data, isLoading, refetch } = useGetConsultantsListing();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedConsultant, setSelectedConsultant] =
    useState<IConsultant | null>(null);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handleOpenPasswordModal = (user: IConsultant) => {
    setSelectedConsultant(user);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedConsultant(null);
    reset(); // clear form
  };

  const handleOpenEditModal = (consultant: IConsultant) => {
    setSelectedConsultant(consultant);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedConsultant(null);
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateConsultantStatus(id, status);
    if (result.success) {
      await refetch();
    } else {
      console.error('Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const onSubmitChangePassword = async (values: { password: string }) => {
    if (!selectedConsultant) return;
    setIsLoadingStatus(true);
    const result = await AdminService.updateConsultantPassword({
      id: selectedConsultant.id,
      password: values.password,
    });
    if (result.success) {
      setIsPasswordModalOpen(false);
      setSelectedConsultant(null);
      reset(); // clear form
      showToast('Password updated successfully', 'success');
    } else {
      showToast(result.message, 'error');
      console.error('Change password failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const columns: GridColDef<IConsultant>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'mobile', headerName: 'Mobile', width: 140 },
    { field: 'created_date', headerName: 'Created Date', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: params => {
        const isActive = params.row.status === 1;
        return (
          <Box display="flex" alignItems="center" height="100%">
            <ModernSwitch
              checked={isActive}
              onChange={() => {
                handleUpdateStatus(params.row.id, isActive ? 0 : 1);
              }}
              trackColor={isActive ? '#4caf50' : '#ccc'}
            />
          </Box>
        );
      },
    },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', cursor: 'pointer' }}
            onClick={() => handleOpenEditModal(params.row)}
          >
            <EditIcon
              fontSize="small"
              sx={{ mr: 0.5, verticalAlign: 'middle' }}
            />{' '}
            Edit
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <Box display="flex" alignItems="center" height="100%" gap={1}>
          <Typography
            variant="body2"
            sx={{ color: 'primary.main', cursor: 'pointer' }}
            onClick={() => handleOpenPasswordModal(params.row)}
          >
            <EditIcon
              fontSize="small"
              sx={{ mr: 0.5, verticalAlign: 'middle' }}
            />{' '}
            Change Password
          </Typography>
        </Box>
      ),
    },
  ];

  if (isLoading || isLoadingStatus) {
    return <CustomLoader />;
  }

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as IConsultant[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Change Password${selectedConsultant ? ` - ${selectedConsultant.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitChangePassword)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-end',
              mt: 2,
              minWidth: '140px',
              maxWidth: '180px',
            }}
          >
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      <GenericModal
        isOpen={isEditModalOpen}
        onClose={() => handleCloseEditModal()}
        title="Edit Consultant"
        hideCancelButton
      >
        <Box p={2}>
          <Typography>Edit consultant form goes here.</Typography>
        </Box>
      </GenericModal>
    </>
  );
}

const ConsultantsListing = () => {
  const [createConsultantModalOpen, setCreateConsultantModalOpen] =
    useState(false);
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<IOption | null>(
    null
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const { showToast } = useToast();

  const handleOpenCreateConsultantModal = () => {
    setCreateConsultantModalOpen(true);
  };

  const handleCloseCreateConsultantModal = () => {
    setCreateConsultantModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedTimeZone(null);
  };

  const schema = Yup.object({
    name: Yup.string().required('Name is required'),
    mobile: Yup.string().required('Mobile is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Min 6 characters')
      .required('Password is required'),
    country: Yup.string().required('Country is required'),
    time_zone: Yup.string().when('country', {
      is: (country: string) =>
        !!country && (TIMEZONES_BY_COUNTRY[country] ?? []).length > 0,
      then: schema => schema.required('Time zone is required'),
      otherwise: schema => schema.notRequired().default(''),
    }),
    address: Yup.string().required('Address is required'),
    speciality: Yup.string().required('Speciality is required'),
    license_number: Yup.string().required('License number is required'),
    license_expiration: Yup.string().required('License expiration is required'),
    contracted_rate_per_consult: Yup.string().required('Rate is required'),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      time_zone: '',
    },
  });

  const onSubmitCreateConsultant = async (values: unknown) => {
    setIsLoadingStatus(true);
    const result = await AdminService.createConsultant({
      ...(values as Omit<ICreateConsultantPayload, 'role'>),
    });
    if (result.success) {
      setCreateConsultantModalOpen(false);
      // reset country and time zone
      setSelectedCountry(null);
      setSelectedTimeZone(null);
      reset();
    } else {
      showToast(result.message, 'error');
      console.error('Create consultant failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  if (isLoadingStatus) {
    return <CustomLoader />;
  }

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      gap={1}
    >
      <TabHeaderLayout
        leftNode={
          <Typography variant="h6" sx={{ padding: 0 }}>
            Consultants List
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateConsultantModal}
          >
            Add New Consultant
          </MorenButton>
        }
      />
      <UserTable />

      {/* Modal */}
      <GenericModal
        isOpen={createConsultantModalOpen}
        onClose={handleCloseCreateConsultantModal}
        title="Create New Consultant"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreateConsultant)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="Name"
            placeholder="Enter name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <ModernInput
            label="Mobile"
            placeholder="Enter mobile"
            {...register('mobile')}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
          />
          <ModernInput
            label="Email"
            placeholder="Enter email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <ModernInput
            label="Password"
            type="password"
            placeholder="Enter password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <ModernSelect
            label="Country"
            options={COUNTRIES_LIST}
            value={selectedCountry}
            onChange={opt => {
              setSelectedCountry(opt);
              setSelectedTimeZone(null);
              setValue('country', opt.label, { shouldValidate: true });
            }}
            fullWidth
            searchable
          />
          {errors.country && (
            <Typography color="error" variant="caption">
              {errors.country.message}
            </Typography>
          )}

          <ModernSelect
            label="Time Zone"
            options={
              selectedCountry
                ? TIMEZONES_BY_COUNTRY[selectedCountry.value] || []
                : []
            }
            value={selectedTimeZone}
            onChange={opt => {
              setSelectedTimeZone(opt);
              setValue('time_zone', opt.value, { shouldValidate: true });
            }}
            fullWidth
            searchable
          />
          {errors.time_zone && (
            <Typography color="error" variant="caption">
              {errors.time_zone.message}
            </Typography>
          )}

          <ModernInput
            label="Address"
            placeholder="Enter address"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <ModernInput
            label="Speciality"
            placeholder="Enter speciality"
            {...register('speciality')}
            error={!!errors.speciality}
            helperText={errors.speciality?.message}
          />
          <ModernInput
            label="License Number"
            placeholder="Enter license number"
            {...register('license_number')}
            error={!!errors.license_number}
            helperText={errors.license_number?.message}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              control={control}
              name="license_expiration"
              render={({ field }) => (
                <DatePicker
                  label="License Expiration"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date: dayjs.Dayjs | null) =>
                    setValue(
                      'license_expiration',
                      date ? date.format('YYYY-MM-DD') : '',
                      { shouldValidate: true }
                    )
                  }
                  slotProps={{
                    textField: {
                      error: !!errors.license_expiration,
                      helperText: errors.license_expiration?.message,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <ModernInput
            label="Rate per Consult"
            placeholder="Enter rate"
            {...register('contracted_rate_per_consult')}
            error={!!errors.contracted_rate_per_consult}
            helperText={errors.contracted_rate_per_consult?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-end',
              mt: 2,
              minWidth: '140px',
              maxWidth: '200px',
            }}
          >
            Create Consultant
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default ConsultantsListing;
