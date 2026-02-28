import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import CustomLoader from '../../../../components/loader';
import { TabHeaderLayout } from '../../../../components/tab-header';
import MorenButton from '../../../../components/button';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import ModernSelect, { type IOption } from '../../../../components/select';
import ModernSwitch from '../../../../components/switch';
import { GenericTable } from '../../../../components/table';
import { COUNTRIES_LIST } from '../../../../utils/constants';
import { useToast } from '../../../../providers/toast-provider';

import type {
  IAddMorePartnerUsersPayload,
  IChangePartnerPasswordPayload,
  ICreatePartnerPayload,
  IPartner,
  IPartnerAllowedUsersAddition,
  IUpdatePartnerPayload,
} from '../../partners.interface';
import PartnerService from '../../partners.service';
import { QUERY_KEYS_FOR_PARTNERS, useGetPartnersList } from '../../hooks/useGetPartnersList';

const changePasswordSchema = Yup.object({
  password: Yup.string().required('Password is required').min(6, 'Min 6 characters'),
});
type ChangePasswordFormValues = Yup.InferType<typeof changePasswordSchema>;

const editPartnerSchema = Yup.object({
  institution_name: Yup.string().required('Institution Name is required'),
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  price_per_user: Yup.number()
    .typeError('Price per user must be a number')
    .moreThan(0, 'Price per user must be greater than 0')
    .required('Price per user is required'),
  allowed_users: Yup.number()
    .typeError('Allowed users must be a number')
    .integer('Must be an integer')
    .min(0, 'Must be 0 or more')
    .max(50, 'Must be 50 or less')
    .required('Allowed users is required'),
});
type EditPartnerFormValues = Yup.InferType<typeof editPartnerSchema>;

const createPartnerSchema = Yup.object({
  institution_name: Yup.string().required('Institution Name is required'),
  name: Yup.string().required('Name is required'),
  mobile: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  address: Yup.string().required('Address is required'),
  zipcode: Yup.string().required('Zipcode is required'),
  price_per_user: Yup.number()
    .typeError('Price per user must be a number')
    .moreThan(0, 'Price per user must be greater than 0')
    .required('Price per user is required'),
  allowed_users: Yup.number()
    .typeError('Allowed users must be a number')
    .integer('Must be an integer')
    .min(0, 'Must be 0 or more')
    .max(50, 'Must be 50 or less')
    .required('Allowed users is required'),
});

type CreatePartnerFormValues = Yup.InferType<typeof createPartnerSchema>;

const addMoreUsersSchema = Yup.object({
  added_users: Yup.number()
    .typeError('Add users must be a number')
    .integer('Must be an integer')
    .min(1, 'Must be 1 or more')
    .required('Add users is required'),
  password: Yup.string().required('Password is required'),
});
type AddMoreUsersFormValues = Yup.InferType<typeof addMoreUsersSchema>;

