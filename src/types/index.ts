export type TalentType = "HOST" | "KOC" | "KOL" | "HYBRID";
export type PlatformType = "TIKTOK_LIVE" | "SHOPEE_LIVE" | "FACEBOOK_LIVE";
export type TalentStatus = "AVAILABLE" | "BOOKED" | "BUSY";
export type ShiftStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type SampleStatus = "PENDING_DISPATCH" | "SHIPPED" | "DELIVERED" | "REVIEWED";

export type TaskPriority = "HIGH" | "MEDIUM" | "LOW";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  assigneeRole: UserRole;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  relatedCampaignName?: string;
  relatedTalentName?: string;
}

export type UserRole = "ADMIN" | "COORDINATOR" | "ACCOUNTANT" | "STAFF";

export interface UserPermissions {
  manageTalents: boolean;
  manageCampaigns: boolean;
  manageSchedule: boolean;
  viewReports: boolean;
  manageSettings: boolean;
  manageUsers: boolean;
  contactTalent: boolean;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  department: string;
  status: "ACTIVE" | "INACTIVE";
  permissions: UserPermissions;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  isMe?: boolean;
  attachedSkuName?: string;
  attachedShiftTitle?: string;
  isPinned?: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  isChannel: boolean;
  avatarUrl?: string;
  roleOrCategory?: string;
  unreadCount?: number;
  isOnline?: boolean;
  lastMessage?: string;
  lastTimestamp?: string;
  memberIds?: string[];
  pinnedMessage?: string;
}

export interface TalentChannel {
  platform: PlatformType;
  handle: string;
  followers: number;
  avgViews: number;
}

export interface TalentMedia {
  id: string;
  type: "IMAGE_GMV" | "VIDEO_LIVE";
  title: string;
  url: string;
  thumbnailUrl?: string;
  gmvAmount?: number;
  sessionDate?: string;
  platform?: PlatformType;
}

export interface Talent {
  id: string;
  fullName: string;
  stageName: string;
  talentType: TalentType;
  phone: string;
  email?: string;
  zalo?: string;
  address?: string;
  avatarUrl: string;
  categories: string[];
  tags: string[];
  channels: TalentChannel[];
  internalRating: number;
  avgGmvPerHour: number;
  avgViewsPerVideo: number;
  fixedRatePerShift: number;
  videoRate: number;
  affiliateCommission: number;
  exclusivityBrands: string[];
  taxCode?: string;
  bankName?: string;
  accountNumber?: string;
  status: TalentStatus;
  mediaList?: TalentMedia[];
}

export interface BrandSku {
  id: string;
  brandId: string;
  brandName?: string;
  skuCode: string;
  productName: string;
  category: string;
  originalPrice: number;
  livePromoPrice: number;
  commissionRate: number;
  keyUsp: string;
  sampleStock: number;
  imageUrl?: string;
  scriptNotes?: string;
}

export interface Brand {
  id: string;
  brandName: string;
  companyName: string;
  taxCode: string;
  industry: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  zalo?: string;
  address?: string;
  logoUrl?: string;
  contractStatus: "ACTIVE" | "PROSPECT" | "PAUSED";
  skusCount?: number;
  totalCampaigns?: number;
  totalRevenue?: number;
  rating?: number;
  scriptNotes?: string;
}

export interface BookingCampaign {
  id: string;
  brandId: string;
  brandName: string;
  campaignName: string;
  budget: number;
  targetGmv: number;
  startDate: string;
  endDate: string;
  shiftsCount?: number;
  description?: string;
  scriptUrl?: string;
}

export interface BookingShift {
  id: string;
  campaignId: string;
  campaignName: string;
  brandName: string;
  talentId: string;
  talentName: string;
  talentType: TalentType;
  platform: PlatformType;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  shiftStatus: ShiftStatus;
  assignedSkus: BrandSku[];
  actualGmv: number;
  actualViews: number;
  peakConcurrent: number;
  scriptUrl?: string;
}

export interface SalesReportMetrics {
  totalGmv: number;
  netAgencyRevenue: number;
  totalCastFeesPaid: number;
  totalCommissionsPaid: number;
  shiftsCompletedCount: number;
}
