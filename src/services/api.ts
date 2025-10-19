import axios from 'axios';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  MemberDetails,
  MemberDetailsForm,
  ArtistWork,
  MusicUploadForm,
  DocumentUploadForm,
  Company,
  Admin,
  LogSheet,
  Invoice,
  ArtistInvoiceReports,
  LegalEntity,
  NaturalPersonEntity,
  Title,
  MusicUsageTypes,
  SourceOfMusic,
  ArtistUploadType,
  ArtistWorkType,
  Status,
  PassportPhoto,
  DashboardStats,
  ArtistStats,
  CompanyStats,
  LicenseApplicationForm,
} from '../types';


const API_BASE_URL = 'https://api.owellserver.ggff.net';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Do not attach auth header for public auth endpoints
  const url = `${config.baseURL || ''}${config.url || ''}`;
  const isAuthEndpoint = /\/api\/auth\//.test(url);
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        // Clear local auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Broadcast an auth event so the app can handle logout and navigation in a unified place
        try { localStorage.setItem('namsa:auth', JSON.stringify({ type: 'logout', timestamp: Date.now() })); } catch (e) {}
        try { window.dispatchEvent(new Event('namsa:auth')); } catch (e) {}
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

// Auth API - Updated to match ApiGuide.md exactly
export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const sanitized = {
      email: (data.email || '').trim().toLowerCase(),
      password: (data.password || '').trim(),
    };
    try {
      const response = await api.post('/api/auth/login', sanitized);
      return response.data;
    } catch (err: any) {
      // Improve network error messaging
      if (err?.message === 'Network Error' || (err?.code === 'ERR_NETWORK')) {
        throw { message: `Network Error: unable to reach API at ${API_BASE_URL}` };
      }
      throw err;
    }
  },

  registerArtist: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/api/auth/register/artist', data);
    return response.data;
  },

  registerCompany: async (data: RegisterRequest): Promise<{ message: string; userId: number }> => {
    const response = await api.post('/api/auth/register/company', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/api/auth/verify?token=${token}`);
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/reset-password', { token, newPassword });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

// Artist API - Updated to match ApiGuide.md exactly
export const artistAPI = {
  // Create Profile - full model support
  createProfile: async (data: MemberDetailsForm): Promise<MemberDetails> => {
    // Transform lookup id fields into nested objects expected by backend
    const payload: any = { ...data };
    if ((data as any).titleId) payload.tittle = { id: (data as any).titleId };
    if ((data as any).maritalStatusId) payload.maritalStatus = { id: (data as any).maritalStatusId };
    if ((data as any).memberCategoryId) payload.memberCategory = { id: (data as any).memberCategoryId };
    if ((data as any).genderId) payload.gender = { id: (data as any).genderId };
    if ((data as any).bankNameId) payload.bankName = { id: (data as any).bankNameId };
    // remove client-side id fields to avoid confusion
    delete payload.titleId;
    delete payload.maritalStatusId;
    delete payload.memberCategoryId;
    delete payload.genderId;
    delete payload.bankNameId;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/api/artist/profile', payload, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  // Documents update/delete for authenticated user
  updatePassportPhotoByUser: async (file: File, imageTitle: string): Promise<PassportPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageTitle', imageTitle);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await api.put('/api/artist2/updatephotobyuser', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; //
  },

  deletePassportPhotoByUser: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/artist2/deleteuserphoto');
    return response.data;
  },

  updateProofOfPaymentByUser: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/api/artist2/updateproofofpayuser', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProofOfPaymentByUser: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/artist2/deleteproofofpay');
    return response.data;
  },

  updateBankLetterByUser: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/api/artist2/updatebankletteruser', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteBankLetterByUser: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/artist2/deletebankletteruser');
    return response.data;
  },

  updateIdDocumentByUser: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/api/artist2/updatiddocbyuser', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteIdDocumentByUser: async (): Promise<{ message: string }> => {
    const response = await api.delete('/api/artist2/deleteuseriddoc');
    return response.data;
  },

  // Upload Passport Photo - matches ApiGuide.md exactly
  uploadPassportPhoto: async (file: File, imageTitle: string): Promise<PassportPhoto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageTitle', imageTitle);
    const response = await api.post('/api/artist/passport-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Proof of Payment - matches ApiGuide.md exactly
  uploadProofOfPayment: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/proof-of-payment', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Bank Confirmation Letter - matches ApiGuide.md exactly
  uploadBankConfirmationLetter: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/bank-confirmation-letter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload ID Document - matches ApiGuide.md exactly
  uploadIdDocument: async (file: File, documentTitle: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTitle', documentTitle);
    const response = await api.post('/api/artist/id-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Upload Music - full model support
  uploadMusic: async (musicData: MusicUploadForm): Promise<ArtistWork> => {
    const formData = new FormData();
    // Required
    formData.append('file', musicData.file);
    formData.append('title', musicData.title);

    // Optional fields mapped to backend model (case-sensitive keys)
    if (musicData.albumName) formData.append('albumName', musicData.albumName);
    if (musicData.artist) formData.append('artist', musicData.artist);
    if (musicData.groupOrBandOrStageName) formData.append('GroupOrBandOrStageName', musicData.groupOrBandOrStageName);
    if (musicData.featuredArtist) formData.append('featuredArtist', musicData.featuredArtist);
    if (musicData.producer) formData.append('producer', musicData.producer);
    if (musicData.duration) formData.append('Duration', musicData.duration);
    if (musicData.country) formData.append('country', musicData.country);
    if (musicData.artistUploadTypeId != null) formData.append('artistUploadTypeId', String(musicData.artistUploadTypeId));
    if (musicData.artistWorkTypeId != null) formData.append('artistWorkTypeId', String(musicData.artistWorkTypeId));
    if (musicData.composer) formData.append('composer', musicData.composer);
    if (musicData.author) formData.append('author', musicData.author);
    if (musicData.arranger) formData.append('arranger', musicData.arranger);
    if (musicData.publisher) formData.append('publisher', musicData.publisher);
    if (musicData.publishersName) formData.append('publishersName', musicData.publishersName);
    if (musicData.publisherAddress) formData.append('publisherAdress', musicData.publisherAddress);
    if (musicData.publisherTelephone) formData.append('publisherTelephone', musicData.publisherTelephone);
    if (musicData.recordedBy) formData.append('recordedBy', musicData.recordedBy);
    if (musicData.addressOfRecordingCompany) formData.append('AddressOfRecordingCompany', musicData.addressOfRecordingCompany);
    if (musicData.recordingCompanyTelephone) formData.append('RecordingCompanyTelephone', musicData.recordingCompanyTelephone);
    if (musicData.labelName) formData.append('labelName', musicData.labelName);
    if (musicData.dateRecorded) formData.append('dateRecorded', musicData.dateRecorded);
    // Explicit ArtistId from form (required by backend for music upload)
    if ((musicData as any).ArtistId) {
      formData.append('ArtistId', String((musicData as any).ArtistId));
    }

    // Explicit Authorization header mirrors document upload behavior
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post('/api/artist/music/upload', formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get My Music - matches ApiGuide.md exactly
  getMyMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/artist/music');
    return response.data;
  },

  // Get My Documents and Profile - aligns with controllers
  getDocuments: async (): Promise<{
    passportPhoto?: PassportPhoto;
    idDocument?: any;
    bankConfirmationLetter?: any;
    proofOfPayment?: any;
    memberDetails?: MemberDetails;
  }> => {
    const response = await api.get('/api/artist/documentsandprofile');
    return response.data;
  },

  // Additional methods for profile management
  getProfile: async (): Promise<MemberDetails> => {
    const response = await api.get('/api/artist/profile');
    return response.data;
  },

  updateProfile: async (data: MemberDetailsForm): Promise<MemberDetails> => {
    const payload: any = { ...data };
    if ((data as any).titleId) payload.tittle = { id: (data as any).titleId };
    if ((data as any).maritalStatusId) payload.maritalStatus = { id: (data as any).maritalStatusId };
    if ((data as any).memberCategoryId) payload.memberCategory = { id: (data as any).memberCategoryId };
    if ((data as any).genderId) payload.gender = { id: (data as any).genderId };
    if ((data as any).bankNameId) payload.bankName = { id: (data as any).bankNameId };
    delete payload.titleId;
    delete payload.maritalStatusId;
    delete payload.memberCategoryId;
    delete payload.genderId;
    delete payload.bankNameId;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.put('/api/artist/profile', payload, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  updateMusic: async (
    id: number,
    existing: ArtistWork,
    changes: Partial<ArtistWork>,
    file: File
  ): Promise<ArtistWork> => {
    const formData = new FormData();
    formData.append('file', file);
    // Helper to pick change value or fallback to existing
    const pick = <K extends keyof ArtistWork>(key: K, fallback: string | number | undefined = '') => {
      const value = (changes as any)[key] ?? (existing as any)[key] ?? fallback;
      return value;
    };

    formData.append('title', String(pick('title')));
    formData.append('ArtistId', String((changes as any).artistId ?? (existing as any).artistId ?? ''));
    formData.append('albumName', String(pick('albumName')));
    formData.append('artist', String(pick('artist')));
    formData.append('GroupOrBandOrStageName', String((changes as any).groupOrBandOrStageName ?? (existing as any).groupOrBandOrStageName ?? ''));
    formData.append('featuredArtist', String((changes as any).featuredArtist ?? (existing as any).featuredArtist ?? ''));
    formData.append('producer', String((changes as any).producer ?? (existing as any).producer ?? ''));
    formData.append('country', String(pick('country')));
    const uploadTypeId = (changes as any).artistUploadType?.id ?? (existing as any).artistUploadType?.id;
    const workTypeId = (changes as any).artistWorkType?.id ?? (existing as any).artistWorkType?.id;
    if (uploadTypeId != null) formData.append('artistUploadTypeId', String(uploadTypeId));
    if (workTypeId != null) formData.append('artistWorkTypeId', String(workTypeId));
    // Duration has capital D in backend
    formData.append('Duration', String((changes as any).duration ?? (existing as any).duration ?? ''));
    formData.append('composer', String((changes as any).composer ?? (existing as any).composer ?? ''));
    formData.append('author', String((changes as any).author ?? (existing as any).author ?? ''));
    formData.append('arranger', String((changes as any).arranger ?? (existing as any).arranger ?? ''));
    formData.append('publisher', String((changes as any).publisher ?? (existing as any).publisher ?? ''));
    formData.append('publishersName', String((changes as any).publishersName ?? (existing as any).publishersName ?? ''));
    // Note: backend expects 'publisherAdress' (single 'd')
    formData.append('publisherAdress', String((changes as any).publisherAddress ?? (existing as any).publisherAddress ?? ''));
    formData.append('publisherTelephone', String((changes as any).publisherTelephone ?? (existing as any).publisherTelephone ?? ''));
    formData.append('recordedBy', String((changes as any).recordedBy ?? (existing as any).recordedBy ?? ''));
    // Note case sensitivity per backend
    formData.append('AddressOfRecordingCompany', String((changes as any).addressOfRecordingCompany ?? (existing as any).addressOfRecordingCompany ?? ''));
    formData.append('labelName', String((changes as any).labelName ?? (existing as any).labelName ?? ''));
    formData.append('dateRecorded', String((changes as any).dateRecorded ?? (existing as any).dateRecorded ?? ''));
    // Clear admin notes on update per requirement; do NOT touch ISRC
    formData.append('notes', '');

    const response = await api.put(`/api/artist2/updatemusicbyuser/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMusic: async (id: number): Promise<void> => {
    await api.delete(`/api/artist2/deletemusicbyuserid/${id}`);
  },

  getStats: async (): Promise<ArtistStats> => {
    const response = await api.get('/api/artist/stats');
    return response.data;
  },
};

// Company API - Updated to match ApiGuide.md exactly
export const companyAPI = {
  // Get Company Profile - matches ApiGuide.md exactly
  getProfile: async (): Promise<Company> => {
    const response = await api.get('/api/company/profile');
    return response.data;
  },

  // Get Approved Music - matches ApiGuide.md exactly
  getApprovedMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/company/approved-music');
    return response.data;
  },

  // Create LogSheet - matches ApiGuide.md exactly
  createLogSheet: async (title: string, musicIds: number[]): Promise<LogSheet> => {
    const response = await api.post('/api/company/logsheet', { title, musicIds });
    return response.data;
  },

  // Get LogSheets - matches ApiGuide.md exactly
  getLogSheets: async (): Promise<LogSheet[]> => {
    const response = await api.get('/api/company/logsheets');
    return response.data;
  },

  // Additional methods for profile management
  updateProfile: async (data: Partial<Company>): Promise<Company> => {
    const response = await api.put('/api/company/profile', data);
    return response.data;
  },

  getLogSheetById: async (id: number): Promise<LogSheet> => {
    const response = await api.get(`/api/company/logsheet/${id}`);
    return response.data;
  },

  getStats: async (): Promise<CompanyStats> => {
    const response = await api.get('/api/company/stats');
    return response.data;
  },
};

