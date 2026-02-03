import * as Yup from 'yup';
import ModernSwitch from '../../../../components/switch';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import AdminService from '../../admin.service';
import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import { GenericTable } from '../../../../components/table';
import { useGetProductListing } from '../../hooks/useGetProductListing';
import { useGetProductFeatureKeys } from '../../hooks/useGetProductFeatureKeys';
import type { IProduct, IProductFeatureKey } from '../../admin.interface';
import { get } from 'lodash';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import CustomLoader from '../../../../components/loader';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { TabHeaderLayout } from '../../../../components/tab-header';
import ModernSelect, { type IOption } from '../../../../components/select';
import {
  COUNTRIES_LIST,
  COUNTRY_CURRENCY_BY_CODE,
} from '../../../../utils/constants';

// ✅ Validation schema
const schema = Yup.object({
  product_name: Yup.string().required('Product name is required'),
  product_description: Yup.string().required('Description is required'),
  product_amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .test('decimal-places', 'Amount must have up to 2 decimal places', value => {
      if (value === undefined || value === null) return false;
      return /^\d+(\.\d{1,2})?$/.test(String(value));
    })
    .required('Amount is required'),
});

// ✅ Only the fields we edit in the form
type ProductFormValues = {
  product_name: string;
  product_description: string;
  product_amount: number;
};

