import { useMemo, useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { GridColDef } from '@mui/x-data-grid';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';

import { TabHeaderLayout } from '../../../../components/tab-header';
import { GenericTable } from '../../../../components/table';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import ModernSelect, { type IOption } from '../../../../components/select';
import CustomLoader from '../../../../components/loader';

import AdminService from '../../admin.service';
import { useToast } from '../../../../providers/toast-provider';
import { useGetProductFeatureKeys } from '../../hooks/useGetProductFeatureKeys';
import type {
  IProductFeatureKey,
  ProductFeatureKeyType,
} from '../../admin.interface';

type FeatureKeyFormValues = {
  title: string;
  key_type: ProductFeatureKeyType;
  value: string;
};

const schema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  key_type: Yup.mixed<ProductFeatureKeyType>()
    .oneOf(['radio', 'text'])
    .required('Key type is required'),
  value: Yup.string().required('Value is required'),
});

function ProductFeatureKeys() {
  const { data, isLoading, refetch } = useGetProductFeatureKeys();
  const { showToast } = useToast();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  const keyTypeOptions: IOption[] = useMemo(
    () => [
      { label: 'Radio (Yes/No)', value: 'radio' },
      { label: 'Text', value: 'text' },
    ],
    []
  );

  const yesNoOptions: IOption[] = useMemo(
    () => [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    []
  );

  const rows = useMemo(() => {
    return (data?.data || []) as IProductFeatureKey[];
  }, [data]);

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeatureKeyFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      key_type: 'text',
      value: '',
    },
  });

  const watchedKeyType = watch('key_type');

  const handleOpenAddModal = () => {
    reset({ title: '', key_type: 'text', value: '' });
    setIsModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsModalOpen(false);
    reset({ title: '', key_type: 'text', value: '' });
  };

  const onSubmit = async (values: FeatureKeyFormValues) => {
    setIsSaving(true);
    const result = await AdminService.createProductFeatureKey(values);
    if (result.success) {
      showToast(result.message, 'success');
      handleCloseAddModal();
      refetch();
    } else {
      showToast(result.message, 'error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    setIsSaving(true);
    const result = await AdminService.deleteProductFeatureKey({ id });
    if (result.success) {
      showToast(result.message, 'success');
      refetch();
    } else {
      showToast(result.message, 'error');
    }
    setIsSaving(false);
  };

  const columns: GridColDef<IProductFeatureKey>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'key_type',
      headerName: 'Key Type',
      width: 180,
      renderCell: params =>
        params.row.key_type === 'radio' ? 'Radio (Yes/No)' : 'Text',
    },
    { field: 'value', headerName: 'Actual Value', flex: 1 },
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
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  handleDelete(params.row.id);
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </>
        );
      },
    },
  ];

  if (isSaving) return <CustomLoader />;

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
          <Typography variant="h5" sx={{ fontWeight: 600, padding: 0 }}>
            Product Feature Keys
          </Typography>
        }
        rightNode={
          <MorenButton
            variant="contained"
            onClick={handleOpenAddModal}
            sx={{ minWidth: '140px', maxWidth: '220px', alignSelf: 'flex-end' }}
          >
            Add a Key
          </MorenButton>
        }
      />

      <GenericTable
        rows={rows}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      <GenericModal
        isOpen={isModalOpen}
        onClose={handleCloseAddModal}
        title="Add Feature Key"
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
            label="Title"
            placeholder="Enter key title"
            value={watch('title')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValue('title', e.target.value)
            }
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <ModernSelect
            label="Key Type"
            id="feature-key-type"
            options={keyTypeOptions}
            value={keyTypeOptions.find(o => o.value === watchedKeyType) || null}
            onChange={val => {
              const next = val.value as ProductFeatureKeyType;
              setValue('key_type', next);
              setValue('value', next === 'radio' ? 'Yes' : '');
            }}
            fullWidth
          />

          {watchedKeyType === 'radio' ? (
            <ModernSelect
              label="Actual Value"
              id="feature-key-radio"
              options={yesNoOptions}
              value={yesNoOptions.find(o => o.value === watch('value')) || null}
              onChange={val => setValue('value', val.value)}
              fullWidth
              error={!!errors.value}
              helperText={errors.value?.message}
            />
          ) : (
            <ModernInput
              label="Actual Value"
              placeholder="Enter value"
              value={watch('value')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue('value', e.target.value)
              }
              error={!!errors.value}
              helperText={errors.value?.message}
            />
          )}

          <MorenButton
            type="submit"
            variant="contained"
            sx={{ alignSelf: 'flex-end', mt: 2, minWidth: '120px' }}
          >
            Save
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
}

export default ProductFeatureKeys;