const PartnersListing = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: partnersResponse, isLoading } = useGetPartnersList();

  const partners = useMemo<IPartner[]>(() => {
    if (!partnersResponse?.success) return [];
    return partnersResponse.data || [];
  }, [partnersResponse]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAddMoreUsersModalOpen, setIsAddMoreUsersModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const [additionsHistory, setAdditionsHistory] = useState<IPartnerAllowedUsersAddition[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);
  const [selectedState, setSelectedState] = useState<IOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePartnerFormValues>({
    resolver: yupResolver(createPartnerSchema),
    defaultValues: {
      institution_name: '',
      name: '',
      mobile: '',
      email: '',
      country: '',
      state: '',
      address: '',
      zipcode: '',
      allowed_users: 50,
      price_per_user: 19.99,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditPartnerFormValues>({
    resolver: yupResolver(editPartnerSchema),
    defaultValues: {
      institution_name: '',
      name: '',
      mobile: '',
      email: '',
      country: '',
      state: '',
      address: '',
      zipcode: '',
      allowed_users: 50,
      price_per_user: 19.99,
    },
  });

  const {
    register: registerAddMore,
    handleSubmit: handleSubmitAddMore,
    reset: resetAddMore,
    formState: { errors: addMoreErrors },
  } = useForm<AddMoreUsersFormValues>({
    resolver: yupResolver(addMoreUsersSchema),
    defaultValues: {
      added_users: 1,
      password: '',
    },
  });

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    partner: IPartner
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(partner.id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const openViewDetails = (partner: IPartner) => {
    setSelectedPartner(partner);
    setIsViewModalOpen(true);
  };

  const openChangePassword = (partner: IPartner) => {
    setSelectedPartner(partner);
    setIsPasswordModalOpen(true);
  };

  const openAddMoreUsers = async (partner: IPartner) => {
    setSelectedPartner(partner);
    setIsAddMoreUsersModalOpen(true);
    resetAddMore({ added_users: 1, password: '' });

    try {
      const historyResult = await PartnerService.getPartnerAddedUsersHistory(partner.id);
      if (historyResult.success) {
        setAdditionsHistory(historyResult.data || []);
      } else {
        setAdditionsHistory([]);
        showToast(historyResult.message, 'error');
      }
    } catch {
      setAdditionsHistory([]);
      showToast('Failed to fetch added users history.', 'error');
    }
  };

  const closeChangePassword = () => {
    setIsPasswordModalOpen(false);
    setSelectedPartner(null);
    resetPassword();
  };

  const closeAddMoreUsers = () => {
    setIsAddMoreUsersModalOpen(false);
    setSelectedPartner(null);
    resetAddMore();
    setAdditionsHistory([]);
  };

  const openEditPartner = (partner: IPartner) => {
    setSelectedPartner(partner);

    resetEdit({
      institution_name: partner.institution_name ?? '',
      name: partner.name ?? '',
      email: partner.email ?? '',
      mobile: String(partner.phone ?? ''),
      address: String(partner.address ?? ''),
      country: String(partner.country ?? ''),
      state: String(partner.province_id ?? ''),
      zipcode: String(partner.zipcode ?? ''),
      allowed_users: Math.min(Number(partner.allowed_users ?? 50), 50),
      price_per_user: Number(partner.price_per_user ?? 19.99),
    });

    const countryOpt = COUNTRIES_LIST.find(c => c.label === partner.country);
    setSelectedCountry(countryOpt || null);

    const stateOpt = COUNTRIES_LIST.find(c => c.label === partner.country)?.states.find(
      s => s.value === partner.province_id
    );
    setSelectedState(stateOpt || null);

    setIsEditModalOpen(true);
  };

  const closeEditPartner = () => {
    setIsEditModalOpen(false);
    setSelectedPartner(null);
    resetEdit();
    setSelectedCountry(null);
    setSelectedState(null);
  };

  const columns: GridColDef<IPartner>[] = [
      { field: 'institution_name', headerName: 'Institution Name', flex: 1, minWidth: 220 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => String(row?.phone ?? ''),
      },
      {
        field: 'address',
        headerName: 'Address',
        flex: 1,
        minWidth: 220,
        valueGetter: (_value, row) => String(row?.address ?? ''),
      },
      {
        field: 'allowed_users',
        headerName: 'Allowed Athletes',
        flex: 0.6,
        minWidth: 120,
      },
      {
        field: 'active_users',
        headerName: 'Active Athletes',
        flex: 0.6,
        minWidth: 120,
      },
      {
        field: 'remaining_users',
        headerName: 'Remaining Athletes',
        flex: 0.7,
        minWidth: 140,
      },
      {
        field: 'price_per_user',
        headerName: 'Price / User',
        flex: 0.6,
        minWidth: 120,
        valueGetter: (_value, row) => {
          const n = Number(row?.price_per_user ?? 0);
          if (!Number.isFinite(n) || n <= 0) return '';
          return `$${n.toFixed(2)}`;
        },
      },
      {
        field: 'created_date',
        headerName: 'Added Date',
        flex: 0.7,
        minWidth: 140,
        valueGetter: (_value, row) => String(row?.created_date ?? ''),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        minWidth: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams<IPartner>) => {
          const isActive = Number(params.row?.status) === 1;
          return (
            <Box display="flex" alignItems="center" height="100%">
              <ModernSwitch
                checked={isActive}
                onChange={async () => {
                  try {
                    const nextStatus = isActive ? 0 : 1;
                    const result = await PartnerService.changePartnerStatus(
                      Number(params.row.id),
                      nextStatus
                    );
                    if (result.success) {
                      showToast('Partner status updated.', 'success');
                      queryClient.invalidateQueries({
                        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
                      });
                    } else {
                      showToast(result.message, 'error');
                    }
                  } catch {
                    showToast('Failed to update status.', 'error');
                  }
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
        width: 120,
        headerClassName: 'sticky-right--header',
        cellClassName: 'sticky-right--cell',
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<IPartner>) => {
          const open = Boolean(anchorEl) && menuRowId === params.row.id;

          return (
            <>
              <IconButton
                aria-label="actions"
                size="small"
                onClick={e => handleOpenMenu(e, params.row)}
              >
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  elevation: 6,
                  sx: { minWidth: 220, borderRadius: 2 },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openViewDetails(params.row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <VisibilityOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText primary="View Details" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openEditPartner(params.row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <EditOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText primary="Edit" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openChangePassword(params.row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <LockResetOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText primary="Change Password" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    openAddMoreUsers(params.row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <GroupAddOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText primary="Add More Athletes" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
  ];

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    reset();
    setSelectedCountry(null);
    setSelectedState(null);
  };

  const onSubmitChangePassword: SubmitHandler<ChangePasswordFormValues> = async values => {
    if (!selectedPartner) return;
    setIsSubmitting(true);

    const payload: IChangePartnerPasswordPayload = {
      id: selectedPartner.id,
      password: values.password,
    };

    const result = await PartnerService.changePartnerPassword(payload);
    if (result.success) {
      showToast('Password updated successfully', 'success');
      closeChangePassword();
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  const onSubmitEditPartner: SubmitHandler<EditPartnerFormValues> = async values => {
    if (!selectedPartner) return;
    setIsSubmitting(true);

    const timeZone =
      COUNTRIES_LIST.find(country => country.value === selectedCountry?.value)
        ?.states.find(state => state.value === values.state)?.timeZone || '';

    const payload: IUpdatePartnerPayload = {
      id: selectedPartner.id,
      ...values,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    const result = await PartnerService.updatePartner(payload);
    if (result.success) {
      showToast('Partner updated successfully', 'success');
      closeEditPartner();
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
      });
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  const onSubmitCreatePartner: SubmitHandler<CreatePartnerFormValues> = async (
    values
  ) => {
    setIsSubmitting(true);

    const timeZone =
      COUNTRIES_LIST.find(country => country.value === selectedCountry?.value)
        ?.states.find(state => state.value === values.state)?.timeZone || '';

    const payload: ICreatePartnerPayload = {
      ...values,
      time_zone: timeZone,
      provinceValue: selectedState?.value || '',
      provinceTitle: selectedState?.label || '',
    };

    const result = await PartnerService.createPartner(payload);
    if (result.success) {
      showToast('Partner created successfully. Email sent.', 'success');
      handleCloseCreateModal();
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
      });
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  const onSubmitAddMoreUsers: SubmitHandler<AddMoreUsersFormValues> = async values => {
    if (!selectedPartner) return;
    setIsSubmitting(true);

    const payload: IAddMorePartnerUsersPayload = {
      partner_id: selectedPartner.id,
      added_users: Number(values.added_users),
      password: values.password,
    };

    const result = await PartnerService.addMorePartnerUsers(payload);
    if (result.success) {
      showToast('Athletes added successfully', 'success');
      const historyResult = await PartnerService.getPartnerAddedUsersHistory(
        selectedPartner.id
      );
      if (historyResult.success) setAdditionsHistory(historyResult.data || []);

      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
      });
      resetAddMore({ added_users: 1, password: '' });
    } else {
      showToast(result.message, 'error');
    }

    setIsSubmitting(false);
  };

  if (isLoading || isSubmitting) return <CustomLoader />;

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%" p={2}>
      <TabHeaderLayout
        leftNode={
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Partners list
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              bgcolor: theme => theme.palette.action.hover,
              color: theme => theme.palette.text.primary,
              borderRadius: 2,
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: theme => theme.palette.action.selected,
              },
            }}
          >
            Add Partner
          </MorenButton>
        }
      />

      <Box sx={{ mt: 2 }}>
        <GenericTable
          rows={partners}
          columns={columns}
          rowIdKey="id"
          disableVirtualization
        />
      </Box>

      <GenericModal
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        title="Add Partner"
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitCreatePartner)}
          display="flex"
          flexDirection="column"
          gap={2}
          style={{ marginTop: '2rem' }}
        >
          <ModernInput
            label="Institution Name"
            placeholder="Enter Institution Name"
            {...register('institution_name')}
            error={!!errors.institution_name}
            helperText={errors.institution_name?.message}
          />
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Name"
              placeholder="Enter name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <ModernInput
              label="Email"
              placeholder="Enter email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Box>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={1}>
            <ModernInput
              label="Phone"
              placeholder="Enter phone"
              {...register('mobile')}
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
            />
          </Box>
          <ModernInput
            label="Price Per User"
            placeholder="Enter price per user"
            inputMode="decimal"
            {...register('price_per_user')}
            error={!!errors.price_per_user}
            helperText={errors.price_per_user?.message}
          />
          <ModernInput
            label="Address"
            placeholder="Enter address"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
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
                  COUNTRIES_LIST.find(c => c.value === selectedCountry?.value)
                    ?.states || []
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
            <Box>
              <ModernInput
                label="Zipcode"
                placeholder="Enter zipcode"
                {...register('zipcode')}
                error={!!errors.zipcode}
                helperText={errors.zipcode?.message}
                style={{marginTop: '1.6rem'}}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            
            <ModernInput
              label="Allowed Athletes"
              placeholder="Enter allowed athletes"
              inputMode="numeric"
              {...register('allowed_users')}
              error={!!errors.allowed_users}
              helperText={errors.allowed_users?.message}
            />
          </Box>

          <MorenButton type="submit" variant="contained">
            Create Partner
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Details */}
      <GenericModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPartner(null);
        }}
        title={`Partner Details${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
        hideSubmitButton
        cancelButtonText="Close"
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedPartner(null);
        }}
      >
        {selectedPartner && (
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
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.name}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Email:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.email}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Phone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.phone ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Country:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.country ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  State:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.province_title ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Time Zone:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.time_zone ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Address:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.address ?? ''}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Allowed Athletes:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.allowed_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Active Athletes:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.active_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Remaining Athletes:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.remaining_users ?? 0}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Price Per Athlete:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {(() => {
                    const n = Number(selectedPartner.price_per_user ?? 0);
                    if (!Number.isFinite(n) || n <= 0) return '';
                    return `$${n.toFixed(2)}`;
                  })()}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Status:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {Number(selectedPartner.status) === 1 ? 'Active' : 'Inactive'}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography variant="body2" color="textSecondary" minWidth={120}>
                  Added Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {selectedPartner.created_date ?? ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </GenericModal>

      {/* Change Password */}
      <GenericModal
        isOpen={isPasswordModalOpen}
        onClose={closeChangePassword}
        title={`Change Password${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
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

          <MorenButton type="submit" variant="contained" sx={{ alignSelf: 'flex-end', mt: 2 }}>
            Update Password
          </MorenButton>
        </Box>
      </GenericModal>

      {/* Edit Partner */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={closeEditPartner}
        title={`Edit Partner${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmitEdit(onSubmitEditPartner)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Name"
              {...registerEdit('name')}
              error={!!editErrors.name}
              helperText={editErrors.name?.message}
            />
            <ModernInput
              label="Phone"
              {...registerEdit('mobile')}
              error={!!editErrors.mobile}
              helperText={editErrors.mobile?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Email"
              {...registerEdit('email')}
              error={!!editErrors.email}
              helperText={editErrors.email?.message}
            />
            <ModernInput
              label="Zipcode"
              {...registerEdit('zipcode')}
              error={!!editErrors.zipcode}
              helperText={editErrors.zipcode?.message}
            />
          </Box>

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="Country"
                options={COUNTRIES_LIST}
                value={selectedCountry}
                onChange={opt => {
                  setSelectedCountry(opt);
                  setSelectedState(null);
                  setEditValue('country', opt.label, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {editErrors.country && (
                <Typography color="error">{editErrors.country.message}</Typography>
              )}
            </Box>

            <Box display="flex" flexDirection="column" flex={1}>
              <ModernSelect
                label="State"
                options={
                  COUNTRIES_LIST.find(c => c.value === selectedCountry?.value)
                    ?.states || []
                }
                value={selectedState}
                onChange={opt => {
                  setSelectedState(opt);
                  setEditValue('state', opt.value, { shouldValidate: true });
                }}
                fullWidth
                searchable
              />
              {editErrors.state && (
                <Typography color="error">{editErrors.state.message}</Typography>
              )}
            </Box>
          </Box>

          <ModernInput
            label="Address"
            {...registerEdit('address')}
            error={!!editErrors.address}
            helperText={editErrors.address?.message}
          />

          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
            <ModernInput
              label="Allowed Athletes"
              inputMode="numeric"
              {...registerEdit('allowed_users')}
              error={!!editErrors.allowed_users}
              helperText={editErrors.allowed_users?.message}
            />
            <ModernInput
              label="Price Per User"
              inputMode="decimal"
              {...registerEdit('price_per_user')}
              error={!!editErrors.price_per_user}
              helperText={editErrors.price_per_user?.message}
            />
          </Box>

          <MorenButton type="submit" variant="contained">
            Update Partner
          </MorenButton>
        </Box>
      </GenericModal>

      {/* Add More Athletes */}
      <GenericModal
        isOpen={isAddMoreUsersModalOpen}
        onClose={closeAddMoreUsers}
        title={`Add More Athletes${selectedPartner ? ` - ${selectedPartner.name}` : ''}`}
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmitAddMore(onSubmitAddMoreUsers)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="Add Athletes"
            type="number"
            inputMode="numeric"
            required
            {...registerAddMore('added_users')}
            error={!!addMoreErrors.added_users}
            helperText={addMoreErrors.added_users?.message}
          />

          <ModernInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            {...registerAddMore('password')}
            error={!!addMoreErrors.password}
            helperText={addMoreErrors.password?.message}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 1, minWidth: 120 }}
            >
              Submit
            </Button>
          </Box>

          <Box mt={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Added Athlete History
            </Typography>

            {additionsHistory.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No records found.
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={1}>
                {additionsHistory.map(item => (
                  <Box
                    key={item.id}
                    display="flex"
                    justifyContent="space-between"
                    p={1.5}
                    border="1px solid #e0e0e0"
                    borderRadius="8px"
                  >
                    <Typography variant="body2">
                      Added Athletes: <strong>{item.added_users}</strong>
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.added_date}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </GenericModal>
    </Box>
  );
};

export default PartnersListing;
