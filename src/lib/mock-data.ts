import { Talent, Brand, BrandSku, BookingCampaign, BookingShift, UserAccount, ChatConversation, ChatMessage, TaskItem } from "@/types";

export const MOCK_USERS: UserAccount[] = [
  {
    id: "usr-admin",
    fullName: "Admin Quản Trị Viên",
    email: "admin@agency.vn",
    phone: "0987654321",
    password: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    role: "ADMIN",
    department: "Ban Giám Đốc",
    status: "ACTIVE",
    createdAt: "2026-01-01",
    permissions: {
      manageTalents: true,
      manageCampaigns: true,
      manageSchedule: true,
      viewReports: true,
      manageSettings: true,
      manageUsers: true,
      contactTalent: true,
    },
  },
];

export const MOCK_TALENTS: Talent[] = [];
export const MOCK_BRANDS: Brand[] = [];
export const MOCK_SKUS: BrandSku[] = [];
export const MOCK_CAMPAIGNS: BookingCampaign[] = [];
export const MOCK_SHIFTS: BookingShift[] = [];
export const MOCK_TASKS: TaskItem[] = [];
export const MOCK_CONVERSATIONS: ChatConversation[] = [];
export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};
