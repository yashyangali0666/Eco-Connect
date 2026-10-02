export type Role = 'USER' | 'STAFF' | 'ADMIN';

export type RequestStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'OUT_FOR_PICKUP'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface StaffProfile {
  id: string;
  vehicleType: string | null;
  vehicleNumber: string | null;
  serviceArea: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  staffProfile?: StaffProfile | null;
  _count?: {
    pickupRequests?: number;
    assignedPickups?: number;
  };
}

export interface WasteCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string | null;
  acceptedItems: string[];
  rejectedItems: string[];
  disposalInstructions: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    pickupRequests?: number;
  };
}

export interface PickupImage {
  id: string;
  pickupRequestId: string;
  url: string;
  filename: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  pickupRequestId: string;
  userId: string | null;
  action: string;
  description: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface Comment {
  id: string;
  pickupRequestId: string;
  userId: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: Role;
    avatar: string | null;
  };
}

export interface PickupRequest {
  id: string;
  requestNumber: string;
  userId: string;
  wasteCategoryId: string;
  quantity: number;
  unit: string;
  description: string | null;
  pickupAddress: string;
  city: string;
  state: string;
  postalCode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  pickupDate: string;
  timeSlot: string;
  status: RequestStatus;
  assignedStaffId: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
  wasteCategory: WasteCategory;
  assignedStaff?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar?: string | null;
    staffProfile?: StaffProfile | null;
  } | null;
  images?: PickupImage[];
  activityLogs?: ActivityLog[];
  comments?: Comment[];
  _count?: {
    comments?: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  pickupRequestId: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'STATUS_CHANGE';
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
