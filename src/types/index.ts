// API Types for NAMSA Backend
export interface User {
  id: number;
  email: string;
  role: 'ARTIST' | 'COMPANY' | 'ADMIN';
  isEnabled: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Artist {
  id: number;
  artistId: string;
  user: User;
}

export interface Company {
  id: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  contactPerson: string;
  companyEmail: string;
  user: User;
}

export interface Admin {
  id: number;
  name: string;
  role: string;
  user: User;
}

export interface MemberDetails {
  id: number;
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  // Extended fields per backend model
  idNumber?: number;
  ArtistId?: string;
  pseudonym?: string;
  groupNameORStageName?: string;
  maritalStatus?: any;
  memberCategory?: any;
  noOFDependents?: number;
  typeOfWork?: string;
  gender?: any;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  poBox?: string;
  postalCode?: string;
  country?: string;
  birthDate?: string;
  placeOfBirth?: string;
  idOrPassportNumber?: string;
  nationality?: string;
  occupation?: string;
  nameOfEmployer?: string;
  addressOfEmployer?: string;
  nameOfTheBand?: string;
  dateFounded?: string;
  numberOfBand?: number;
  bankName?: any;
  accountHolderName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  bankBranchName?: string;
  bankBranchNumber?: string;
  IPI_number?: string;
  notes?: string;
  status: Status;
  user: User;
}

export interface Status {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ArtistWork {
  id: number;
  artistId?: string;
  title: string;
  albumName: string;
  artist: string;
  groupOrBandOrStageName?: string;
  featuredArtist: string;
  producer: string;
  workId: string;
  duration: string;
  fileUrl: string;
  fileType: string;
  country: string;
  uploadedDate: string;
  artistUploadType: ArtistUploadType;
  artistWorkType: ArtistWorkType;
  status: Status;
  isrcCode?: string;
  notes?: string;
  user: User;
  composer: string;
  author: string;
  arranger: string;
  publisher: string;
  publishersName: string;
  publisherAddress?: string;
  publisherTelephone: string;
  recordedBy: string;
  addressOfRecordingCompany?: string;
  recordingCompanyTelephone?: string;
  labelName: string;
  dateRecorded: string;
}

export interface ArtistUploadType {
  id: number;
  typeName: string; // video, mp3
}

export interface ArtistWorkType {
  id: number;
  workTypeName: string; // Pop, Jazz, Gospel, etc
}

export interface PassportPhoto {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  user: User;
}

export interface IdDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  user: User;
}

export interface BankConfirmationLetter {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  user: User;
}

export interface ProofOfPayment {
  id: number;
  fileName: string;
  fileUrl: string;
  uploadedDate: string;
  user: User;
}

export interface LogSheet {
  id: number;
  title: string;
  company: Company;
  createdDate: string;
  selectedMusic: ArtistWork[];
}

export interface LogSheetMusicItem {
  id: number;
  logSheet: LogSheet;
  music: ArtistWork;
  dateSelected: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  billingToCompanyName: string;
  billingToCompanyAddress: string;
  billingToCompanyPhone: string;
  billingToCompanyEmail: string;
  invoiceServiceType: string;
  totalUsed: number;
  unitPrice: number;
  totalAmount: number;
  totalNetAmount: number;
  accountNumber: number;
  bankName: string;
  branchName: string;
}

export interface ArtistInvoiceReports {
  id: number;
  artistName: string;
  artistId: string;
  totalEarnings: number;
  period: string;
  generatedDate: string;
}

// License Types
export interface LegalEntity {
  id: number;
  companyName: string;
  companyShortName: string;
  registrationNumber: string;
  vatStatus: string;
  vatNumber: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerTitle: Title;
  numberOfPremises: number;
  buildingName: string;
  unitNoOrShop: string;
  street: string;
  suburb: string;
  cityOrTown: string;
  country: string;
  postalCode: string;
  musicUsageType: MusicUsageTypes;
  sourceOfMusic: SourceOfMusic;
}

export interface NaturalPersonEntity {
  id: number;
  surname: string;
  firstName: string;
  idNumber: number;
  title: Title;
  businessRoleOrTitle: string;
  email: string;
  phone: string;
  fax: string;
  addressLocation: string;
  unitNo: string;
  cityOrTown: string;
  suburb: string;
  province: string;
  country: string;
  postalCode: string;
  street: string;
  numberOfPremises: number;
  commencementDate: string;
  tradingNameOfBusiness: string;
  musicUsageType: MusicUsageTypes;
  sourceOfMusic: SourceOfMusic;
}

export interface Title {
  id: number;
  titleName: string;
}

export interface MusicUsageTypes {
  id: number;
  usageType: string; // sport, live events, performance, bars, buses, fitness
}

export interface SourceOfMusic {
  id: number;
  sourceOfMusic: string; // Radio, Pre-recorded, TV Audio, Other
}

export interface VatStatus {
  id: number;
  statusName: string; // VAT Registered, VAT Not Registered, Registration In Progress
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Statistics types
export interface DashboardStats {
  totalUsers: number;
  totalArtists: number;
  totalCompanies: number;
  totalMusic: number;
  approvedMusic: number;
  pendingMusic: number;
  rejectedMusic: number;
  totalLogSheets: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'music_upload' | 'profile_approval' | 'music_approval' | 'logsheet_created';
  description: string;
  timestamp: string;
  user?: string;
}

export interface ArtistStats {
  totalUploads: number;
  approvedMusic: number;
  pendingMusic: number;
  rejectedMusic: number;
  totalPlays: number;
  totalDownloads: number;
  recentActivity: ActivityItem[];
}

export interface CompanyStats {
  totalLogSheets: number;
  totalMusicUsed: number;
  activeArtistsCount: number;
  approvedMusicLibrary: number;
  approvedMusicCount: number;
  logSheetsCount: number;
  activeArtists: number;
  totalTracksUsed: number;
  totalMusicSelected: number;
  totalSpent: number;
  recentActivity: ActivityItem[];
}

// Full Member Details Form - includes all MemberDetails fields except auto-generated ones
export interface MemberDetailsForm {
  // Required fields
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  
  // Personal information
  idNumber?: number;
  pseudonym?: string;
  groupNameORStageName?: string;
  noOFDependents?: number;
  typeOfWork?: string;
  
