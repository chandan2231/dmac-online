import { get } from 'lodash';
import type {
  IProduct,
  IUpdateProductPayload,
  IUserDetails,
  IChangeUserPasswordPayload,
  ITransaction,
  TransactionFilter,
  IConsultant,
  ICreateConsultantPayload,
  ITherapist,
  ICreateTherapistPayload,
  IConsultation,
  ConsultationFilter,
} from './admin.interface';
import moment from 'moment';
import HttpService from '../../services/HttpService';

const getProductsListing = async (): Promise<{
  success: boolean;
  data: IProduct[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.get('/admin/products/list');

    // ensure product_amount is casted to number
    const products = (get(response, 'data', []) as IProduct[]).map(item => ({
      ...item,
      product_amount: Number(item.product_amount),
      created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      updated_date: moment(get(item, 'updated_date')).format('YYYY-MM-DD'),
      feature: (get(item, 'feature', []) as unknown[]) ?? [],
    }));

    return {
      success: true,
      data: products,
      message: 'Products fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching products';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

// ✅ Update product
const updateProduct = async (
  payload: IUpdateProductPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/products/update', payload);

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Product updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating product';

    return {
      success: false,
      message,
    };
  }
};

const updateProductStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/products/status/change', {
      id,
      status,
    });

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Product status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating product status';

    return {
      success: false,
      message,
    };
  }
};

// ✅ Get users by role
const getUsersListing = async (
  role: string
): Promise<{
  success: boolean;
  data: IUserDetails[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/users/list', { role });

    const users = (get(response, 'data', []) as IUserDetails[]).map(item => ({
      ...item,
      created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      updated_date: moment(get(item, 'updated_date')).format('YYYY-MM-DD'),
    }));

    return {
      success: true,
      data: users,
      message: 'Users fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching users';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

// ✅ Update user status
const updateUserStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/status/change', {
      id,
      status,
    });

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'User status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating user status';

    return {
      success: false,
      message,
    };
  }
};

// ✅ Change user password
const changeUserPassword = async (
  payload: IChangeUserPasswordPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post(
      '/admin/user/reset/password',
      payload
    );

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'User password reset successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while resetting user password';

    return {
      success: false,
      message,
    };
  }
};

// ✅ Get transactions listing by type filter
const getTransactionsListing = async (
  filter: TransactionFilter
): Promise<{
  success: boolean;
  data: ITransaction[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/transactions/list', {
      selectedUserType: filter,
    });

    const transactions = (get(response, 'data', []) as ITransaction[]).map(
      item => ({
        ...item,
        // normalize any date fields if present
        created_date: item?.created_date
          ? moment(item.created_date).format('YYYY-MM-DD')
          : undefined,
        updated_date: item?.updated_date
          ? moment(item.updated_date).format('YYYY-MM-DD')
          : undefined,
      })
    );

    return {
      success: true,
      data: transactions,
      message: 'Transactions fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching transactions';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

const getConsultantsListing = async (): Promise<{
  success: boolean;
  data: IConsultant[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/users/list', {
      role: 'EXPERT',
    });

    const consultants = (get(response, 'data', []) as IConsultant[]).map(
      item => ({
        ...item,
        id: item.id,
        name: item.name,
        email: item.email,
        mobile: item.mobile,
        status: item.status,
        created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      })
    );

    return {
      success: true,
      data: consultants,
      message: 'Consultants fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching consultants';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

const updateConsultant = async (
  payload: Omit<ICreateConsultantPayload, 'password' | 'email' | 'role'> & {
    id: number;
  }
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/update', payload);

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating consultant';

    return {
      success: false,
      message,
    };
  }
};

const updateConsultantStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/status/change', {
      id,
      status,
    });
    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating consultant status';

    return {
      success: false,
      message,
    };
  }
};

const createConsultant = async (
  payload: Omit<ICreateConsultantPayload, 'role'>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/create', {
      ...payload,
      role: 'EXPERT',
    });
    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant created successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while creating consultant';
    return {
      success: false,
      message,
    };
  }
};

const updateConsultantPassword = async (
  payload: IChangeUserPasswordPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post(
      '/admin/user/reset/password',
      payload
    );

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant password reset successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while resetting consultant password';

    return {
      success: false,
      message,
    };
  }
};

const getTherapistListing = async (): Promise<{
  success: boolean;
  data: ITherapist[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/users/list', {
      role: 'THERAPIST',
    });

    const consultants = (get(response, 'data', []) as ITherapist[]).map(
      item => ({
        ...item,
        created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
      })
    );

    return {
      success: true,
      data: consultants,
      message: 'Consultants fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching consultants';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

const updateTherapistStatus = async (
  id: number,
  status: number
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/status/change', {
      id,
      status,
    });
    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant status updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating consultant status';

    return {
      success: false,
      message,
    };
  }
};

const createTherapist = async (
  payload: Omit<ICreateTherapistPayload, 'role'>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/create', {
      ...payload,
      role: 'THERAPIST',
    });
    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant created successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while creating consultant';
    return {
      success: false,
      message,
    };
  }
};

