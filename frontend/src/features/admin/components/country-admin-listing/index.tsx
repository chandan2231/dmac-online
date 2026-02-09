import * as Yup from 'yup';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CustomLoader from '../../../../components/loader';
import AdminService from '../../admin.service';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import GenericModal from '../../../../components/modal';
import MorenButton from '../../../../components/button';
import ModernInput from '../../../../components/input';
import ModernSwitch from '../../../../components/switch';
import type { GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import ModernSelect, { type IOption } from '../../../../components/select';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { COUNTRIES_LIST } from '../../../../utils/constants';
import { useGetCountryAdminListing } from '../../hooks/useGetCountryAdminListing';
import type { ConsultantState, IConsultant } from '../../admin.interface';
import { get } from 'lodash';
import { useToast } from '../../../../providers/toast-provider';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useLanguageList } from '../../../../i18n/hooks/useGetLanguages';
import ModernMultiSelect from '../../../../components/multi-select';
import type { ILanguage } from '../../../../i18n/language.interface';

const FINANCE_MANAGER_LIST = [
  {
    id: 1,
    name: 'John Doe',
  },
  {
    id: 2,
    name: 'Jane Smith',
  },
];

const FINANCE_MANAGER_OPTIONS = FINANCE_MANAGER_LIST.map(fm => ({
  label: fm.name,
  value: String(fm.id),
}));

/* -------------------- SCHEMAS -------------------- */
const changePasswordSchema = Yup.object({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Min 6 characters'),
});
type ChangePasswordFormValues = Yup.InferType<typeof changePasswordSchema>;

const editCountryAdminSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Mobile is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  address: Yup.string().required('Address is required'),
  state: Yup.string().required('State is required'),
  finance_manager_id: Yup.string().required('Finance Manager is required'),
  languages: Yup.array()
    .min(1, 'Select at least one language')
    .required('Languages are required'),
  time_zone: Yup.string().required('Time zone is required'),
});
type EditCountryAdminFormValues = Yup.InferType<typeof editCountryAdminSchema>;

const createCountryAdminSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Mobile is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Min 6 characters')
    .required('Password is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  languages: Yup.array()
    .min(1, 'Select at least one language')
    .required('Languages are required'),
  finance_manager_id: Yup.string().required('Finance Manager is required'),
});
type CreateCountryAdminFormValues = Yup.InferType<
  typeof createCountryAdminSchema
>;