  // Address details
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  poBox?: string;
  postalCode?: string;
  country?: string;
  
  // Birth and identity
  birthDate?: string;
  placeOfBirth?: string;
  idOrPassportNumber?: string;
  nationality?: string;
  occupation?: string;
  
  // Employment
  nameOfEmployer?: string;
  addressOfEmployer?: string;
  
  // Band information
  nameOfTheBand?: string;
  dateFounded?: string;
  numberOfBand?: number;
  
  // Banking information
  accountHolderName?: string;
  bankAccountNumber?: string;
  bankAccountType?: string;
  bankBranchName?: string;
  bankBranchNumber?: string;
  bankNameId?: number;
  
  // Lookup references
  titleId?: number;
  maritalStatusId?: number;
  memberCategoryId?: number;
  genderId?: number;
  
  // Excluded auto-generated fields:
  // - ArtistId (generated by backend)
  // - IPI_number (assigned by admin)
  // - notes (assigned by admin)
}

// Full Music Upload Form - includes all ArtistWork fields except auto-generated ones
export interface MusicUploadForm {
  // Required fields
  title: string;
  file: File;
  // Required by backend for upload
  ArtistId?: string;
  
  // Basic track information
  albumName?: string;
  artist?: string;
  groupOrBandOrStageName?: string;
  featuredArtist?: string;
  producer?: string;
  duration?: string;
  country?: string;
  
  // Upload and work type
  artistUploadTypeId?: number;
  artistWorkTypeId?: number;
  
  // Creative credits
  composer?: string;
  author?: string;
  arranger?: string;
  publisher?: string;
  publishersName?: string;
  publisherAddress?: string;
  publisherTelephone?: string;
  
  // Recording information
  recordedBy?: string;
  addressOfRecordingCompany?: string;
  recordingCompanyTelephone?: string;
  labelName?: string;
  dateRecorded?: string;
  
  // Notes
  
  // Excluded auto-generated fields:
  // - workId (generated by backend)
  // - ISRC_code (assigned by admin)
  // - notes (assigned by admin)
}

export interface DocumentUploadForm {
  passportPhoto?: File;
  idDocument?: File;
  bankConfirmationLetter?: File;
  proofOfPayment?: File;
}

export interface LicenseApplicationForm {
  applicationType: 'legal' | 'natural';
  // Legal Entity fields
  companyName?: string;
  companyShortName?: string;
  registrationNumber?: string;
  vatStatus?: string;
  vatStatusId?: number;
  vatNumber?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerTitleId?: number;
  // Natural Person fields
  surname?: string;
  firstName?: string;
  idNumber?: number;
  titleId?: number;
  businessRoleOrTitle?: string;
  email?: string;
  phone?: string;
  fax?: string;
  // Common fields
  addressLocation?: string;
  unitNo?: string;
  cityOrTown?: string;
  suburb?: string;
  province?: string;
  country?: string;
  postalCode?: string;
  street?: string;
  numberOfPremises?: number;
  commencementDate?: string;
  tradingNameOfBusiness?: string;
  musicUsageTypeId?: number;
  sourceOfMusicId?: number;
  buildingName?: string;
  unitNoOrShop?: string;
}