function ProductsTable() {
  const { data, isLoading, refetch } = useGetProductListing();
  const { data: featureKeysData } = useGetProductFeatureKeys();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [productModalMode, setProductModalMode] = useState<
    'add' | 'edit' | null
  >(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProductId, setMenuProductId] = useState<number | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCountryAmountModalOpen, setIsCountryAmountModalOpen] =
    useState(false);
  const [featureKeyValues, setFeatureKeyValues] = useState<
    Record<string, string>
  >({});
  const [countryAmountRows, setCountryAmountRows] = useState<
    Array<{ country: IOption | null; amount: number | '' }>
  >([]);

  const { showToast } = useToast();

  const normalizeRadio = (value: unknown) => {
    const text = String(value ?? '')
      .trim()
      .toLowerCase();
    if (text === 'yes') return 'Yes';
    if (text === 'no') return 'No';
    return '';
  };

  const initializeFeatureValues = (product: IProduct | null) => {
    const allKeys =
      (get(featureKeysData, 'data', []) as IProductFeatureKey[]) || [];

    const next: Record<string, string> = {};
    // defaults from keys
    allKeys.forEach(k => {
      next[k.title] = k.key_type === 'radio' ? 'No' : '';
    });

    if (product) {
      const features =
        (get(product, 'feature', []) as Array<{
          title?: string;
          value?: unknown;
        }>) || [];

      features.forEach(f => {
        const title = String(f?.title ?? '').trim();
        if (!title) return;
        next[title] = String(f?.value ?? '');
      });

      // normalize radios
      allKeys.forEach(k => {
        if (k.key_type !== 'radio') return;
        const normalized = normalizeRadio(next[k.title]);
        next[k.title] = normalized || 'No';
      });
    }

    setFeatureKeyValues(next);
  };

  const handleCloseProductModal = () => {
    setProductModalMode(null);
    setSelectedProduct(null);
    setFeatureKeyValues({});
    reset(); // clear form
  };

  const handleOpenEditModal = (product: IProduct) => {
    setSelectedProduct(product);
    setProductModalMode('edit');
    initializeFeatureValues(product);
  };

  const handleOpenAddModal = () => {
    setSelectedProduct(null);
    setProductModalMode('add');
    reset({
      product_name: '',
      product_description: '',
      product_amount: Number.NaN,
    });

    initializeFeatureValues(null);
  };

  const handleOpenViewModal = (product: IProduct) => {
    setSelectedProduct(product);
    setIsViewMode(true);
  };

  const countryOptions: IOption[] = (COUNTRIES_LIST || []).map(c => ({
    value: String(get(c, 'value', '')),
    label: String(get(c, 'label', '')),
  }));

  const getCurrencyMeta = (countryCode: string) => {
    return (
      COUNTRY_CURRENCY_BY_CODE[countryCode] || {
        currencyCode: 'USD',
        symbol: '$',
      }
    );
  };

  const handleOpenCountryAmountModal = (product: IProduct) => {
    setSelectedProduct(product);
    const usdCountry = countryOptions.find(c => c.value === 'US') || null;

    const existing: Array<{ country: IOption | null; amount: number | '' }> = (
      get(product, 'country_amounts', []) as Array<{
        country_code?: string;
        amount?: number;
      }>
    ).map(item => {
      const code = String(get(item, 'country_code', '')).trim();
      const opt = countryOptions.find(c => c.value === code) || null;
      const amt = Number(get(item, 'amount', ''));
      return {
        country: opt,
        amount: Number.isFinite(amt) ? amt : ('' as const),
      };
    });

    const hasUS = existing.some(r => r.country?.value === 'US');
    const rows: Array<{ country: IOption | null; amount: number | '' }> = hasUS
      ? existing
      : [
          {
            country: usdCountry,
            amount: Number(product.product_amount) || 0,
          },
          ...existing,
        ];

    setCountryAmountRows(
      rows.length > 0
        ? rows
        : [
            {
              country: usdCountry,
              amount: Number(product.product_amount) || 0,
            },
          ]
    );
    setIsCountryAmountModalOpen(true);
  };

  const handleCloseCountryAmountModal = () => {
    setIsCountryAmountModalOpen(false);
    setCountryAmountRows([]);
    setSelectedProduct(null);
  };

  const handleAddCountryAmountRow = () => {
    setCountryAmountRows(prev => [...prev, { country: null, amount: '' }]);
  };

  const handleSaveCountryAmounts = async () => {
    if (!selectedProduct) return;

    const normalized = countryAmountRows
      .map(row => {
        const countryCode = row.country?.value || '';
        const countryName = row.country?.label || '';
        const amountNumber =
          typeof row.amount === 'number' ? row.amount : Number(row.amount);
        return { countryCode, countryName, amount: amountNumber };
      })
      .filter(row => row.countryCode && row.countryName);

    // USD is always derived from product_amount
    const usdMeta = getCurrencyMeta('US');
    const payload = [
      {
        country_code: 'US',
        country_name: 'United States',
        currency_code: usdMeta.currencyCode,
        currency_symbol: usdMeta.symbol,
        amount: Number(selectedProduct.product_amount) || 0,
      },
      ...normalized
        .filter(r => r.countryCode !== 'US')
        .map(r => {
          const meta = getCurrencyMeta(r.countryCode);
          return {
            country_code: r.countryCode,
            country_name: r.countryName,
            currency_code: meta.currencyCode,
            currency_symbol: meta.symbol,
            amount: Number(r.amount) || 0,
          };
        }),
    ];

    const invalid = payload.some(
      item =>
        !item.country_code ||
        !item.country_name ||
        !item.currency_code ||
        !item.currency_symbol ||
        !Number.isFinite(item.amount) ||
        item.amount <= 0
    );

    if (invalid) {
      showToast('Please select country and enter a valid amount', 'error');
      return;
    }

    setIsLoadingStatus(true);
    const result = await AdminService.updateProductCountryAmounts({
      id: selectedProduct.id,
      country_amounts: payload,
    });

    if (result.success) {
      showToast(result.message, 'success');
      handleCloseCountryAmountModal();
      refetch();
    } else {
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  // ✅ Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(schema),
  });

  // ✅ Reset form values whenever a new product is selected
  useEffect(() => {
    if (selectedProduct) {
      reset({
        product_name: selectedProduct.product_name,
        product_description: selectedProduct.product_description,
        product_amount: selectedProduct.product_amount,
      });
    }
  }, [selectedProduct, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setIsLoadingStatus(true);

    const payload = {
      product_name: values.product_name,
      product_description: values.product_description,
      product_amount: Number(values.product_amount),
    };

    const allKeys =
      (get(featureKeysData, 'data', []) as IProductFeatureKey[]) || [];
    const featurePayload = allKeys.map(key => ({
      title: key.title,
      value:
        key.key_type === 'radio'
          ? featureKeyValues[key.title] === 'Yes'
            ? 'Yes'
            : 'No'
          : String(featureKeyValues[key.title] ?? ''),
    }));

    const result =
      productModalMode === 'edit' && selectedProduct
        ? await AdminService.updateProduct({
            id: selectedProduct.id,
            ...payload,
            ...(allKeys.length > 0 ? { feature: featurePayload } : {}),
          })
        : await AdminService.createProduct({
            ...payload,
            feature: featurePayload,
          });

    if (result.success) {
      setIsLoadingStatus(false);
      handleCloseProductModal();
      // ✅ Show success message
      showToast(result.message, 'success');
      // Optionally refresh list
      refetch();
    } else {
      console.error('❌ Save failed:', result.message);
      showToast(result.message, 'error');
    }
    setIsLoadingStatus(false);
  };

  const handleUpdateStatus = async (id: number, status: number) => {
    setIsLoadingStatus(true);
    const result = await AdminService.updateProductStatus(id, status);
    if (result.success) {
      showToast(result.message, 'success');
      refetch();
    } else {
      console.error('❌ Status update failed:', result.message);
    }
    setIsLoadingStatus(false);
  };

  // ✅ Define product columns
  const columns: GridColDef<IProduct>[] = [
    { field: 'product_name', headerName: 'Product Name', flex: 1 },
    { field: 'product_description', headerName: 'Description', flex: 2 },
    { field: 'product_amount', headerName: 'Amount (USD)', width: 140 },
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
    { field: 'created_date', headerName: 'Created At', flex: 1 },
    { field: 'updated_date', headerName: 'Updated At', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      headerClassName: 'sticky-right--header',
      cellClassName: 'sticky-right--cell',
      sortable: false,
      filterable: false,
      renderCell: params => {
        const open = Boolean(anchorEl) && menuProductId === params.row.id;

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          setAnchorEl(event.currentTarget);
          setMenuProductId(params.row.id);
        };

        const handleClose = () => {
          setAnchorEl(null);
          setMenuProductId(null);
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
              PaperProps={{ elevation: 6, sx: { minWidth: 240, borderRadius: 2 } }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenEditModal(params.row);
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
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenViewModal(params.row);
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
              <Divider />
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleOpenCountryAmountModal(params.row);
                }}
                sx={{ py: 1, px: 1.5 }}
              >
                <ListItemIcon>
                  <PublicOutlinedIcon sx={{ fontSize: 21 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Add amount by country"
                  primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                />
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

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
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              padding: 0,
            }}
          >
            Products List
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="text"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={handleOpenAddModal}
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
            Add Product
          </MorenButton>
        }
      />

      <GenericTable
        rows={get(data, 'data', []) as IProduct[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
        disableVirtualization
      />

      {/* ✅ Modal with form */}
      <GenericModal
        isOpen={productModalMode === 'add' || productModalMode === 'edit'}
        onClose={handleCloseProductModal}
        title={
          productModalMode === 'add' ? 'Add Product' : 'Edit Product Details'
        }
        hideCancelButton
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="Product Name"
            placeholder="Enter product name"
            {...register('product_name')}
            error={!!errors.product_name}
            helperText={errors.product_name?.message}
          />

          <ModernInput
            label="Description"
            placeholder="Enter product description"
            {...register('product_description')}
            error={!!errors.product_description}
            helperText={errors.product_description?.message}
          />

          <ModernInput
            label="Amount"
            placeholder="Enter product amount (USD)"
            type="number"
            inputProps={{ step: '0.01', min: '0', pattern: '^\\d+(\\.\\d{1,2})?$' }}
            {...register('product_amount', { valueAsNumber: true,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                // Only allow up to 2 decimal places
                if (/^\d+(\.\d{0,2})?$/.test(val) || val === '') {
                  e.target.value = val;
                } else {
                  // Truncate to 2 decimals if more entered
                  const truncated = val.replace(/^(\d+\.\d{2}).*$/, '$1');
                  e.target.value = truncated;
                }
                return e;
              }
            })}
            error={!!errors.product_amount}
            helperText={errors.product_amount?.message}
          />

          {(productModalMode === 'add' || productModalMode === 'edit') && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Product Features
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Fields below are generated from Product Feature Keys.
                </Typography>
              </Box>

              {(
                (get(featureKeysData, 'data', []) as IProductFeatureKey[]) || []
              ).length === 0 && (
                <Typography variant="caption" color="textSecondary">
                  No feature keys configured.
                </Typography>
              )}

              {(
                (get(featureKeysData, 'data', []) as IProductFeatureKey[]) || []
              ).map(keyItem => {
                const currentVal = featureKeyValues[keyItem.title] || '';

                if (keyItem.key_type === 'radio') {
                  const val = currentVal || 'No';
                  return (
                    <Box key={keyItem.id}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 1 }}
                      >
                        {keyItem.title}
                      </Typography>
                      <RadioGroup
                        row
                        value={val}
                        onChange={e => {
                          setFeatureKeyValues(prev => ({
                            ...prev,
                            [keyItem.title]: e.target.value,
                          }));
                        }}
                      >
                        <FormControlLabel
                          value="Yes"
                          control={<Radio />}
                          label="Yes"
                        />
                        <FormControlLabel
                          value="No"
                          control={<Radio />}
                          label="No"
                        />
                      </RadioGroup>
                    </Box>
                  );
                }

                return (
                  <ModernInput
                    key={keyItem.id}
                    label={keyItem.title}
                    placeholder={`Enter value for ${keyItem.title}`}
                    value={currentVal}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFeatureKeyValues(prev => ({
                        ...prev,
                        [keyItem.title]: e.target.value,
                      }));
                    }}
                  />
                );
              })}
            </Box>
          )}

          <MorenButton
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-end',
              mt: 2,
              minWidth: '120px',
              maxWidth: '150px',
            }}
          >
            {productModalMode === 'add' ? 'Create Product' : 'Save Changes'}
          </MorenButton>
        </Box>
      </GenericModal>

      {/* View Modal */}
      <GenericModal
        isOpen={isViewMode}
        onClose={() => {
          setIsViewMode(false);
          setSelectedProduct(null);
        }}
        title={`Product Details${
          selectedProduct
            ? ` - ${get(selectedProduct, 'product_name', '')}`
            : ''
        }`}
        hideCancelButton
      >
        {selectedProduct && (
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
              {/* Product Name */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Product Name:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedProduct, 'product_name', '')}
                </Typography>
              </Box>

              {/* Description */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Description:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedProduct, 'product_description', '')}
                </Typography>
              </Box>

              {/* Amount */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Amount (USD):
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedProduct, 'product_amount', '')}
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
                  {get(selectedProduct, 'status', 0) === 1
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
                  {get(selectedProduct, 'created_date', '')}
                </Typography>
              </Box>

              {/* Updated Date */}
              <Box display="flex" alignItems="center" gap={1} width="50%">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  minWidth={120}
                >
                  Updated Date:
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {get(selectedProduct, 'updated_date', '')}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </GenericModal>

      {/* Country Amount Modal */}
      <GenericModal
        isOpen={isCountryAmountModalOpen}
        onClose={handleCloseCountryAmountModal}
        title={`Add amount by country$${
          selectedProduct
            ? ` - ${get(selectedProduct, 'product_name', '')}`
            : ''
        }`.replace('$', '')}
        hideCancelButton
      >
        <Box display="flex" flexDirection="column" gap={2}>
          {countryAmountRows.map((row, index) => {
            const code = row.country?.value || '';
            const meta = code ? getCurrencyMeta(code) : null;
            const isUSDRow = code === 'US' || (!code && index === 0);
            return (
              <Box
                key={`${row.country?.value || 'row'}-${index}`}
                display="flex"
                flexDirection={{ xs: 'column', sm: 'row' }}
                gap={2}
              >
                <Box flex={1}>
                  <ModernSelect
                    label="Country"
                    id={`country-${index}`}
                    options={countryOptions.map(opt => ({
                      ...opt,
                      disabled:
                        opt.value === 'US' ||
                        countryAmountRows.some(
                          (r, i) =>
                            i !== index && r.country?.value === opt.value
                        ),
                    }))}
                    value={row.country}
                    onChange={val => {
                      setCountryAmountRows(prev =>
                        prev.map((r, i) =>
                          i === index ? { ...r, country: val } : r
                        )
                      );
                    }}
                    placeholder="Select country"
                    searchable
                    fullWidth
                    // USD always comes from product_amount
                    {...(isUSDRow ? { disabled: true } : {})}
                  />
                </Box>

                <Box flex={1}>
                  {/* Label */}
                  <Typography variant="body2" color="textSecondary" mb={1}>
                    Amount Details:
                  </Typography>
                  <ModernInput
                    label={`Amount${meta ? ` (${meta.symbol})` : ''}`}
                    placeholder={
                      meta
                        ? `Enter amount (${meta.currencyCode})`
                        : 'Enter amount'
                    }
                    type="number"
                    value={
                      isUSDRow && selectedProduct
                        ? Number(selectedProduct.product_amount) || 0
                        : row.amount
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      setCountryAmountRows(prev =>
                        prev.map((r, i) =>
                          i === index
                            ? {
                                ...r,
                                amount: value === '' ? '' : Number(value),
                              }
                            : r
                        )
                      );
                    }}
                    disabled={isUSDRow}
                  />
                  {isUSDRow && (
                    <Typography variant="caption" color="textSecondary">
                      USD amount is taken from product amount.
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            gap={4}
          >
            <MorenButton
              variant="outlined"
              onClick={handleAddCountryAmountRow}
              sx={{
                maxWidth: '200px',
              }}
            >
              Add Another Country
            </MorenButton>
            <MorenButton variant="contained" onClick={handleSaveCountryAmounts}>
              Save
            </MorenButton>
          </Box>
        </Box>
      </GenericModal>
    </Box>
  );
}

export default ProductsTable;