/* -------------------- USER TABLE -------------------- */
function CountryAdminTable() {
  const { data, isLoading, refetch } = useGetCountryAdminListing();
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'EXPERT', // Reusing expert languages for now, or should it be generic?
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCountryAdmin, setSelectedCountryAdmin] =
    useState<IConsultant | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [selectedFinanceManager, setSelectedFinanceManager] =
    useState<IOption | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);
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

  /* Edit Country Admin Form */
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditCountryAdminFormValues>({
    resolver: yupResolver(editCountryAdminSchema),
  });

  /* Handlers */
  const handleOpenPasswordModal = (user: IConsultant) => {
    setSelectedCountryAdmin(user);
    setIsPasswordModalOpen(true);
  };
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedCountryAdmin(null);
    resetPassword();
  };

  const handleOpenEditModal = (admin: ConsultantState) => {
    setSelectedCountryAdmin(admin);

    const selectedLangIds = admin.language
      ? admin.language.split(',').map(l => l.trim())
      : [];

    reset({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      address: admin.address,
      country: admin.country,
      state: admin.province_id,
      finance_manager_id: String(get(admin, 'finance_manager_id', '')),
      languages: selectedLangIds,
      time_zone: admin.time_zone,
    });

    const countryOpt = COUNTRIES_LIST.find(c => c.label === admin.country);
    setSelectedCountry(countryOpt || null);

    const stateOpt = COUNTRIES_LIST.find(
      c => c.label === admin.country
    )?.states.find(s => s.value === admin.province_id);

    setSelectedState(stateOpt || null);

    const fmOpt = FINANCE_MANAGER_OPTIONS.find(
      fm => fm.value === String(get(admin, 'finance_manager_id', ''))
    );
    setSelectedFinanceManager(fmOpt || null);

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCountryAdmin(null);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedFinanceManager(null);
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateCountryAdminStatus(id, status);
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
    if (!selectedCountryAdmin) return;
    setIsLoadingStatus(true);

    const result = await AdminService.updateCountryAdminPassword({
      id: selectedCountryAdmin.id,
      password: values.password,
    });

    if (result.success) {
      setIsPasswordModalOpen(false);
      setSelectedCountryAdmin(null);
      resetPassword();
      showToast('Password updated successfully', 'success');
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  const onSubmitEditCountryAdmin: SubmitHandler<
    EditCountryAdminFormValues
  > = async values => {
    if (!selectedCountryAdmin) return;
    setIsLoadingStatus(true);

    const timeZone =
      COUNTRIES_LIST.find(
        country => country.value === selectedCountry?.value
      )?.states.find(state => state.value === values.state)?.timeZone || '';

    const languages = values.languages.join(',');

    const payload = {
      ...values,
      languages,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    // exclude `state` before sending to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { state: _state, ...sanitizedPayload } = payload;

    const result = await AdminService.updateCountryAdmin({
      id: selectedCountryAdmin.id,
      ...sanitizedPayload,
    });

    if (result.success) {
      showToast('Country Admin updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedCountryAdmin(null);
      reset();
      await refetch();
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  const handleOpenViewModal = (admin: ConsultantState) => {
    setSelectedCountryAdmin(admin);
    setIsViewMode(true);
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
              onChange={() =>
                handleUpdateStatus(params.row.id, isActive ? 0 : 1)
              }
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
        const open = Boolean(anchorEl) && menuRowId === params.row.id;

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
          setMenuRowId(params.row.id);
        };

        const handleClose = () => {
          setAnchorEl(null);
          setMenuRowId(null);
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
                  handleOpenViewModal(params.row as ConsultantState);
                }}
              >
                View Details
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenEditModal(params.row as ConsultantState);
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

  if (isLoading || isLoadingStatus) return <CustomLoader />;

  return (
    <>
      <GenericTable
        rows={get(data, 'data', []) as IConsultant[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* Password Modal */}
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={`Change Password${selectedCountryAdmin ? ` - ${selectedCountryAdmin.name}` : ''}`}
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
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      {/* Edit Modal */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title={`Edit Country Admin${selectedCountryAdmin ? ` - ${selectedCountryAdmin.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitEditCountryAdmin)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection="row" gap={2}>
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
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.country && (
                <Typography color="error">{errors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(
                    country => country.value === selectedCountry?.value
                  )?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.state && (
                <Typography color="error">{errors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <Controller
                control={control}
                name="languages"
                render={({ field: { value, onChange } }) => {
                  const options =
                    get(listingResponse, 'data.languages', []).map(
                      (lang: ILanguage) => ({
                        label: lang.language,
                        value: String(lang.id),
                      })
                    ) || [];
                  return (
                    <ModernMultiSelect
                      label="Languages"
                      options={options}
                      value={value || []}
                      onChange={(selectedValues: string[]) => {
                        onChange(selectedValues);
                      }}
                      placeholder="Select languages"
                      fullWidth
                      searchable
                      error={!!errors.languages}
                      helperText={errors.languages?.message as string}
                    />
                  );
                }}
              />
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Finance Manager"
                options={FINANCE_MANAGER_OPTIONS}
                value={selectedFinanceManager}
                onChange={opt => {
                  setSelectedFinanceManager(opt);
                  setValue('finance_manager_id', opt.value, {
                    shouldValidate: true,
                  });
                }}
                fullWidth
                searchable
              />
              {errors.finance_manager_id && (
                <Typography color="error">
                  {errors.finance_manager_id.message}
                </Typography>
              )}
            </Box>
          </Box>

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Update Country Admin
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewMode}
        onClose={() => {
          setIsViewMode(false);
          setSelectedCountryAdmin(null);
        }}
        title={`Country Admin Details${
          selectedCountryAdmin
            ? ` - ${get(selectedCountryAdmin, 'name', '')}`
            : ''
        }`}
        hideCancelButton
      >
        {selectedCountryAdmin && (
          <Box display="flex" flexDirection="column" gap={2}>
            <Box
              display="flex"
              flexDirection="row"
              p={2}
              border="1px solid #e0e0e0"
              borderRadius="8px"
              bgcolor="#fafafa"
              width="100%"
              flexWrap="wrap"
              rowGap={1}
            >
              {/* Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'name', '')}
                </Typography>
              </Box>

              {/* Email */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'email', '')}
                </Typography>
              </Box>

              {/* Mobile */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Mobile:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'mobile', '')}
                </Typography>
              </Box>

              {/* Country */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'country', '')}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  State:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'province_title', '')}
                </Typography>
              </Box>

              {/* Time Zone */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Time Zone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'time_zone', '')}
                </Typography>
              </Box>

              {/* Address */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Address:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'address', '')}
                </Typography>
              </Box>

              {/* Speciality */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Speciality:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'speciality', '')}
                </Typography>
              </Box>

              {/* Rate per Consult */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Rate per Consult:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'contracted_rate_per_consult', '')}
                </Typography>
              </Box>

              {/* Status */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'status', 0) === 1
                    ? 'Active'
                    : 'Inactive'}
                </Typography>
              </Box>

              {/* Created Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Created Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'created_date', '')}
                </Typography>
              </Box>

              {/* Languages */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Languages:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedCountryAdmin, 'language_name', '')}
                </Typography>
              </Box>

              {/* Finance Manager */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Finance Manager:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {FINANCE_MANAGER_LIST.find(
                    fm =>
                      fm.id ===
                      Number(get(selectedCountryAdmin, 'finance_manager_id'))
                  )?.name || ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </GenericModal>
    </>
  );
}

/* -------------------- COUNTRY ADMIN LISTING -------------------- */
const CountryAdminListing = () => {
  const [createCountryAdminModalOpen, setCreateCountryAdminModalOpen] =
    useState(false);
  const { data: listingResponse } = useLanguageList({
    USER_TYPE: 'EXPERT',
  });
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [selectedFinanceManager, setSelectedFinanceManager] =
    useState<IOption | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createCountryAdminSchema),
    defaultValues: { state: '', languages: [] },
  });

  const handleOpenCreateCountryAdminModal = () =>
    setCreateCountryAdminModalOpen(true);
  const handleCloseCreateCountryAdminModal = () => {
    setCreateCountryAdminModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedFinanceManager(null);
  };

  const onSubmitCreateCountryAdmin: SubmitHandler<
    CreateCountryAdminFormValues
  > = async values => {
    setIsLoadingStatus(true);

    const timeZone =
      COUNTRIES_LIST.find(
        country => country.value === selectedCountry?.value
      )?.states.find(state => state.value === values.state)?.timeZone || '';

    const languages = values.languages.join(',');

    const payload = {
      ...values,
      languages,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    // exclude `state` before sending to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { state: _state, ...sanitizedPayload } = payload;

    const result = await AdminService.createCountryAdmin({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(sanitizedPayload as any),
    });

    if (result.success) {
      setCreateCountryAdminModalOpen(false);
      setSelectedCountry(null);
      setSelectedState(null);
      reset();
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  if (isLoadingStatus) return <CustomLoader />;

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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
            }}
          >
            Country Admins List
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateCountryAdminModal}
          >
            Add New Country Admin
          </MorenButton>
        }
      />

      <CountryAdminTable />

      {/* Create Country Admin Modal */}
      <GenericModal
        isOpen={createCountryAdminModalOpen}
        onClose={handleCloseCreateCountryAdminModal}
        title="Create New Country Admin"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreateCountryAdmin)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection="row" gap={2}>
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
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
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
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.country && (
                <Typography color="error">{errors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(
                    country => country.value === selectedCountry?.value
                  )?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {errors.state && (
                <Typography color="error">{errors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <ModernInput
              label="Address"
              placeholder="Enter address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Box>

          <Box display="flex" flexDirection="row" gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <Controller
                control={control}
                name="languages"
                render={({ field: { value, onChange } }) => {
                  const options =
                    get(listingResponse, 'data.languages', []).map(
                      (lang: ILanguage) => ({
                        label: lang.language,
                        value: String(lang.id),
                      })
                    ) || [];
                  return (
                    <ModernMultiSelect
                      label="Languages"
                      options={options}
                      value={value || []}
                      onChange={(selectedValues: string[]) => {
                        onChange(selectedValues);
                      }}
                      placeholder="Select languages"
                      fullWidth
                      searchable
                      error={!!errors.languages}
                      helperText={errors.languages?.message as string}
                    />
                  );
                }}
              />
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Finance Manager"
                options={FINANCE_MANAGER_OPTIONS}
                value={selectedFinanceManager}
                onChange={opt => {
                  setSelectedFinanceManager(opt);
                  setValue('finance_manager_id', opt.value, {
                    shouldValidate: true,
                  });
                }}
                fullWidth
                searchable
              />
              {errors.finance_manager_id && (
                <Typography color="error">
                  {errors.finance_manager_id.message}
                </Typography>
              )}
            </Box>
          </Box>
          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2 }}
          >
            Create Country Admin
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default CountryAdminListing;
