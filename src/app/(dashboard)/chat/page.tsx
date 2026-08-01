"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { ChatConversation, ChatMessage } from "@/types";
import {
  MessageSquare,
  Search,
  Send,
  Plus,
  Phone,
  Video,
  Info,
  Hash,
  Package,
  Pin,
  X,
  Users,
  UserPlus,
  UserMinus,
  Calendar,
  Check,
  Trash2,
  Lock,
} from "lucide-react";

export default function ChatPage() {
  const {
    conversations,
    chatMessages,
    sendMessage,
    createGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    pinMessage,
    deleteChatMessage,
    deleteConversation,
    currentUser,
    skus,
    shifts,
    users,
    talents,
  } = useCrmStore();

  const isAdmin = currentUser?.role === "ADMIN";

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0]?.id || "conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "CHANNELS" | "DMS">("ALL");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Forms & Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const [groupForm, setGroupForm] = useState({
    name: "",
    pinnedMessage: "Kênh thảo luận công việc & điều phối ca live mới.",
    selectedMemberIds: [currentUser?.id || "usr-admin"],
  });

  const [inputMessage, setInputMessage] = useState("");
  const [selectedSkuAttach, setSelectedSkuAttach] = useState<string>("");
  const [selectedShiftAttach, setSelectedShiftAttach] = useState<string>("");

  // Dynamic conversations list
  const allAvailableConvs = [...conversations];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();

    users.forEach((u) => {
      if (u.id === currentUser?.id) return;
      const matches = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
      const exists = allAvailableConvs.some((c) => c.name.toLowerCase().includes(u.fullName.toLowerCase()));
      if (matches && !exists) {
        allAvailableConvs.push({
          id: `conv-user-${u.id}`,
          name: `${u.fullName} (${u.role})`,
          isChannel: false,
          avatarUrl: u.avatarUrl,
          roleOrCategory: u.department,
          isOnline: u.status === "ACTIVE",
          lastMessage: "Bấm để bắt đầu trò chuyện trực tiếp.",
          lastTimestamp: "Mới",
          memberIds: [currentUser?.id || "usr-admin", u.id],
        });
      }
    });

    talents.forEach((t) => {
      const matches = t.stageName.toLowerCase().includes(q) || t.fullName.toLowerCase().includes(q) || t.talentType.toLowerCase().includes(q);
      const exists = allAvailableConvs.some((c) => c.name.toLowerCase().includes(t.stageName.toLowerCase()));
      if (matches && !exists) {
        allAvailableConvs.push({
          id: `conv-tal-${t.id}`,
          name: `${t.stageName} (${t.talentType})`,
          isChannel: false,
          avatarUrl: t.avatarUrl,
          roleOrCategory: `${t.talentType} - ${t.categories.join(", ")}`,
          isOnline: t.status === "AVAILABLE",
          lastMessage: "Bấm để trao đổi lịch live với Talent.",
          lastTimestamp: "Mới",
          memberIds: [currentUser?.id || "usr-admin", t.id],
        });
      }
    });
  }

  const filteredConvs = allAvailableConvs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.roleOrCategory && c.roleOrCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === "CHANNELS") return matchesSearch && c.isChannel;
    if (filterType === "DMS") return matchesSearch && !c.isChannel;
    return matchesSearch;
  });

  const activeConv = allAvailableConvs.find((c) => c.id === activeConvId) || allAvailableConvs[0] || conversations[0];
  const activeMessages = chatMessages[activeConvId] || [];

  const handleSelectConv = (conv: ChatConversation) => {
    setActiveConvId(conv.id);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedSkuAttach && !selectedShiftAttach) return;

    sendMessage(
      activeConvId,
      inputMessage.trim(),
      selectedSkuAttach || undefined,
      selectedShiftAttach || undefined
    );
    setInputMessage("");
    setSelectedSkuAttach("");
    setSelectedShiftAttach("");
  };

  const handleQuickReply = (text: string) => {
    setInputMessage(text);
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) return;

    createGroup(groupForm.name, groupForm.selectedMemberIds, groupForm.pinnedMessage);
    setIsCreateGroupOpen(false);

    setNotification({
      type: "success",
      title: "Tạo Nhóm Mới Thành Công",
      message: `Đã tạo nhóm làm việc ${groupForm.name} với ${groupForm.selectedMemberIds.length} thành viên.`,
    });
  };

  const toggleGroupMemberSelection = (id: string) => {
    if (groupForm.selectedMemberIds.includes(id)) {
      setGroupForm({
        ...groupForm,
        selectedMemberIds: groupForm.selectedMemberIds.filter((mId) => mId !== id),
      });
    } else {
      setGroupForm({
        ...groupForm,
        selectedMemberIds: [...groupForm.selectedMemberIds, id],
      });
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    removeMemberFromGroup(activeConvId, memberId);
    setNotification({
      type: "success",
      title: "Đã Xóa Thành Viên Khỏi Nhóm",
      message: `Đã xóa ${memberName} khỏi nhóm ${activeConv.name}.`,
    });
  };

  const handleAddMemberToActiveGroup = (memberId: string, memberName: string) => {
    addMemberToGroup(activeConvId, memberId);
    setIsAddMemberModalOpen(false);
    setNotification({
      type: "success",
      title: "Đã Thêm Thành Viên Vào Nhóm",
      message: `Đã thêm ${memberName} vào nhóm ${activeConv.name}.`,
    });
  };

  // ADMIN ACTION 1: Delete specific chat message
  const handleDeleteMessage = (msgId: string) => {
    if (!isAdmin) return;
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Tin Nhắn",
      message: "Bạn có chắc chắn muốn xóa vĩnh viễn tin nhắn này khỏi luồng trò chuyện?",
      confirmText: "Xóa Tin Nhắn",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteChatMessage(activeConvId, msgId);
      },
    });
  };

  // ADMIN ACTION 2: Delete entire conversation / channel thread
  const handleDeleteConversation = () => {
    if (!isAdmin) return;
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Cuộc Trò Chuyện",
      message: `Bạn có chắc chắn muốn xóa toàn bộ kênh/cuộc trò chuyện "${activeConv?.name}" và tất cả lịch sử tin nhắn?`,
      confirmText: "Xóa Kênh/Hội Thoại",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteConversation(activeConvId);
        const remaining = conversations.filter((c) => c.id !== activeConvId);
        if (remaining.length > 0) {
          setActiveConvId(remaining[0].id);
        }
      },
    });
  };

  const getMemberDetails = (id: string) => {
    const u = users.find((usr) => usr.id === id);
    if (u) return { name: u.fullName, role: u.role, avatar: u.avatarUrl, isUser: true };
    const t = talents.find((tal) => tal.id === id);
    if (t) return { name: `${t.stageName} (${t.talentType})`, role: t.talentType, avatar: t.avatarUrl, isUser: false };
    return { name: id, role: "MEM", avatar: undefined, isUser: true };
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md">
      {/* Custom Centered Notification Dialog */}
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
        {/* Search Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Trao Đổi Nội Bộ CRM
            </h3>

            <Button
              size="sm"
              onClick={() => setIsCreateGroupOpen(true)}
              className="gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold h-7 px-2"
            >
              <Plus className="w-3.5 h-3.5" />
              + Tạo Nhóm
            </Button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm tên nhân viên, Host, KOC, channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterType("ALL")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                filterType === "ALL"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("CHANNELS")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                filterType === "CHANNELS"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Kênh Team
            </button>
            <button
              onClick={() => setFilterType("DMS")}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                filterType === "DMS"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Thành viên
            </button>
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5 space-y-0.5">
          {filteredConvs.length > 0 ? (
            filteredConvs.map((conv) => {
              const isSelected = conv.id === activeConvId;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-indigo-50 dark:bg-slate-800/90 border border-indigo-200 dark:border-indigo-800"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {conv.isChannel ? (
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="relative shrink-0">
                      <Avatar className="w-9 h-9 border border-slate-200">
                        <AvatarImage src={conv.avatarUrl} alt={conv.name} />
                        <AvatarFallback>{conv.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      )}
                    </div>
                  )}

                  <div className="overflow-hidden flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-900 dark:text-indigo-200" : "text-slate-900 dark:text-white"}`}>
                        {conv.name}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{conv.lastTimestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage || conv.roleOrCategory}
                    </p>
                  </div>

                  {conv.unreadCount && conv.unreadCount > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              Không tìm thấy thành viên hoặc kênh phù hợp với &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT THREAD WINDOW */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
        {/* Chat Thread Header */}
        <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/95 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            {activeConv?.isChannel ? (
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                <Hash className="w-4 h-4" />
              </div>
            ) : (
              <Avatar className="w-9 h-9 border border-slate-200">
                <AvatarImage src={activeConv?.avatarUrl} alt={activeConv?.name} />
                <AvatarFallback>{activeConv?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
            )}

            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                {activeConv?.name}
                {!activeConv?.isChannel && activeConv?.isOnline && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Online
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">{activeConv?.roleOrCategory || "Kênh làm việc nội bộ"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGroupInfoOpen(true)}
              className="gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              <Users className="w-4 h-4" />
              Thành viên ({activeConv?.memberIds?.length || 2})
            </Button>

            {/* ADMIN EXCLUSIVE ACTION: Delete entire conversation / group */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteConversation}
                title="Xóa cuộc trò chuyện (Dành cho Admin)"
                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 text-[11px] font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa Chat
              </Button>
            )}

            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-500 hover:text-indigo-600">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-500 hover:text-indigo-600">
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PINNED ANNOUNCEMENT BANNER */}
        {activeConv?.pinnedMessage && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-medium truncate">
              <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-bold shrink-0">Thông Báo Ghim:</span>
              <span className="truncate">{activeConv.pinnedMessage}</span>
            </div>
          </div>
        )}

        {/* Chat Thread Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
          {activeMessages.length > 0 ? (
            activeMessages.map((msg) => {
              const isMe = msg.isMe || msg.senderId === currentUser?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] group ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 shrink-0 mt-0.5 border border-slate-200">
                    <AvatarImage src={msg.senderAvatar || currentUser?.avatarUrl} alt={msg.senderName} />
                    <AvatarFallback>{msg.senderName.substring(0, 2)}</AvatarFallback>
                  </Avatar>

                  <div className={`space-y-1 relative ${isMe ? "items-end text-right" : "items-start text-left"}`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{msg.senderName}</span>
                      {msg.senderRole && (
                        <span className="px-1 py-0.2 rounded font-bold bg-slate-200 text-slate-700">
                          {msg.senderRole}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>

                      {/* ADMIN EXCLUSIVE ACTION: Delete single message */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Xóa tin nhắn (Admin)"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-xs ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attached Product SKU Card */}
                      {msg.attachedSkuName && (
                        <div className="mt-2 p-2 rounded-lg bg-white/10 border border-white/20 flex items-center gap-2 text-[11px] font-bold">
                          <Package className="w-3.5 h-3.5" />
                          <span>SKU đính kèm: {msg.attachedSkuName}</span>
                        </div>
                      )}

                      {/* ATTACHED BOOKING SHIFT CARD */}
                      {msg.attachedShiftTitle && (
                        <div className="mt-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center gap-2 text-[11px] font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Ca Live đính kèm: {msg.attachedShiftTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold">Bắt đầu trao đổi làm việc trong {activeConv?.name}</p>
              <p className="text-[11px]">Gửi tin nhắn trao đổi kịch bản, đính kèm SKU sản phẩm hoặc ca live.</p>
            </div>
          )}
        </div>

        {/* Fast Quick Reply Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Gợi ý trả lời:</span>
          <button
            type="button"
            onClick={() => handleQuickReply("Đã duyệt kịch bản ca live cho Talent.")}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 shrink-0 font-medium"
          >
            Đã duyệt kịch bản ca live
          </button>
          <button
            type="button"
            onClick={() => handleQuickReply("Mã vận đơn sản phẩm mẫu đã phát thành công.")}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 shrink-0 font-medium"
          >
            Mã vận đơn sample phát thành công
          </button>
          <button
            type="button"
            onClick={() => handleQuickReply("Nhờ bạn check hỗ trợ tỷ lệ chiết khấu cho Brand.")}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 shrink-0 font-medium"
          >
            Check tỷ lệ chiết khấu
          </button>
        </div>

        {/* Input Controls Footer */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          {/* Attach SKU Dropdown */}
          <select
            value={selectedSkuAttach}
            onChange={(e) => setSelectedSkuAttach(e.target.value)}
            className="h-9 px-2 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 max-w-[130px] truncate font-medium"
          >
            <option value="">Đính kèm SKU</option>
            {skus.map((s) => (
              <option key={s.id} value={s.productName}>{s.productName}</option>
            ))}
          </select>

          {/* ATTACH SHIFT DROPDOWN */}
          <select
            value={selectedShiftAttach}
            onChange={(e) => setSelectedShiftAttach(e.target.value)}
            className="h-9 px-2 text-xs rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 max-w-[140px] truncate font-medium"
          >
            <option value="">Đính kèm Ca Live</option>
            {shifts.map((sh) => (
              <option key={sh.id} value={`${sh.talentName} - ${sh.brandName} (${sh.date})`}>
                {sh.talentName} ({sh.date})
              </option>
            ))}
          </select>

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Nhập tin nhắn tới ${activeConv?.name || "thành viên"}...`}
            className="h-9 text-xs flex-1 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
          />

          <Button type="submit" className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4">
            <Send className="w-3.5 h-3.5" />
            Gửi
          </Button>
        </form>
      </div>

      {/* MODAL 1: CREATE NEW GROUP / CHANNEL */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-600" />
                Tạo Nhóm Trò Chuyện Nội Bộ Mới
              </h3>
              <button onClick={() => setIsCreateGroupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Nhóm / Kênh Team</label>
                <Input
                  required
                  placeholder="Kênh Điều Phối Campaign Mega 9.9"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Thông Báo Ghim Đầu Nhóm</label>
                <Input
                  value={groupForm.pinnedMessage}
                  onChange={(e) => setGroupForm({ ...groupForm, pinnedMessage: e.target.value })}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chọn Thành Viên Tham Gia ({groupForm.selectedMemberIds.length} đã chọn)
                </label>

                <div className="space-y-1.5 p-3 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 max-h-48 overflow-y-auto">
                  <p className="font-bold text-[11px] text-slate-500 uppercase">Nhân Viên CRM Agency:</p>
                  {users.map((u) => {
                    const isSelected = groupForm.selectedMemberIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleGroupMemberSelection(u.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                          isSelected ? "bg-indigo-50 border-indigo-300 text-indigo-900" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={u.avatarUrl} alt={u.fullName} />
                            <AvatarFallback>US</AvatarFallback>
                          </Avatar>
                          <span className="font-bold">{u.fullName}</span>
                          <span className="text-[10px] text-slate-400">({u.role})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    );
                  })}

                  <p className="font-bold text-[11px] text-slate-500 uppercase mt-2">Host & KOC Livestream:</p>
                  {talents.map((t) => {
                    const isSelected = groupForm.selectedMemberIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleGroupMemberSelection(t.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${
                          isSelected ? "bg-indigo-50 border-indigo-300 text-indigo-900" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={t.avatarUrl} alt={t.stageName} />
                            <AvatarFallback>TL</AvatarFallback>
                          </Avatar>
                          <span className="font-bold">{t.stageName}</span>
                          <span className="text-[10px] text-slate-400">({t.talentType})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  Khởi Tạo Nhóm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GROUP MEMBER MANAGEMENT */}
      {isGroupInfoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Danh Sách Thành Viên: {activeConv?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tổng cộng {activeConv?.memberIds?.length || 2} thành viên trong nhóm</p>
              </div>
              <button onClick={() => setIsGroupInfoOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Thành Viên Nhóm Hiện Tại:</span>
                <Button
                  size="sm"
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="gap-1 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-7 px-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Thêm Thành Viên
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                {activeConv?.memberIds?.map((mId) => {
                  const details = getMemberDetails(mId);
                  return (
                    <div
                      key={mId}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={details.avatar} alt={details.name} />
                          <AvatarFallback>MB</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{details.name}</p>
                          <p className="text-[10px] text-slate-500">Vai trò: {details.role}</p>
                        </div>
                      </div>

                      {activeConv.memberIds && activeConv.memberIds.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveMember(mId, details.name)}
                          className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 text-[11px]"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Xóa
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setIsGroupInfoOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD MEMBER PICKER TO EXISTING GROUP */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Thêm Thành Viên Vào Nhóm
              </h3>
              <button onClick={() => setIsAddMemberModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto text-xs">
              {users
                .filter((u) => !activeConv?.memberIds?.includes(u.id))
                .map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleAddMemberToActiveGroup(u.id, u.fullName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border cursor-pointer hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    <span className="font-bold text-slate-800">{u.fullName} ({u.role})</span>
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </div>
                ))}

              {talents
                .filter((t) => !activeConv?.memberIds?.includes(t.id))
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleAddMemberToActiveGroup(t.id, t.stageName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border cursor-pointer hover:bg-indigo-50 hover:border-indigo-300"
                  >
                    <span className="font-bold text-slate-800">{t.stageName} ({t.talentType})</span>
                    <Plus className="w-4 h-4 text-indigo-600" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