const updateTherapistPassword = async (
  payload: IChangeUserPasswordPayload
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post(
      '/admin/user/reset/password',
      payload
    );

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Consultant password reset successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while resetting consultant password';

    return {
      success: false,
      message,
    };
  }
};

const updateTherapist = async (
  payload: Omit<ICreateTherapistPayload, 'password' | 'email' | 'role'> & {
    id: number;
  }
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/user/update', payload);

    return {
      success: true,
      message: get(
        response,
        ['data', 'message'],
        'Therapist updated successfully'
      ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating therapist';

    return {
      success: false,
      message,
    };
  }
};

const getConsultationsListing = async (
  filter: ConsultationFilter
): Promise<{
  success: boolean;
  data: IConsultation[] | null;
  message: string;
}> => {
  try {
    const response = await HttpService.post('/admin/consultations/list', {
      consultant_id: filter?.consultant_id,
      consultant_role: filter?.consultant_role,
    });

    const consultations = (get(response, 'data', []) as IConsultation[]).map(
      item => ({
        ...item,
        // consultation_date: moment(get(item, 'consultation_date')).format(
        //   'YYYY-MM-DD HH:mm'
        // ),
        payment_date: item.payment_date
          ? moment(item.payment_date).format('YYYY-MM-DD HH:mm')
          : null,
        created_date: moment(get(item, 'created_date')).format('YYYY-MM-DD'),
        updated_date: moment(get(item, 'updated_date')).format('YYYY-MM-DD'),
      })
    );

    return {
      success: true,
      data: consultations,
      message: 'Consultations fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching consultations';

    return {
      success: false,
      data: null,
      message,
    };
  }
};

const getExpertReviews = async (expertId: number) => {
  try {
    const response = await HttpService.get(`/reviews/expert/list/${expertId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: get(error, 'response.data.message', 'Failed to fetch reviews'),
    };
  }
};

const getTherapistReviews = async (therapistId: number) => {
  try {
    const response = await HttpService.get(
      `/reviews/therapist/list/${therapistId}`
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: get(error, 'response.data.message', 'Failed to fetch reviews'),
    };
  }
};

const createCountryAdmin = async (payload: unknown) => {
  try {
    const response = await HttpService.post('/country-admin/create', payload);
    return {
      success: true,
      data: response.data,
      message: 'Country Admin created successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: get(
        error,
        'response.data.msg',
        'Failed to create Country Admin'
      ),
    };
  }
};

const getCountryAdminListing = async () => {
  try {
    const response = await HttpService.post('/country-admin/list', {});
    return {
      success: true,
      data: response.data,
      message: 'Country Admins fetched successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: get(
        error,
        'response.data.msg',
        'Failed to fetch Country Admins'
      ),
    };
  }
};

const updateCountryAdmin = async (payload: unknown) => {
  try {
    const response = await HttpService.post('/country-admin/update', payload);
    return {
      success: true,
      data: response.data,
      message: 'Country Admin updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: get(
        error,
        'response.data.msg',
        'Failed to update Country Admin'
      ),
    };
  }
};

const updateCountryAdminStatus = async (id: number, status: number) => {
  try {
    const response = await HttpService.post('/country-admin/status/change', {
      id,
      status,
    });
    return {
      success: true,
      data: response.data,
      message: 'Status updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: get(error, 'response.data.msg', 'Failed to update status'),
    };
  }
};

const updateCountryAdminPassword = async (payload: unknown) => {
  try {
    const response = await HttpService.post(
      '/country-admin/reset/password',
      payload
    );
    return {
      success: true,
      data: response.data,
      message: 'Password updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: get(error, 'response.data.msg', 'Failed to update password'),
    };
  }
};

const getPatientDocuments = async (patientId: number) => {
  try {
    const response = await HttpService.post('/admin/patient-documents', {
      patient_id: patientId,
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching patient documents:', error);
    return {
      status: 500,
      data: [],
      message: 'Failed to fetch documents',
    };
  }
};

const getPatientAssessmentStatus = async (patientId: number) => {
  try {
    const response = await HttpService.post(
      '/admin/patient-assessment-status',
      {
        patient_id: patientId,
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching patient assessment status:', error);
    return null;
  }
};

const getPatientMedicalHistory = async (patientId: number) => {
  try {
    const response = await HttpService.post('/admin/patient-medical-history', {
      patient_id: patientId,
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching patient medical history:', error);
    return {
      status: 500,
      data: null,
      message: 'Failed to fetch medical history',
    };
  }
};

const AdminService = {
  getProductsListing,
  updateProduct, // ✅ export update service
  updateProductStatus,
  getUsersListing,
  updateUserStatus,
  getTransactionsListing,
  changeUserPassword,
  getConsultantsListing,
  updateConsultantStatus,
  createConsultant,
  updateConsultantPassword,
  getTherapistListing,
  updateTherapistStatus,
  createTherapist,
  updateTherapistPassword,
  updateConsultant,
  updateTherapist,
  getConsultationsListing,
  getExpertReviews,
  getTherapistReviews,
  createCountryAdmin,
  getCountryAdminListing,
  updateCountryAdmin,
  updateCountryAdminStatus,
  updateCountryAdminPassword,
  getPatientDocuments,
  getPatientAssessmentStatus,
  getPatientMedicalHistory,
};

export default AdminService;
