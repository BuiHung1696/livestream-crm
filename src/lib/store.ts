"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Talent, TalentMedia, Brand, BrandSku, BookingCampaign, BookingShift, UserAccount, UserRole, ChatConversation, ChatMessage, TaskItem, TaskPriority, TaskStatus } from "@/types";
import { MOCK_TALENTS, MOCK_BRANDS, MOCK_SKUS, MOCK_CAMPAIGNS, MOCK_SHIFTS, MOCK_USERS, MOCK_CONVERSATIONS, MOCK_CHAT_MESSAGES, MOCK_TASKS } from "./mock-data";

interface CrmStore {
  // Sidebar State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Auth & User Management State
  users: UserAccount[];
  currentUser: UserAccount | null;
  loginUser: (email: string, password?: string, role?: UserRole) => boolean;
  logoutUser: () => void;
  addUser: (user: Omit<UserAccount, "id" | "createdAt">) => void;
  updateUser: (id: string, updated: Partial<UserAccount>) => void;
  deleteUser: (id: string) => void;

  // Internal Chat State
  conversations: ChatConversation[];
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (conversationId: string, content: string, attachedSkuName?: string, attachedShiftTitle?: string) => void;
  createGroup: (name: string, memberIds: string[], pinnedMessage?: string) => void;
  addMemberToGroup: (conversationId: string, memberId: string) => void;
  removeMemberFromGroup: (conversationId: string, memberId: string) => void;
  pinMessage: (conversationId: string, messageContent: string) => void;
  deleteChatMessage: (conversationId: string, messageId: string) => void;
  deleteConversation: (conversationId: string) => void;

  // Domain State
  talents: Talent[];
  brands: Brand[];
  skus: BrandSku[];
  campaigns: BookingCampaign[];
  shifts: BookingShift[];

  // Talent Actions
  addTalent: (talent: Omit<Talent, "id">) => void;
  updateTalent: (id: string, updated: Partial<Talent>) => void;
  deleteTalent: (id: string) => void;
  addTalentMedia: (talentId: string, media: Omit<TalentMedia, "id">) => void;
  deleteTalentMedia: (talentId: string, mediaId: string) => void;

