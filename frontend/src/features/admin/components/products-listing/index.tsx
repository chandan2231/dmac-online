import * as Yup from 'yup';
import ModernSwitch from '../../../../components/switch';
import EditIcon from '@mui/icons-material/Edit';
import GenericModal from '../../../../components/modal';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import AdminService from '../../admin.service';
import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { GenericTable } from '../../../../components/table';
import { useGetProductListing } from '../../hooks/useGetProductListing';
import type { IProduct } from '../../admin.interface';
import { get } from 'lodash';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import CustomLoader from '../../../../components/loader';

// ✅ Validation schema
const schema = Yup.object({
  product_name: Yup.string().required('Product name is required'),
  product_description: Yup.string().required('Description is required'),
  product_amount: Yup.number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
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

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const { showToast } = useToast();

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    reset(); // clear form
  };

  const handleOpenEditModal = (product: IProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
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
    if (!selectedProduct) return;

    setIsLoadingStatus(true);

    const result = await AdminService.updateProduct({
      id: selectedProduct.id,
      ...values,
    });

    if (result.success) {
      setIsLoadingStatus(false);
      handleCloseEditModal();
      // ✅ Show success message
      showToast(result.message, 'success');
      // Optionally refresh list
      refetch();
    } else {
      console.error('❌ Update failed:', result.message);
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
    { field: 'product_amount', headerName: 'Amount', width: 120 },
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
      <Typography variant="h6" sx={{ padding: 0 }}>
        Product Management Dashboard
      </Typography>

      <GenericTable
        rows={get(data, 'data', []) as IProduct[]}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={isLoading}
      />

      {/* ✅ Modal with form */}
      <GenericModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Product Details"
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
            placeholder="Enter product amount"
            type="number"
            {...register('product_amount')}
            error={!!errors.product_amount}
            helperText={errors.product_amount?.message}
          />

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
            Save Changes
          </MorenButton>
        </Box>
      </GenericModal>
    </Box>
  );
}

export default ProductsTable;
