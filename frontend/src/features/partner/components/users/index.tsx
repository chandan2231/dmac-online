import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Yup from 'yup';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Typography,
  Paper,
  InputLabel,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { TabHeaderLayout } from '../../../../components/tab-header';
import MorenButton from '../../../../components/button';
import ModernInput from '../../../../components/input';
import ModernSelect, { type IOption } from '../../../../components/select';
import GenericModal from '../../../../components/modal';
import CustomLoader from '../../../../components/loader';
import { GenericTable } from '../../../../components/table';
import { useToast } from '../../../../providers/toast-provider';
import { COUNTRIES_LIST } from '../../../../utils/constants';
import {
  convertLanguagesListToOptions,
  getUserEnvironmentInfo,
} from '../../../../utils/functions';
import { useLanguageList } from '../../../../i18n/hooks/useGetLanguages';
import PartnerPortalService, { type PartnerUserRow } from '../../partnerPortal.service';
import type { GridColDef } from '@mui/x-data-grid';
import { get } from 'lodash';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../router/router';

type PartnerUser = PartnerUserRow;

type UserFormValues = {
  name: string;
  email: string;
  mobile: string;
  area: string;
  zipCode: string;
  language: IOption;
  country: IOption;
  state: IOption;
  weight: number;
  weightUnit: string;
  height: number;
  heightUnit: string;
};

const optionShape = Yup.object({
  label: Yup.string().required(),
  value: Yup.string().required('This field is required'),
});

const createSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  area: Yup.string().required('Area is required'),
  zipCode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zip Code must be 5 or 6 digits')
    .required('Zip Code is required'),
  language: optionShape,
  country: optionShape,
  state: optionShape,
  weight: Yup.number().typeError('Weight must be a number').required('Weight is required'),
  weightUnit: Yup.string().required('Weight unit is required'),
  height: Yup.number().typeError('Height must be a number').required('Height is required'),
  heightUnit: Yup.string().required('Height unit is required'),
});

type EditFormValues = Omit<UserFormValues, 'password' | 'confirmPassword' | 'email'>;

const editSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  area: Yup.string().required('Area is required'),
  zipCode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zip Code must be 5 or 6 digits')
    .required('Zip Code is required'),
  language: optionShape,
  country: optionShape,
  state: optionShape,
  weight: Yup.number().typeError('Weight must be a number').required('Weight is required'),
  weightUnit: Yup.string().required('Weight unit is required'),
  height: Yup.number().typeError('Height must be a number').required('Height is required'),
  heightUnit: Yup.string().required('Height unit is required'),
});

type ChangePasswordValues = {
  newPassword: string;
  confirmNewPassword: string;
};

const changePasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const QUERY_KEYS = {
  USERS: ['partner-portal', 'users'] as const,
  SUMMARY: ['partner-portal', 'users-summary'] as const,
};

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: theme => `1px solid ${theme.palette.divider}`,
      bgcolor: theme => theme.palette.background.paper,
    }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 900, mt: 0.5 }}>
      {value}
    </Typography>
  </Paper>
);