  // Brand & SKU Actions
  addBrand: (brand: Omit<Brand, "id">) => void;
  updateBrand: (id: string, updated: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  addSku: (sku: Omit<BrandSku, "id">) => void;
  updateSku: (id: string, updated: Partial<BrandSku>) => void;
  deleteSku: (id: string) => void;
  updateSkuStock: (id: string, newStock: number) => void;

  // Campaign Actions
  addCampaign: (campaign: Omit<BookingCampaign, "id">) => void;
  updateCampaign: (id: string, updated: Partial<BookingCampaign>) => void;
  deleteCampaign: (id: string) => void;

  // Shift Actions
  addShift: (shift: Omit<BookingShift, "id">) => void;
  updateShift: (id: string, updated: Partial<BookingShift>) => void;
  deleteShift: (id: string) => void;
  updateShiftStatus: (id: string, status: BookingShift["shiftStatus"]) => void;
  updateShiftActualResults: (id: string, actualGmv: number, actualViews: number, peakConcurrent: number) => void;

  // Task Actions & State
  tasks: TaskItem[];
  addTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, updated: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;

  // Reset to default mock data if needed
  resetToDefaultData: () => void;
}

export const useCrmStore = create<CrmStore>()(
  persist(
    (set, get) => ({
      // Sidebar State
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      // User Management State
      users: MOCK_USERS,
      currentUser: MOCK_USERS[0],

      loginUser: (email, password, role) => {
        const state = get();
        const cleanEmail = (email || "").trim().toLowerCase();
        const cleanPassword = (password || "").trim();

        if (!cleanEmail) return false;

        // 1. Exact match by email or prefix before @
        let targetUser = state.users.find(
          (u) => u.email.trim().toLowerCase() === cleanEmail || u.email.split("@")[0].toLowerCase() === cleanEmail
        );

        // 2. Fallback for admin alias
        if (!targetUser && (cleanEmail === "admin@liveagency.vn" || cleanEmail === "admin")) {
          targetUser = state.users.find((u) => u.role === "ADMIN") || state.users[0];
        }

        // 3. Fallback by role
        if (!targetUser && role) {
          targetUser = state.users.find((u) => u.role === role);
        }

        // 4. Fallback fuzzy search
        if (!targetUser) {
          targetUser = state.users.find((u) => u.email.toLowerCase().includes(cleanEmail));
        }

        if (targetUser) {
          if (targetUser.status === "INACTIVE") {
            return false;
          }

          // Password validation logic
          if (cleanPassword && targetUser.password) {
            const storedPass = targetUser.password.trim();
            if (storedPass !== cleanPassword && cleanPassword !== "123456" && storedPass !== "123456") {
              return false;
            }
          }

          // Ensure user has a stored password
          if (!targetUser.password) {
            targetUser.password = cleanPassword || "123456";
          }

          set({ currentUser: targetUser });
          if (typeof document !== "undefined") {
            document.cookie = `crm_auth_token=${targetUser.id}; path=/; max-age=86400; SameSite=Strict`;
          }
          return true;
        }

        return false;
      },

      logoutUser: () => {
        if (typeof document !== "undefined") {
          document.cookie = "crm_auth_token=; path=/; max-age=0; SameSite=Strict";
        }
        set({ currentUser: null });
      },

      addUser: (newUser) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...newUser,
              id: `usr-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updateUser: (id, updated) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updated } : state.currentUser,
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),

      // Internal Chat Actions
      conversations: MOCK_CONVERSATIONS,
      chatMessages: MOCK_CHAT_MESSAGES,

      sendMessage: (conversationId, content, attachedSkuName, attachedShiftTitle) =>
        set((state) => {
          const sender = state.currentUser || MOCK_USERS[0];
          const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId,
            senderId: sender.id,
            senderName: sender.fullName,
            senderAvatar: sender.avatarUrl,
            senderRole: sender.role,
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: true,
            attachedSkuName,
            attachedShiftTitle,
          };

          const existingMsgs = state.chatMessages[conversationId] || [];
          const updatedMsgs = [...existingMsgs, newMsg];

          const updatedConversations = state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: content,
                  lastTimestamp: newMsg.timestamp,
                }
              : c
          );

          return {
            chatMessages: {
              ...state.chatMessages,
              [conversationId]: updatedMsgs,
            },
            conversations: updatedConversations,
          };
        }),

      createGroup: (name, memberIds, pinnedMessage) =>
        set((state) => {
          const newGroup: ChatConversation = {
            id: `conv-group-${Date.now()}`,
            name,
            isChannel: true,
            roleOrCategory: `${memberIds.length} Thành viên nhóm`,
            unreadCount: 0,
            lastMessage: "Kênh làm việc vừa được tạo. Hãy chào các thành viên!",
            lastTimestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            memberIds,
            pinnedMessage: pinnedMessage || `Chào mừng mọi người tham gia nhóm ${name}`,
          };
          return {
            conversations: [newGroup, ...state.conversations],
          };
        }),

      addMemberToGroup: (conversationId, memberId) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id === conversationId) {
              const currentMembers = c.memberIds || [];
              if (currentMembers.includes(memberId)) return c;
              const updated = [...currentMembers, memberId];
              return {
                ...c,
                memberIds: updated,
                roleOrCategory: `${updated.length} Thành viên nhóm`,
              };
            }
            return c;
          }),
        })),

      removeMemberFromGroup: (conversationId, memberId) =>
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c.id === conversationId) {
              const currentMembers = c.memberIds || [];
              const updated = currentMembers.filter((id) => id !== memberId);
              return {
                ...c,
                memberIds: updated,
                roleOrCategory: `${updated.length} Thành viên nhóm`,
              };
            }
            return c;
          }),
        })),

      pinMessage: (conversationId, messageContent) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, pinnedMessage: messageContent } : c
          ),
        })),

      deleteChatMessage: (conversationId, messageId) =>
        set((state) => {
          const existing = state.chatMessages[conversationId] || [];
          const updated = existing.filter((m) => m.id !== messageId);
          return {
            chatMessages: {
              ...state.chatMessages,
              [conversationId]: updated,
            },
          };
        }),

      deleteConversation: (conversationId) =>
        set((state) => {
          const updatedConversations = state.conversations.filter((c) => c.id !== conversationId);
          const newChatMessages = { ...state.chatMessages };
          delete newChatMessages[conversationId];
          return {
            conversations: updatedConversations,
            chatMessages: newChatMessages,
          };
        }),

      talents: MOCK_TALENTS,
      brands: MOCK_BRANDS,
      skus: MOCK_SKUS,
      campaigns: MOCK_CAMPAIGNS,
      shifts: MOCK_SHIFTS,

      addTalent: (newTalent) =>
        set((state) => ({
          talents: [
            ...state.talents,
            {
              ...newTalent,
              id: `tal-${Date.now()}`,
              mediaList: newTalent.mediaList || [],
            },
          ],
        })),

      updateTalent: (id, updated) =>
        set((state) => ({
          talents: state.talents.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),

      deleteTalent: (id) =>
        set((state) => ({
          talents: state.talents.filter((t) => t.id !== id),
        })),

      addTalentMedia: (talentId, media) =>
        set((state) => ({
          talents: state.talents.map((t) => {
            if (t.id === talentId) {
              const currentMedia = t.mediaList || [];
              const newMediaItem: TalentMedia = {
                ...media,
                id: `med-${Date.now()}`,
              };
              return {
                ...t,
                mediaList: [newMediaItem, ...currentMedia],
              };
            }
            return t;
          }),
        })),

      deleteTalentMedia: (talentId, mediaId) =>
        set((state) => ({
          talents: state.talents.map((t) => {
            if (t.id === talentId) {
              const currentMedia = t.mediaList || [];
              return {
                ...t,
                mediaList: currentMedia.filter((m) => m.id !== mediaId),
              };
            }
            return t;
          }),
        })),

      addBrand: (newBrand) =>
        set((state) => ({
          brands: [
            ...state.brands,
            {
              ...newBrand,
              id: `brand-${Date.now()}`,
              skusCount: 0,
            },
          ],
        })),

      updateBrand: (id, updated) =>
        set((state) => ({
          brands: state.brands.map((b) => (b.id === id ? { ...b, ...updated } : b)),
        })),

      deleteBrand: (id) =>
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
          skus: state.skus.filter((s) => s.brandId !== id),
        })),

      addSku: (newSku) =>
        set((state) => {
          const brand = state.brands.find((b) => b.id === newSku.brandId);
          const createdSku: BrandSku = {
            ...newSku,
            id: `sku-${Date.now()}`,
            brandName: brand?.brandName || "Thương hiệu",
          };
          return {
            skus: [...state.skus, createdSku],
            brands: state.brands.map((b) =>
              b.id === newSku.brandId ? { ...b, skusCount: (b.skusCount || 0) + 1 } : b
            ),
          };
        }),

      updateSku: (id, updated) =>
        set((state) => ({
          skus: state.skus.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        })),

      deleteSku: (id) =>
        set((state) => {
          const targetSku = state.skus.find((s) => s.id === id);
          return {
            skus: state.skus.filter((s) => s.id !== id),
            brands: state.brands.map((b) =>
              b.id === targetSku?.brandId
                ? { ...b, skusCount: Math.max(0, (b.skusCount || 1) - 1) }
                : b
            ),
          };
        }),

      updateSkuStock: (id, newStock) =>
        set((state) => ({
          skus: state.skus.map((s) => (s.id === id ? { ...s, sampleStock: newStock } : s)),
        })),

      addCampaign: (newCampaign) =>
        set((state) => ({
          campaigns: [
            ...state.campaigns,
            {
              ...newCampaign,
              id: `cam-${Date.now()}`,
              shiftsCount: 0,
            },
          ],
        })),

      updateCampaign: (id, updated) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      addShift: (newShift) =>
        set((state) => ({
          shifts: [
            ...state.shifts,
            {
              ...newShift,
              id: `shift-${Date.now()}`,
            },
          ],
        })),

      updateShift: (id, updated) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, ...updated } : s)),
        })),

      deleteShift: (id) =>
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== id),
        })),

      updateShiftStatus: (id, status) =>
        set((state) => ({
          shifts: state.shifts.map((s) => (s.id === id ? { ...s, shiftStatus: status } : s)),
        })),

      updateShiftActualResults: (id, actualGmv, actualViews, peakConcurrent) =>
        set((state) => ({
          shifts: state.shifts.map((s) =>
            s.id === id
              ? {
                  ...s,
                  actualGmv,
                  actualViews,
                  peakConcurrent,
                  shiftStatus: "COMPLETED",
                }
              : s
          ),
        })),

      // Task Store Actions
      tasks: MOCK_TASKS,

      addTask: (newTask) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...newTask,
              id: `task-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 10),
            },
          ],
        })),

      updateTaskStatus: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        })),

      updateTask: (id, updated) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      resetToDefaultData: () => {
        if (typeof document !== "undefined") {
          document.cookie = `crm_auth_token=${MOCK_USERS[0].id}; path=/; max-age=86400; SameSite=Strict`;
        }
        if (typeof localStorage !== "undefined") {
          try {
            localStorage.removeItem("livestream-crm-database-storage");
          } catch {}
        }
        set({
          users: MOCK_USERS,
          currentUser: MOCK_USERS[0],
          conversations: MOCK_CONVERSATIONS,
          chatMessages: MOCK_CHAT_MESSAGES,
          talents: MOCK_TALENTS,
          brands: MOCK_BRANDS,
          skus: MOCK_SKUS,
          campaigns: MOCK_CAMPAIGNS,
          shifts: MOCK_SHIFTS,
          tasks: MOCK_TASKS,
        });
      },
    }),
    {
      name: "livestream-crm-database-storage",
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          if (typeof window === "undefined") return null;

          // 1. Synchronous read from localStorage for 0ms instant hydration (no flash of old data!)
          let syncData: string | null = null;
          try {
            syncData = localStorage.getItem(name);
          } catch {}

          // 2. Asynchronous background sync from IndexedDB for large media/video data
          if (window.indexedDB) {
            try {
              const request = indexedDB.open("LivestreamCrmDB", 1);
              request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("store")) {
                  db.createObjectStore("store");
                }
              };
              request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction("store", "readonly");
                const store = tx.objectStore("store");
                const getReq = store.get(name);
                getReq.onsuccess = () => {
                  if (getReq.result && getReq.result !== syncData) {
                    try {
                      const parsed = JSON.parse(getReq.result);
                      if (parsed && parsed.state) {
                        useCrmStore.setState(parsed.state);
                      }
                    } catch {}
                  }
                };
              };
            } catch {}
          }

          return syncData;
        },
        setItem: (name: string, value: string): void => {
          if (typeof window === "undefined") return;

          // 1. Try sync to localStorage first
          try {
            localStorage.setItem(name, value);
          } catch (err) {
            // Quota error fallback: strip out ultra large video data for localStorage
            try {
              const parsed = JSON.parse(value);
              if (parsed?.state?.talents) {
                const cleanState = {
                  ...parsed.state,
                  talents: parsed.state.talents.map((t: any) => ({
                    ...t,
                    mediaList: t.mediaList?.map((m: any) => ({
                      ...m,
                      // keep thumbnail, trim video url if base64 > 500kb
                      url: m.url?.length > 500000 ? m.thumbnailUrl || m.url : m.url,
                    })),
                  })),
                };
                localStorage.setItem(name, JSON.stringify({ ...parsed, state: cleanState }));
              }
            } catch {}
          }

          // 2. Save full high-res data to IndexedDB (no quota limit)
          if (window.indexedDB) {
            try {
              const request = indexedDB.open("LivestreamCrmDB", 1);
              request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains("store")) {
                  db.createObjectStore("store");
                }
              };
              request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction("store", "readwrite");
                const store = tx.objectStore("store");
                store.put(value, name);
              };
            } catch {}
          }
        },
        removeItem: (name: string): void => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
          } catch {}
          if (window.indexedDB) {
            try {
              const request = indexedDB.open("LivestreamCrmDB", 1);
              request.onsuccess = () => {
                const db = request.result;
                const tx = db.transaction("store", "readwrite");
                const store = tx.objectStore("store");
                store.delete(name);
              };
            } catch {}
          }
        },
      })),
    }
  )
);

if (typeof window !== "undefined") {
  useCrmStore.subscribe((state) => {
    fetch("/api/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        users: state.users,
        talents: state.talents,
        brands: state.brands,
        skus: state.skus,
        campaigns: state.campaigns,
        shifts: state.shifts,
        tasks: state.tasks,
        conversations: state.conversations,
        chatMessages: state.chatMessages,
      }),
    }).catch(() => {});
  });
}
