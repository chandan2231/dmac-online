import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import ModernSelect, { type IOption } from '../../../../components/select';
import MorenButton from '../../../../components/button';
import * as Yup from 'yup';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  COUNTRIES_LIST,
  TIMEZONES_BY_COUNTRY,
} from '../../../../utils/constants';
import ModernSwitch from '../../../../components/switch';
import type {
  ITherapist,
  ICreateTherapistPayload,
  TherapistState,
} from '../../admin.interface';
import { get } from 'lodash';
import CustomLoader from '../../../../components/loader';
import AdminService from '../../admin.service';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useToast } from '../../../../providers/toast-provider';
import { useGetTherapistListing } from '../../hooks/useGetTherapistListing';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';

/* -------------------- SCHEMAS -------------------- */
const changePasswordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Min 6 characters'),
});
type ChangePasswordFormValues = Yup.InferType<typeof changePasswordSchema>;

const editTherapistSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Mobile is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  time_zone: Yup.string().required('Time zone is required'),
  address: Yup.string().required('Address is required'),
  speciality: Yup.string().required('Speciality is required'),
  license_number: Yup.string().required('License number is required'),
  license_expiration: Yup.string().required('License expiration is required'),
  contracted_rate_per_consult: Yup.string().required('Rate is required'),
});
type EditTherapistFormValues = Yup.InferType<typeof editTherapistSchema>;