export default function PartnerUsers() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const { data: languageListing } = useLanguageList({ USER_TYPE: 'USER' });
  const languageOptions = useMemo(() => {
    const languages = get(languageListing, ['data', 'languages'], []);
    return convertLanguagesListToOptions(languages);
  }, [languageListing]);

  const [addOpen, setAddOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PartnerUser | null>(null);

  const [addModalMode, setAddModalMode] = useState<'create-user' | 'purchase-slots'>('create-user');
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
  const paypalRef = useRef<HTMLDivElement | null>(null);
  const paypalButtonsRef = useRef<{ close?: () => void } | null>(null);
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | null>(null);
  const purchaseOrderIdRef = useRef<string | null>(null);
  useEffect(() => {
    purchaseOrderIdRef.current = purchaseOrderId;
  }, [purchaseOrderId]);

  const destroyPaypalButtons = useCallback(() => {
    try {
      paypalButtonsRef.current?.close?.();
    } catch {
      // ignore
    }
    paypalButtonsRef.current = null;
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
  }, []);

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: QUERY_KEYS.SUMMARY,
    queryFn: () => PartnerPortalService.getUsersSummary(),
  });

  const unitPrice = useMemo(() => {
    const n = Number(summary?.price_per_user ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 19.99;
  }, [summary?.price_per_user]);

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: () => PartnerPortalService.listUsers(),
  });

  useEffect(() => {
    const shouldRefresh = Boolean((location.state as { refresh?: boolean } | null)?.refresh);
    if (!shouldRefresh) return;
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUMMARY });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
  }, [location.state, queryClient]);

  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: yupResolver(createSchema),
    defaultValues: {
      language: { label: '', value: '' },
      country: { label: '', value: '' },
      state: { label: '', value: '' },
      weightUnit: 'kg',
      heightUnit: 'cm',
      weight: 0,
      height: 0,
      area: '',
      zipCode: '',
      name: '',
      email: '',
      mobile: '',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    control: controlEdit,
    setValue: setValueEdit,
    watch: watchEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditFormValues>({
    resolver: yupResolver(editSchema),
    defaultValues: {
      language: { label: '', value: '' },
      country: { label: '', value: '' },
      state: { label: '', value: '' },
      weightUnit: 'kg',
      heightUnit: 'cm',
      weight: 0,
      height: 0,
      area: '',
      zipCode: '',
      name: '',
      mobile: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordValues>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const selectedCountry = watch('country');
  const countryStates = useMemo(() => {
    const c = COUNTRIES_LIST.find(x => x.value === selectedCountry?.value);
    return c?.states ?? [];
  }, [selectedCountry?.value]);

  const selectedCountryEdit = watchEdit('country');
  const countryStatesEdit = useMemo(() => {
    const c = COUNTRIES_LIST.find(x => x.value === selectedCountryEdit?.value);
    return c?.states ?? [];
  }, [selectedCountryEdit?.value]);

  const openAdd = () => {
    if (isLoadingSummary || !summary) {
      showToast('Please wait, loading user limits...', 'info');
      return;
    }
    if (Number(summary?.remaining_users ?? 0) <= 0) {
      setAddModalMode('purchase-slots');
      setAddOpen(true);
      return;
    }
    setAddModalMode('create-user');
    setAddOpen(true);
  };

  const {
    register: registerPurchase,
    handleSubmit: handleSubmitPurchase,
    watch: watchPurchase,
    reset: resetPurchase,
    formState: { errors: purchaseErrors },
  } = useForm<{ usersToAdd: number }>({
    resolver: yupResolver(
      Yup.object({
        usersToAdd: Yup.number()
          .typeError('Users must be a number')
          .integer('Users must be a whole number')
          .positive('Users must be a positive number')
          .max(100, 'Maximum users you can add is 100')
          .test('multiple-of-10', 'You can add users only in multiples of 10.', v => {
            const n = Number(v);
            return Number.isFinite(n) && n % 10 === 0;
          })
          .required('Users is required'),
      })
    ),
    defaultValues: { usersToAdd: 10 },
  });

  const usersToAdd = watchPurchase('usersToAdd');
  const usersToAddNum = Number(usersToAdd);
  const isUsersToAddValid =
    Number.isFinite(usersToAddNum) && usersToAddNum > 0 && usersToAddNum <= 100 && usersToAddNum % 10 === 0;
  const amountToPay = isUsersToAddValid ? Number((usersToAddNum * unitPrice).toFixed(2)) : 0;

  const purchaseSnapshotRef = useRef<{ unitPrice: number; amountToPay: number } | null>(null);

  const closeAddModal = useCallback(() => {
    setAddOpen(false);
    setAddModalMode('create-user');
    setPaypalSdkReady(false);
    setPurchaseOrderId(null);
    purchaseSnapshotRef.current = null;
    destroyPaypalButtons();
    resetPurchase();
  }, [destroyPaypalButtons, resetPurchase]);

  // Load PayPal SDK only when purchase modal is open.
  useEffect(() => {
    const isOpen = addOpen && addModalMode === 'purchase-slots';
    if (!isOpen) return;

    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!PAYPAL_CLIENT_ID) {
      console.error('Missing PayPal client id (VITE_PAYPAL_CLIENT_ID).');
      return;
    }

    if (window.paypal) {
      setPaypalSdkReady(true);
      return;
    }

    const scriptId = 'paypal-sdk';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const onLoad = () => setPaypalSdkReady(true);
    const onError = (err: unknown) => {
      console.error('Failed to load PayPal SDK:', err);
      showToast('Failed to load payment provider. Please try again.', 'error');
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.async = true;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        PAYPAL_CLIENT_ID
      )}&components=buttons`;
      script.addEventListener('load', onLoad);
      script.addEventListener('error', onError);
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);
    }

    return () => {
      existingScript?.removeEventListener('load', onLoad);
      existingScript?.removeEventListener('error', onError);
    };
  }, [addOpen, addModalMode, showToast]);

  // Render PayPal buttons when ready + valid count.
  useEffect(() => {
    if (!(addOpen && addModalMode === 'purchase-slots')) return;
    if (!paypalSdkReady) return;
    if (!paypalRef.current) return;
    if (!window.paypal) return;

    if (!isUsersToAddValid) {
      destroyPaypalButtons();
      return;
    }

    destroyPaypalButtons();

    const container = paypalRef.current;
    if (!container) return;

    const buttons = window.paypal.Buttons({
      createOrder: async () => {
        const response = await PartnerPortalService.createUserSlotsPayment({
          usersToAdd: usersToAddNum,
        });
        if (!response?.success || !response.orderId) {
          throw new Error(response?.message || 'PAYMENT_CREATE_FAILED');
        }

        if (Number.isFinite(Number(response.unitPrice)) && Number.isFinite(Number(response.amountToPay))) {
          purchaseSnapshotRef.current = {
            unitPrice: Number(response.unitPrice),
            amountToPay: Number(response.amountToPay),
          };
        } else {
          purchaseSnapshotRef.current = null;
        }

        setPurchaseOrderId(response.orderId);
        return response.orderId;
      },

      onApprove: async (data: unknown) => {
        const { orderID, payerID } = data as { orderID: string; payerID: string };
        try {
          await PartnerPortalService.captureUserSlotsPayment({
            orderId: orderID,
            payerId: payerID,
            currencyCode: 'USD',
          });

          closeAddModal();
          navigate(ROUTES.PARTNER_PURCHASE_SUCCESS, {
            state: {
              orderID,
              addedUsers: usersToAddNum,
              amount: Number(purchaseSnapshotRef.current?.amountToPay ?? amountToPay).toFixed(2),
            },
          });
        } catch (err) {
          console.error('Partner purchase capture failed:', err);
          showToast('Payment capture failed. Please try again.', 'error');
        }
      },

      onCancel: async (data: unknown) => {
        const { orderID } = (data || {}) as { orderID?: string };
        const orderId = orderID || purchaseOrderIdRef.current;
        if (orderId) {
          try {
            await PartnerPortalService.cancelUserSlotsPayment({
              orderId,
              reason: 'Cancelled by user',
            });
          } catch {
            // ignore
          }
        }
        showToast('Payment cancelled.', 'error');
      },

      onError: (err: unknown) => {
        console.error('PayPal Error:', err);
        showToast('Payment error. Please try again.', 'error');
      },
    });

    paypalButtonsRef.current = buttons;
    buttons.render(container);

    return () => {
      destroyPaypalButtons();
    };
  }, [
    addOpen,
    addModalMode,
    paypalSdkReady,
    isUsersToAddValid,
    usersToAddNum,
    showToast,
    navigate,
    amountToPay,
    closeAddModal,
    destroyPaypalButtons,
  ]);

  const closeAdd = () => {
    if (addModalMode === 'purchase-slots') {
      closeAddModal();
      return;
    }

    setAddOpen(false);
    reset();
  };

  const closeView = () => {
    setViewOpen(false);
    setSelectedUser(null);
  };

  const openView = useCallback((u: PartnerUser) => {
    setSelectedUser(u);
    setViewOpen(true);
  }, []);

  const openEdit = useCallback(
    (u: PartnerUser) => {
      setSelectedUser(u);

      resetEdit({
        name: u.name ?? '',
        mobile: u.mobile ?? '',
        area: u.state ?? '',
        zipCode: u.zip_code ?? '',
        weight: Number(u.weight ?? 0),
        weightUnit: String(u.weight_unit ?? 'kg'),
        height: Number(u.height ?? 0),
        heightUnit: String(u.height_unit ?? 'cm'),
        language: {
          label: String(u.language_name ?? ''),
          value: String(u.language ?? ''),
        },
        country: {
          label: String(u.country ?? ''),
          value: String(COUNTRIES_LIST.find(c => c.label === u.country)?.value ?? ''),
        },
        state: {
          label: String(u.province_title ?? ''),
          value: String(u.province_id ?? ''),
        },
      });

      setEditOpen(true);
    },
    [resetEdit]
  );

  const closeEdit = () => {
    setEditOpen(false);
    setSelectedUser(null);
    resetEdit();
  };

  const openPassword = useCallback((u: PartnerUser) => {
    setSelectedUser(u);
    setPasswordOpen(true);
  }, []);

  const closePassword = () => {
    setPasswordOpen(false);
    setSelectedUser(null);
    resetPassword();
  };

  const onSubmitCreate: SubmitHandler<UserFormValues> = async values => {
    try {
      const { userEnvironmentInfo } = await getUserEnvironmentInfo();

      const timeZone = COUNTRIES_LIST.find(c => c.value === values.country.value)?.states.find(
        s => s.value === values.state.value
      )?.timeZone;

      const payload = {
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        state: values.area,
        zipcode: values.zipCode,
        country: values.country.label,
        language: values.language.value,
        provinceTitle: values.state.label,
        provinceValue: values.state.value,
        weight: values.weight,
        weight_unit: values.weightUnit,
        height: values.height,
        height_unit: values.heightUnit,
        timeZone,
        otherInfo: userEnvironmentInfo,
      };

      const result = await PartnerPortalService.createUser(payload);
      if (result?.success) {
        showToast('User created. Email sent (verify email before login).', 'success');
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUMMARY });
        closeAdd();
      } else {
        showToast(String(result?.message ?? 'Failed to create user.'), 'error');
      }
    } catch (err: unknown) {
      showToast(String(get(err, ['message'], 'Failed to create user.')), 'error');
    }
  };

  const onSubmitEdit: SubmitHandler<EditFormValues> = async values => {
    if (!selectedUser) return;

    try {
      const timeZone = COUNTRIES_LIST.find(c => c.value === values.country.value)?.states.find(
        s => s.value === values.state.value
      )?.timeZone;

      const payload = {
        id: selectedUser.id,
        name: values.name,
        mobile: values.mobile,
        state: values.area,
        zipcode: values.zipCode,
        country: values.country.label,
        language: values.language.value,
        provinceTitle: values.state.label,
        provinceValue: values.state.value,
        weight: values.weight,
        weight_unit: values.weightUnit,
        height: values.height,
        height_unit: values.heightUnit,
        timeZone,
      };

      const result = await PartnerPortalService.updateUser(payload);
      if (result?.success) {
        showToast('User updated successfully.', 'success');
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
        closeEdit();
      } else {
        showToast(String(result?.message ?? 'Failed to update user.'), 'error');
      }
    } catch (err: unknown) {
      showToast(String(get(err, ['message'], 'Failed to update user.')), 'error');
    }
  };

  const onSubmitPassword: SubmitHandler<ChangePasswordValues> = async values => {
    if (!selectedUser) return;

    try {
      const result = await PartnerPortalService.changeUserPassword({
        id: selectedUser.id,
        new_password: values.newPassword,
      });

      if (result?.success) {
        showToast('Password updated successfully.', 'success');
        closePassword();
      } else {
        showToast(String(result?.message ?? 'Failed to update password.'), 'error');
      }
    } catch (err: unknown) {
      showToast(String(get(err, ['message'], 'Failed to update password.')), 'error');
    }
  };

  const columns: GridColDef<PartnerUser>[] = useMemo(
    () => [
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 220 },
      { field: 'mobile', headerName: 'Mobile', minWidth: 140 },
      { field: 'country', headerName: 'Country', minWidth: 140 },
      { field: 'state', headerName: 'Area', minWidth: 140 },
      {
        field: 'verified',
        headerName: 'Verified',
        minWidth: 110,
        valueGetter: (_value, row) => (Number(row?.verified ?? 0) ? 'Yes' : 'No'),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        width: 110,
        headerClassName: 'sticky-right--header',
        cellClassName: 'sticky-right--cell',
        renderCell: params => {
          const row = params.row;
          const open = Boolean(anchorEl) && menuRowId === row.id;

          const handleClick = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorEl(event.currentTarget);
            setMenuRowId(row.id);
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ elevation: 6, sx: { minWidth: 220, borderRadius: 2 } }}
              >
                <MenuItem
                  onClick={() => {
                    handleClose();
                    openView(row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <VisibilityOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="View Details"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                  />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    openEdit(row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <EditOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Edit"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleClose();
                    openPassword(row);
                  }}
                  sx={{ py: 1, px: 1.5 }}
                >
                  <ListItemIcon>
                    <LockOutlinedIcon sx={{ fontSize: 21 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Password"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                  />
                </MenuItem>
              </Menu>
            </>
          );
        },
      },
    ],
    [anchorEl, menuRowId, openEdit, openPassword, openView]
  );

  if (isLoadingSummary || isLoadingUsers) return <CustomLoader />;

  return (
    <Box display="flex" flexDirection="column" width="100%" height="100%" p={2} gap={2}>
      <TabHeaderLayout
        leftNode={
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Users
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={openAdd}
            disabled={!!isLoadingSummary}
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
            Add User
          </MorenButton>
        }
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SummaryCard label="Allowed users" value={Number(summary?.allowed_users ?? 0)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard label="Added users" value={Number(summary?.active_users ?? 0)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard label="Remaining users" value={Number(summary?.remaining_users ?? 0)} />
        </Grid>
      </Grid>

      <GenericTable
        rows={(users ?? []) as PartnerUser[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={!!isLoadingUsers}
        disableVirtualization
      />

      {/* Add User */}
      <GenericModal
        isOpen={addOpen}
        onClose={closeAdd}
        title={addModalMode === 'purchase-slots' ? 'Purchase Users' : 'Add User'}
        hideCancelButton
        maxWidth={addModalMode === 'purchase-slots' ? 'sm' : 'lg'}
        size="compact"
      >
        {addModalMode === 'purchase-slots' ? (
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              minHeight: 520,
              width: '100%',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                bgcolor: theme => theme.palette.background.paper,
              }}
            >
              <Typography sx={{ fontWeight: 800 }} color="error">
                You don&apos;t have sufficient users to add. Please purchase.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                You can add users only in multiples of 10 (max 100).
              </Typography>
            </Paper>

            <Box component="form" onSubmit={handleSubmitPurchase(() => undefined)}>
              <ModernInput
                label="Users to add"
                placeholder="10, 20, 30..."
                type="number"
                inputProps={{ min: 10, max: 100, step: 10 }}
                {...registerPurchase('usersToAdd', { valueAsNumber: true })}
                error={!!purchaseErrors.usersToAdd}
                helperText={purchaseErrors.usersToAdd?.message}
              />
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: theme => `1px solid ${theme.palette.divider}`,
                bgcolor: theme => theme.palette.background.paper,
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Unit Price
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }}>${unitPrice.toFixed(2)} / user</Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography sx={{ fontWeight: 900 }}>${amountToPay.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {!isUsersToAddValid ? (
              <Typography variant="body2" color="text.secondary">
                Enter a valid number of users to show the payment button.
              </Typography>
            ) : null}

            <Box
              sx={{
                minHeight: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: theme => `1px dashed ${theme.palette.divider}`,
                px: 1.5,
                py: 2,
              }}
            >
              <Box ref={paypalRef} sx={{ width: '100%' }} />
              {!paypalSdkReady ? (
                <Typography variant="body2" color="text.secondary">
                  Loading payment option...
                </Typography>
              ) : null}
            </Box>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmitCreate)}
            display="flex"
            flexDirection="column"
            gap={2}
          >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ModernInput
                label="Name"
                placeholder="Enter name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ModernInput
                label="Mobile"
                placeholder="Enter mobile"
                {...register('mobile')}
                error={!!errors.mobile}
                helperText={errors.mobile?.message}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" error={!!errors.weightUnit}>
                <FormLabel component="legend">Weight Unit</FormLabel>
                <Controller
                  rules={{ required: true }}
                  control={control}
                  name="weightUnit"
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel value="kg" control={<Radio />} label="Kg" />
                      <FormControlLabel value="pound" control={<Radio />} label="Pound" />
                    </RadioGroup>
                  )}
                />
                {errors.weightUnit && (
                  <Typography variant="caption" color="error">
                    {errors.weightUnit.message}
                  </Typography>
                )}
              </FormControl>
              <ModernInput
                label="Weight"
                placeholder="Enter weight"
                type="number"
                {...register('weight')}
                error={!!errors.weight}
                helperText={errors.weight?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" error={!!errors.heightUnit}>
                <FormLabel component="legend">Height Unit</FormLabel>
                <Controller
                  rules={{ required: true }}
                  control={control}
                  name="heightUnit"
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel value="cm" control={<Radio />} label="Cm" />
                      <FormControlLabel value="inches" control={<Radio />} label="Inches" />
                    </RadioGroup>
                  )}
                />
                {errors.heightUnit && (
                  <Typography variant="caption" color="error">
                    {errors.heightUnit.message}
                  </Typography>
                )}
              </FormControl>
              <ModernInput
                label="Height"
                placeholder="Enter height"
                type="number"
                {...register('height')}
                error={!!errors.height}
                helperText={errors.height?.message}
              />
            </Grid>
          </Grid>

          <ModernInput
            label="Email"
            placeholder="Enter email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <ModernInput
            label="Area"
            placeholder="Enter area"
            {...register('area')}
            error={!!errors.area}
            helperText={errors.area?.message}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <ModernSelect
                    label="Country"
                    options={COUNTRIES_LIST.map(c => ({ label: c.label, value: c.value }))}
                    {...field}
                    onChange={(opt: IOption) => {
                      field.onChange(opt);
                      setValue('state', { label: '', value: '' }, { shouldValidate: true });
                    }}
                    error={!!errors.country}
                    helperText={String(
                      get(errors, ['country', 'value', 'message'], '') ||
                        get(errors, ['country', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <ModernSelect
                    label="State"
                    options={countryStates.map(s => ({ label: s.label, value: s.value }))}
                    {...field}
                    error={!!errors.state}
                    helperText={String(
                      get(errors, ['state', 'value', 'message'], '') ||
                        get(errors, ['state', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <ModernSelect
                    label="Language"
                    options={languageOptions}
                    {...field}
                    error={!!errors.language}
                    helperText={String(
                      get(errors, ['language', 'value', 'message'], '') ||
                        get(errors, ['language', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column" gap={0.5} minWidth={120}>
                <InputLabel shrink>Zipcode</InputLabel>
                <ModernInput
                  placeholder="Enter zipcode"
                  {...register('zipCode')}
                  error={!!errors.zipCode}
                  helperText={errors.zipCode?.message}
                />
              </Box>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <MorenButton variant="text" onClick={closeAdd}>
              Cancel
            </MorenButton>
            <MorenButton variant="contained" type="submit">
              Create
            </MorenButton>
          </Box>
          </Box>
        )}
      </GenericModal>

      {/* View Details */}
      <GenericModal isOpen={viewOpen} onClose={closeView} title="User Details" hideCancelButton>
        <Box display="flex" flexDirection="column" gap={1.25}>
          <Typography>
            <b>Name:</b> {selectedUser?.name}
          </Typography>
          <Typography>
            <b>Email:</b> {selectedUser?.email}
          </Typography>
          <Typography>
            <b>Mobile:</b> {selectedUser?.mobile}
          </Typography>
          <Typography>
            <b>Country:</b> {selectedUser?.country}
          </Typography>
          <Typography>
            <b>Area:</b> {selectedUser?.state}
          </Typography>
          <Typography>
            <b>Zip Code:</b> {selectedUser?.zip_code}
          </Typography>
          <Typography>
            <b>Language:</b> {selectedUser?.language_name}
          </Typography>
          <Typography>
            <b>Verified:</b> {Number(selectedUser?.verified ?? 0) ? 'Yes' : 'No'}
          </Typography>
          <Box display="flex" justifyContent="flex-end">
            <MorenButton variant="contained" onClick={closeView}>
              Close
            </MorenButton>
          </Box>
        </Box>
      </GenericModal>

      {/* Edit User */}
      <GenericModal isOpen={editOpen} onClose={closeEdit} title="Edit User" hideCancelButton>
        <Box component="form" onSubmit={handleSubmitEdit(onSubmitEdit)} display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ModernInput
                label="Name"
                placeholder="Enter name"
                {...registerEdit('name')}
                error={!!editErrors.name}
                helperText={editErrors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ModernInput
                label="Mobile"
                placeholder="Enter mobile"
                {...registerEdit('mobile')}
                error={!!editErrors.mobile}
                helperText={editErrors.mobile?.message}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" error={!!editErrors.weightUnit}>
                <FormLabel component="legend">Weight Unit</FormLabel>
                <Controller
                  rules={{ required: true }}
                  control={controlEdit}
                  name="weightUnit"
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel value="kg" control={<Radio />} label="Kg" />
                      <FormControlLabel value="pound" control={<Radio />} label="Pound" />
                    </RadioGroup>
                  )}
                />
                {editErrors.weightUnit && (
                  <Typography variant="caption" color="error">
                    {editErrors.weightUnit.message}
                  </Typography>
                )}
              </FormControl>
              <ModernInput
                label="Weight"
                placeholder="Enter weight"
                type="number"
                {...registerEdit('weight')}
                error={!!editErrors.weight}
                helperText={editErrors.weight?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" error={!!editErrors.heightUnit}>
                <FormLabel component="legend">Height Unit</FormLabel>
                <Controller
                  rules={{ required: true }}
                  control={controlEdit}
                  name="heightUnit"
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel value="cm" control={<Radio />} label="Cm" />
                      <FormControlLabel value="inches" control={<Radio />} label="Inches" />
                    </RadioGroup>
                  )}
                />
                {editErrors.heightUnit && (
                  <Typography variant="caption" color="error">
                    {editErrors.heightUnit.message}
                  </Typography>
                )}
              </FormControl>
              <ModernInput
                label="Height"
                placeholder="Enter height"
                type="number"
                {...registerEdit('height')}
                error={!!editErrors.height}
                helperText={editErrors.height?.message}
              />
            </Grid>
          </Grid>

          <ModernInput label="Email" placeholder="Email" value={selectedUser?.email ?? ''} disabled />

          <ModernInput
            label="Area"
            placeholder="Enter area"
            {...registerEdit('area')}
            error={!!editErrors.area}
            helperText={editErrors.area?.message}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={controlEdit}
                render={({ field }) => (
                  <ModernSelect
                    label="Country"
                    options={COUNTRIES_LIST.map(c => ({ label: c.label, value: c.value }))}
                    {...field}
                    onChange={(opt: IOption) => {
                      field.onChange(opt);
                      setValueEdit('state', { label: '', value: '' }, { shouldValidate: true });
                    }}
                    error={!!editErrors.country}
                    helperText={String(
                      get(editErrors, ['country', 'value', 'message'], '') ||
                        get(editErrors, ['country', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={controlEdit}
                render={({ field }) => (
                  <ModernSelect
                    label="State"
                    options={countryStatesEdit.map(s => ({ label: s.label, value: s.value }))}
                    {...field}
                    error={!!editErrors.state}
                    helperText={String(
                      get(editErrors, ['state', 'value', 'message'], '') ||
                        get(editErrors, ['state', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="language"
                control={controlEdit}
                render={({ field }) => (
                  <ModernSelect
                    label="Language"
                    options={languageOptions}
                    {...field}
                    error={!!editErrors.language}
                    helperText={String(
                      get(editErrors, ['language', 'value', 'message'], '') ||
                        get(editErrors, ['language', 'message'], '')
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" flexDirection="column" gap={0.5} minWidth={120}>
                <InputLabel shrink>Zipcode</InputLabel>
                <ModernInput
                  placeholder="Enter zipcode"
                  {...registerEdit('zipCode')}
                  error={!!editErrors.zipCode}
                  helperText={editErrors.zipCode?.message}
                />
              </Box>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <MorenButton variant="text" onClick={closeEdit}>
              Cancel
            </MorenButton>
            <MorenButton variant="contained" type="submit">
              Save
            </MorenButton>
          </Box>
        </Box>
      </GenericModal>

      {/* Change Password */}
      <GenericModal isOpen={passwordOpen} onClose={closePassword} title="Change Password" hideCancelButton>
        <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} display="flex" flexDirection="column" gap={2}>
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...registerPassword('newPassword')}
            error={!!passwordErrors.newPassword}
            helperText={passwordErrors.newPassword?.message}
          />
          <ModernInput
            label="Confirm Password"
            placeholder="Confirm new password"
            type="password"
            {...registerPassword('confirmNewPassword')}
            error={!!passwordErrors.confirmNewPassword}
            helperText={passwordErrors.confirmNewPassword?.message}
          />

          <Box display="flex" justifyContent="flex-end" gap={1}>
            <MorenButton variant="text" onClick={closePassword}>
              Cancel
            </MorenButton>
            <MorenButton variant="contained" type="submit">
              Update
            </MorenButton>
          </Box>
        </Box>
      </GenericModal>
    </Box>
  );
}