// Admin API - Updated to match ApiGuide.md exactly
export const adminAPI = {
  // Get Pending Profiles - matches ApiGuide.md exactly
  getPendingProfiles: async (): Promise<MemberDetails[]> => {
    const response = await api.get('/api/admin/pending-profiles');
    return response.data;
  },

  // Approve Profile - matches ApiGuide.md exactly
  approveProfile: async (memberId: number, ipiNumber: string): Promise<MemberDetails> => {
    const response = await api.post(`/api/admin/profile/approve/${memberId}`, { ipiNumber });
    return response.data;
  },

  // Reject Profile - matches ApiGuide.md exactly
  rejectProfile: async (memberId: number, notes: string): Promise<MemberDetails> => {
    const response = await api.post(`/api/admin/profile/reject/${memberId}`, { notes });
    return response.data;
  },

  // Get Pending Music - matches ApiGuide.md exactly
  getPendingMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/admin/pending-music');
    return response.data;
  },

  // Approve Music - matches ApiGuide.md exactly
  approveMusic: async (musicId: number, isrcCode: string): Promise<ArtistWork> => {
    const response = await api.post(`/api/admin/music/approve/${musicId}`, { isrcCode });
    return response.data;
  },

  // Reject Music - matches ApiGuide.md exactly
  rejectMusic: async (musicId: number, notes: string): Promise<ArtistWork> => {
    const response = await api.post(`/api/admin/music/reject/${musicId}`, { notes });
    return response.data;
  },

  // User Management
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  },

  // Company Management
  getAllCompanies: async (): Promise<Company[]> => {
    const response = await api.get('/api/admin/getllcompanies');
    return response.data;
  },

  getCompanyById: async (id: number): Promise<Company> => {
    const response = await api.get(`/api/admin/getcompaniesbyid/${id}`);
    return response.data;
  },

  createCompany: async (data: {
    email: string;
    password: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    contactPerson: string;
    companyEmail: string;
  }): Promise<{ company: Company; user: User }> => {
    const response = await api.post('/api/admin/company/create', data);
    return response.data;
  },

  updateCompany: async (id: number, data: Partial<Company>): Promise<Company> => {
    const response = await api.put(`/api/admin/company/update/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/deletecompany/${id}`);
  },

  // Admin Management
  getAllAdmins: async (): Promise<Admin[]> => {
    const response = await api.get('/api/admin/admins/all');
    return response.data;
  },

  getAdminById: async (id: number): Promise<Admin> => {
    const response = await api.get(`/api/admin/admins/${id}`);
    return response.data;
  },

  createAdmin: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }): Promise<{ admin: Admin; user: User }> => {
    const response = await api.post('/api/admin/admins/create', data);
    return response.data;
  },

  updateAdmin: async (id: number, data: { name: string; role: string }): Promise<Admin> => {
    const response = await api.put(`/api/admin/admins/update/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/admins/delete/${id}`);
  },

  // LogSheet Management
  getAllLogSheets: async (): Promise<LogSheet[]> => {
    const response = await api.get('/api/admin/getallsheets');
    return response.data;
  },

  getLogSheetById: async (id: number): Promise<LogSheet> => {
    const response = await api.get(`/api/admin/logsheet/${id}`);
    return response.data;
  },

  deleteLogSheet: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/logsheet/delete/${id}`);
  },

  // Music Management
  getAllMusic: async (): Promise<ArtistWork[]> => {
    const response = await api.get('/api/admin/getllmusic');
    return response.data;
  },

  deleteMusic: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/music/delete/${id}`);
  },

  // Profile Management
  getAllProfiles: async (): Promise<MemberDetails[]> => {
    const response = await api.get('/api/admin/getallprofiles');
    return response.data;
  },

  getProfileById: async (id: number): Promise<MemberDetails> => {
    const response = await api.get(`/api/admin/getprofilebyid/${id}`);
    return response.data;
  },

  getUserDocuments: async (userId: number): Promise<{
    passportPhoto?: PassportPhoto;
    idDocument?: any;
    bankConfirmationLetter?: any;
    proofOfPayment?: any;
    memberDetails?: MemberDetails;
  }> => {
    const response = await api.get(`/api/admin/userdocumentsandprofiles/${userId}`);
    return response.data;
  },

  getUserMusic: async (userId: number): Promise<ArtistWork[]> => {
    const response = await api.get(`/api/admin/usermusic/${userId}`);
    return response.data;
  },

  // Statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },
};