const createTherapistSchema = Yup.object({
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
type CreateTherapistFormValues = Yup.InferType<typeof createTherapistSchema>;

/* -------------------- USER TABLE -------------------- */
function UserTable() {
  const { data, isLoading, refetch } = useGetTherapistListing();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<ITherapist | null>(
    null
  );
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<IOption | null>(
    null
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const { showToast } = useToast();

  /* Password Form */
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  });

  /* Edit Therapist Form */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditTherapistFormValues>({
    resolver: yupResolver(editTherapistSchema),
  });

  /* Handlers */
  const handleOpenPasswordModal = (user: ITherapist) => {
    setSelectedTherapist(user);
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedTherapist(null);
    resetPassword();
  };

  const handleOpenEditModal = (therapist: TherapistState) => {
    setSelectedTherapist(therapist);

    // populate edit form
    reset({
      name: therapist.name,
      email: therapist.email,
      mobile: therapist.mobile,
      address: therapist.address,
      speciality: therapist.speciality,
      license_number: therapist.license_number,
      license_expiration: therapist.license_expiration,
      contracted_rate_per_consult: therapist.contracted_rate_per_consult,
      country: therapist.country,
      time_zone: therapist.time_zone,
    });

    const countryOpt = COUNTRIES_LIST.find(c => c.label === therapist.country);
    setSelectedCountry(countryOpt || null);

    const tzOpt = countryOpt
      ? (TIMEZONES_BY_COUNTRY[countryOpt.value] || []).find(
          tz => tz.value === therapist.time_zone
        )
      : null;
    setSelectedTimeZone(tzOpt || null);

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTherapist(null);
    reset();
    setSelectedCountry(null);
    setSelectedTimeZone(null);
  };

  const handleOpenViewModal = (therapist: TherapistState) => {
    setSelectedTherapist(therapist);
    setIsViewMode(true);
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateTherapistStatus(id, status);
    if (result.success) {
      await refetch();
    } else {
      console.error('Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const onSubmitChangePassword: SubmitHandler<
    ChangePasswordFormValues
  > = async values => {
    if (!selectedTherapist) return;
    setIsLoadingStatus(true);
    const result = await AdminService.updateTherapistPassword({
      id: selectedTherapist.id,
      password: values.password,
    });
    if (result.success) {
      setIsPasswordModalOpen(false);
      setSelectedTherapist(null);
      resetPassword();
      showToast('Password updated successfully', 'success');
    } else {
      showToast(result.message, 'error');
      console.error('Change password failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const onSubmitEditTherapist: SubmitHandler<
    EditTherapistFormValues
  > = async values => {
    if (!selectedTherapist) return;
    setIsLoadingStatus(true);

    const payload: ICreateTherapistPayload = {
      ...(values as unknown as ICreateTherapistPayload),
    };

    const result = await AdminService.updateTherapist({
      id: selectedTherapist.id,
      ...payload,
    });

    if (result.success) {
      showToast('Therapist updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedTherapist(null);
      reset();
      await refetch();
    } else {
      showToast(result.message, 'error');
      console.error('Update therapist failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  const columns: GridColDef<ITherapist>[] = [
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
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: params => {
        const open = Boolean(anchorEl);

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
          setAnchorEl(null);
        };

        return (
          <>
            <IconButton aria-label="actions" onClick={handleClick} size="small">
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
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
                  handleClose();
                  handleOpenViewModal(params.row as TherapistState);
                }}
              >
                View Details
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenEditModal(params.row as TherapistState);
                }}
              >
                Edit
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenPasswordModal(params.row);
                }}
              >
                Change Password
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  if (isLoading || isLoadingStatus) {
    return <CustomLoader />;
  }

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as ITherapist[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* Password Modal */}
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Change Password${selectedTherapist ? ` - ${selectedTherapist.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmitPassword(onSubmitChangePassword)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...registerPassword('password')}
            error={!!passwordErrors.password}
            helperText={passwordErrors.password?.message}
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

      {/* Edit Modal */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={`Edit Therapist${selectedTherapist ? ` - ${selectedTherapist.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitEditTherapist)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <ModernInput
            label="Mobile"
            {...register('mobile')}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
          />
          <ModernInput
            label="Email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
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
            <Typography color="error">{errors.country.message}</Typography>
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
            <Typography color="error">{errors.time_zone.message}</Typography>
          )}

          <ModernInput
            label="Address"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <ModernInput
            label="Speciality"
            {...register('speciality')}
            error={!!errors.speciality}
            helperText={errors.speciality?.message}
          />
          <ModernInput
            label="License Number"
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
                  onChange={date =>
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
            {...register('contracted_rate_per_consult')}
            error={!!errors.contracted_rate_per_consult}
            helperText={errors.contracted_rate_per_consult?.message}
          />

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Update Therapist
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewMode}
        onClose={() => {
          setIsViewMode(false);
          setSelectedTherapist(null);
        }}
        title={`Therapist Details${
          selectedTherapist ? ` - ${get(selectedTherapist, 'name', '')}` : ''
        }`}
        hideCancelButton
      >
        {selectedTherapist && (
          <Box display="flex" flexDirection="column" gap={2}>
            <ModernInput
              label="Name"
              value={get(selectedTherapist, 'name', '')}
              disabled
            />
            <ModernInput
              label="Email"
              value={get(selectedTherapist, 'email', '')}
              disabled
            />
            <ModernInput
              label="Mobile"
              value={get(selectedTherapist, 'mobile', '')}
              disabled
            />

            {/* Country as text */}
            <ModernInput
              label="Country"
              value={get(selectedTherapist, 'country', '')}
              disabled
            />

            {/* Time Zone as text */}
            <ModernInput
              label="Time Zone"
              value={get(selectedTherapist, 'time_zone', '')}
              disabled
            />

            <ModernInput
              label="Address"
              value={get(selectedTherapist, 'address', '')}
              disabled
            />
            <ModernInput
              label="Speciality"
              value={get(selectedTherapist, 'speciality', '')}
              disabled
            />
            <ModernInput
              label="License Number"
              value={get(selectedTherapist, 'license_number', '')}
              disabled
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="License Expiration"
                value={
                  get(selectedTherapist, 'license_expiration')
                    ? dayjs(get(selectedTherapist, 'license_expiration'))
                    : null
                }
                disabled
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>

            <ModernInput
              label="Rate per Consult"
              value={get(selectedTherapist, 'contracted_rate_per_consult', '')}
              disabled
            />
            <ModernInput
              label="Status"
              value={
                get(selectedTherapist, 'status', 0) === 1
                  ? 'Active'
                  : 'Inactive'
              }
              disabled
            />
            <ModernInput
              label="Created Date"
              value={get(selectedTherapist, 'created_date', '')}
              disabled
            />
          </Box>
        )}
      </GenericModal>
    </>
  );
}

/* -------------------- THERAPISTS LISTING -------------------- */
const TherapistListing = () => {
  const [createTherapistModalOpen, setCreateTherapistModalOpen] =
    useState(false);
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<IOption | null>(
    null
  );
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const { showToast } = useToast();

  const handleOpenCreateTherapistModal = () => {
    setCreateTherapistModalOpen(true);
  };

  const handleCloseCreateTherapistModal = () => {
    setCreateTherapistModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedTimeZone(null);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createTherapistSchema),
    defaultValues: {
      time_zone: '',
    },
  });

  const onSubmitCreateTherapist: SubmitHandler<
    CreateTherapistFormValues
  > = async values => {
    setIsLoadingStatus(true);
    const result = await AdminService.createTherapist({
      ...(values as Omit<ICreateTherapistPayload, 'role'>),
    });
    if (result.success) {
      setCreateTherapistModalOpen(false);
      // reset country and time zone
      setSelectedCountry(null);
      setSelectedTimeZone(null);
      reset();
    } else {
      showToast(result.message, 'error');
      console.error('Create therapist failed:', result.message);
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
            Therapist List
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateTherapistModal}
          >
            Add New Therapist
          </MorenButton>
        }
      />
      <UserTable />

      {/* Create Therapist Modal */}
      <GenericModal
        isOpen={createTherapistModalOpen}
        onClose={handleCloseCreateTherapistModal}
        title="Create New Therapist"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreateTherapist)}
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
            Create Therapist
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default TherapistListing;
