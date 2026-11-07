export type Role = 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';

export type OrganizationType = 
  | 'RESTAURANT'
  | 'HOTEL'
  | 'HOSTEL'
  | 'CANTEEN'
  | 'BAKERY'
  | 'EVENT_ORGANIZER'
  | 'NGO';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type FoodCategory = 
  | 'COOKED_FOOD'
  | 'BAKERY'
  | 'PACKAGED_FOOD'
  | 'FRUITS_VEGETABLES'
  | 'OTHER';

export type DonationStatus = 
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'VOLUNTEER_ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'CANCELLED';

export type ClaimStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export type PickupStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';

export type VerificationType = 'PICKUP' | 'DELIVERY';

export interface OrganizationDto {
  id?: number;
  organizationName: string;
  organizationType: OrganizationType;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  operatingHours?: string;
  verificationStatus: VerificationStatus;
}

export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
  organization?: OrganizationDto;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserDto;
}

export interface DonationResponse {
  id: number;
  donorId: number;
  donorName: string;
  donorPhone?: string;
  donorOrganizationName?: string;
  title: string;
  foodCategory: FoodCategory;
  description?: string;
  vegetarian: boolean;
  allergenInformation?: string;
  numberOfServings: number;
  estimatedWeightKg: number;
  preparedAt: string;
  pickupStartTime: string;
  expiresAt: string;
  pickupAddress: string;
  latitude: number;
  longitude: number;
  imagePath?: string;
  specialInstructions?: string;
  status: DonationStatus;
  createdAt: string;
  updatedAt: string;
  claimId?: number;
  ngoId?: number;
  ngoName?: string;
  ngoPhone?: string;
  assignmentId?: number;
  volunteerId?: number;
  volunteerName?: string;
  volunteerPhone?: string;
  distanceKm?: number;
}

export interface ClaimResponse {
  id: number;
  donationId: number;
  donationTitle: string;
  foodCategory: FoodCategory;
  numberOfServings: number;
  estimatedWeightKg: number;
  pickupAddress: string;
  ngoId: number;
  ngoName: string;
  claimedAt: string;
  status: ClaimStatus;
  assignmentId?: number;
  volunteerId?: number;
  volunteerName?: string;
  volunteerPhone?: string;
  assignmentStatus?: PickupStatus;
}

export interface PickupResponse {
  id: number;
  claimId: number;
  donationId: number;
  donationTitle: string;
  foodCategory: FoodCategory;
  numberOfServings: number;
  estimatedWeightKg: number;
  donorName: string;
  donorPhone?: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  ngoName: string;
  ngoPhone?: string;
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  volunteerId?: number;
  volunteerName?: string;
  status: PickupStatus;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  distanceKm?: number;
}

export interface QrCodeResponse {
  assignmentId: number;
  donationId: number;
  donationTitle: string;
  verificationType: VerificationType;
  token: string;
  qrCodeBase64: string;
  expiresAt: string;
}

export interface QrVerificationResponse {
  verified: boolean;
  message: string;
  donationId: number;
  assignmentId: number;
  verificationType: VerificationType;
  verifiedAt: string;
}

export interface ImpactStatsResponse {
  totalDelivered: number;
  mealsSaved: number;
  foodSavedKg: number;
  estimatedCo2ReductionKg: number;
  activeDonors: number;
  activeNgos: number;
  activeVolunteers: number;
}

export interface DonorDashboardResponse {
  totalDonations: number;
  activeDonations: number;
  completedDonations: number;
  totalMealsDonated: number;
  totalWeightKgDonated: number;
  estimatedCo2ReductionKg: number;
  recentDonations: DonationResponse[];
}

export interface NgoDashboardResponse {
  totalClaims: number;
  activeClaims: number;
  receivedDonations: number;
  totalMealsReceived: number;
  totalWeightKgReceived: number;
  estimatedCo2ReductionKg: number;
  recentClaims: ClaimResponse[];
}

export interface VolunteerDashboardResponse {
  totalPickups: number;
  activePickups: number;
  completedDeliveries: number;
  totalMealsDelivered: number;
  totalWeightKgDelivered: number;
  estimatedCo2ReductionKg: number;
  activeTask?: PickupResponse;
}

export interface AdminAnalyticsResponse {
  impactStats: ImpactStatsResponse;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  cityBreakdown: Record<string, number>;
  monthlyTrend: Record<string, number>;
  pendingNgoCount: number;
  totalUsers: number;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