// Status API for managing statuses
export const statusAPI = {
  updateStatus: async (id: number, status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<any> => {
    const response = await api.put(`/api/statuses/${id}`, { id, status });
    return response.data;
  },

  getStatusById: async (id: number): Promise<Status> => {
    const response = await api.get(`/api/statuses/${id}`);
    return response.data;
  },

  getAllStatuses: async (): Promise<Status[]> => {
    const response = await api.get('/api/statuses');
    return response.data;
  },
};

// License API
export const licenseAPI = {
  // Legal Entity
  createLegalEntity: async (data: Partial<LegalEntity>): Promise<LegalEntity> => {
    const response = await api.post('/api/legalentity/post', data);
    return response.data;
  },

  getAllLegalEntities: async (): Promise<LegalEntity[]> => {
    const response = await api.get('/api/legalentity/all');
    return response.data;
  },

  getLegalEntityById: async (id: number): Promise<LegalEntity> => {
    const response = await api.get(`/api/legalentity/${id}`);
    return response.data;
  },

  deleteLegalEntity: async (id: number): Promise<void> => {
    await api.delete(`/api/legalentity/${id}`);
  },

  // Natural Person
  createNaturalPerson: async (data: Partial<NaturalPersonEntity>): Promise<NaturalPersonEntity> => {
    const response = await api.post('/api/naturalperson/post', data);
    return response.data;
  },

  getAllNaturalPersons: async (): Promise<NaturalPersonEntity[]> => {
    const response = await api.get('/api/naturalperson/all');
    return response.data;
  },

  getNaturalPersonById: async (id: number): Promise<NaturalPersonEntity> => {
    const response = await api.get(`/api/naturalperson/${id}`);
    return response.data;
  },

  deleteNaturalPerson: async (id: number): Promise<void> => {
    await api.delete(`/api/naturalperson/${id}`);
  },
};

// Lookup APIs
export const lookupAPI = {
  getTitles: async (): Promise<Title[]> => {
    const response = await api.get('/api/tittle/all');
    return response.data;
  },
  getVatStatuses: async (): Promise<any[]> => {
    const response = await api.get('/api/vat/all');
    return response.data;
  },
  getBankNames: async (): Promise<any[]> => {
    const response = await api.get('/api/bankname/all');
    return response.data;
  },
  getMaritalStatuses: async (): Promise<any[]> => {
    const response = await api.get('/api/martial/all');
    return response.data;
  },
  getMemberCategories: async (): Promise<any[]> => {
    const response = await api.get('/api/members/all');
    return response.data;
  },
  getGenders: async (): Promise<any[]> => {
    const response = await api.get('/api/gender/all');
    return response.data;
  },

  getMusicUsageTypes: async (): Promise<MusicUsageTypes[]> => {
    const response = await api.get('/api/usagetypes/all');
    return response.data;
  },

  getSourceOfMusic: async (): Promise<SourceOfMusic[]> => {
    const response = await api.get('/api/sourceofmusic/all');
    return response.data;
  },

  getArtistUploadTypes: async (): Promise<ArtistUploadType[]> => {
    const response = await api.get('/api/uploadtype/all');
    return response.data;
  },

  getArtistWorkTypes: async (): Promise<ArtistWorkType[]> => {
    const response = await api.get('/api/worktype/all');
    return response.data;
  },

  getStatuses: async (): Promise<Status[]> => {
    const response = await api.get('/api/status/all');
    return response.data;
  },
};

// Invoice API
export const invoiceAPI = {
  sendInvoice: async (invoice: Partial<Invoice>, clientEmail: string): Promise<Invoice> => {
    // Primary attempt: build URL with raw clientEmail (no encode) and attach Authorization header explicitly
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('Not authenticated: no token found. Please login and try again.');
    }
    const url = `/api/invoices/send?clientEmail=${clientEmail}`;
    try {
      const response = await api.post(url, invoice, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      return response.data;
    } catch (err: any) {
      const status = err?.response?.status;
      // If 403, try one retry after re-reading token in case it changed
      if (status === 403) {
        const token2 = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token2) throw new Error('Forbidden: you are not authenticated. Please login and try again.');
        try {
          const retry = await api.post(url, invoice, { headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' } });
          return retry.data;
        } catch (retryErr: any) {
          const message = retryErr?.response?.data?.message || retryErr?.response?.data || retryErr?.message || 'Forbidden';
          throw new Error(`Failed to send invoice: ${message}`);
        }
      }
      throw err;
    }
  },

  getAllInvoices: async (): Promise<Invoice[]> => {
    const response = await api.get('/api/invoices/all');
    return response.data;
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  // Artist Payments
  sendArtistPayment: async (payment: Partial<ArtistInvoiceReports>, clientEmail: string): Promise<ArtistInvoiceReports> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await api.post(
      `/api/artistpayments/send?clientEmail=${clientEmail}`,
      payment,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return response.data;
  },

  getAllArtistPayments: async (): Promise<ArtistInvoiceReports[]> => {
    const response = await api.get('/api/artistpayments/all');
    return response.data;
  },
};

// File download helper
export const downloadFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export default api;
