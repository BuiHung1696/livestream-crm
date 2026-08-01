"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { UserAccount, UserRole, UserPermissions } from "@/types";
import {
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Lock,
  Check,
  X,
  Users,
  Shield,
  PhoneCall,
  Eye,
  EyeOff,
  Key,
  Upload,
} from "lucide-react";

export default function UsersPage() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useCrmStore();

  const hasPermission = currentUser?.role === "ADMIN" || currentUser?.permissions?.manageUsers;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showModalPassword, setShowModalPassword] = useState(false);

  if (!hasPermission) {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Truy Cập Bị Hạn Chế (403 Access Denied)</h3>
        <p className="text-xs text-slate-500">
          Tài khoản của bạn (<b className="text-slate-800 dark:text-slate-200">{currentUser?.fullName || "Khách"}</b> - <span className="font-semibold text-indigo-600">{currentUser?.role || "GUEST"}</span>) chưa được cấp quyền Quản lý Phân Quyền Nhân Viên. Vui lòng liên hệ Admin hệ thống để cấp quyền.
        </p>
      </div>
    );
  }

  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "123456",
    avatarUrl: "",
    department: "Phòng Booking & Điều Phối Host",
    role: "COORDINATOR" as UserRole,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    permissions: {
      manageTalents: true,
      manageCampaigns: true,
      manageSchedule: true,
      viewReports: true,
      manageSettings: false,
      manageUsers: false,
      contactTalent: true,
    } as UserPermissions,
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAvatarUploadInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: "warning",
        title: "File Dung Lượng Quá Lớn",
        message: "Vui lòng chọn ảnh dưới 5MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setUserForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddUser = () => {
    setUserForm({
      fullName: "",
      email: "",
      password: "123456",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: "Phòng Booking & Điều Phối Host",
      role: "COORDINATOR",
      status: "ACTIVE",
      permissions: {
        manageTalents: true,
        manageCampaigns: true,
        manageSchedule: true,
        viewReports: true,
        manageSettings: false,
        manageUsers: false,
        contactTalent: true,
      },
    });
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: user.password || "123456",
      avatarUrl: user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: user.department || "",
      role: user.role || "COORDINATOR",
      status: user.status || "ACTIVE",
      permissions: {
        manageTalents: !!user.permissions?.manageTalents,
        manageCampaigns: !!user.permissions?.manageCampaigns,
        manageSchedule: !!user.permissions?.manageSchedule,
        viewReports: !!user.permissions?.viewReports,
        manageSettings: !!user.permissions?.manageSettings,
        manageUsers: !!user.permissions?.manageUsers,
        contactTalent: !!user.permissions?.contactTalent,
      },
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName || !userForm.email) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        fullName: userForm.fullName,
        email: userForm.email,
        password: userForm.password,
        avatarUrl: userForm.avatarUrl,
        department: userForm.department,
        role: userForm.role,
        status: userForm.status,
        permissions: userForm.permissions,
      });

      setEditingUser(null);
      setNotification({
        type: "success",
        title: "Cập Nhật Tài Khoản Thành Công",
        message: `Đã lưu các chỉnh sửa thông tin & mật khẩu cho nhân viên ${userForm.fullName}.`,
      });
    } else {
      addUser({
        fullName: userForm.fullName,
        email: userForm.email,
        password: userForm.password || "123456",
        avatarUrl: userForm.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        department: userForm.department,
        role: userForm.role,
        status: userForm.status,
        permissions: userForm.permissions,
      });

      setIsAddUserOpen(false);
      setNotification({
        type: "success",
        title: "Tạo Tài Khoản Nhân Viên Mới Thành Công",
        message: `Đã tạo tài khoản cho nhân viên ${userForm.fullName} (${userForm.email}) với mật khẩu đã thiết lập.`,
      });
    }
  };

  const handleDeleteUser = (userId: string, name: string) => {
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Tài Khoản",
      message: `Bạn có chắc chắn muốn xóa tài khoản nhân viên ${name} khỏi hệ thống?`,
      confirmText: "Xóa Tài Khoản",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteUser(userId);
      },
    });
  };

  const togglePermission = (key: keyof UserPermissions) => {
    setUserForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleRoleChange = (newRole: UserRole) => {
    let presetPermissions: UserPermissions = {
      manageTalents: true,
      manageCampaigns: true,
      manageSchedule: true,
      viewReports: true,
      manageSettings: false,
      manageUsers: false,
      contactTalent: true,
    };

    if (newRole === "ADMIN") {
      presetPermissions = {
        manageTalents: true,
        manageCampaigns: true,
        manageSchedule: true,
        viewReports: true,
        manageSettings: true,
        manageUsers: true,
        contactTalent: true,
      };
    } else if (newRole === "ACCOUNTANT") {
      presetPermissions = {
        manageTalents: true,
        manageCampaigns: false,
        manageSchedule: false,
        viewReports: true,
        manageSettings: false,
        manageUsers: false,
        contactTalent: false,
      };
    } else if (newRole === "STAFF") {
      presetPermissions = {
        manageTalents: false,
        manageCampaigns: false,
        manageSchedule: true,
        viewReports: false,
        manageSettings: false,
        manageUsers: false,
        contactTalent: false,
      };
    }

    setUserForm({
      ...userForm,
      role: newRole,
      permissions: presetPermissions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Custom Centered Notification Dialog */}
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Tài Khoản Nhân Viên & Phân Quyền Hệ Thống
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý tài khoản nhân viên CRM, thiết lập các quyền truy cập module và quyền liên hệ với Talent
          </p>
        </div>

        <Button
          onClick={handleOpenAddUser}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tạo Tài Khoản Mới
        </Button>
      </div>

      {/* Filter & Search Toolbar Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tên, email, phòng ban..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {["ALL", "ADMIN", "COORDINATOR", "ACCOUNTANT", "STAFF"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedRoleFilter === role
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {role === "ALL"
                    ? "Tất cả vai trò"
                    : role === "ADMIN"
                    ? "Admin"
                    : role === "COORDINATOR"
                    ? "Coordinator"
                    : role === "ACCOUNTANT"
                    ? "Kế Toán"
                    : "Staff"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Danh Sách Nhân Viên CRM ({filteredUsers.length})
            </span>
          </CardTitle>
          <CardDescription>
            Bảng quản lý tài khoản nhân viên và chi tiết các quyền hạn truy cập module trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="w-12 text-center font-bold">STT</TableHead>
                <TableHead className="w-56 whitespace-nowrap">Nhân Viên</TableHead>
                <TableHead className="whitespace-nowrap">Vai Trò</TableHead>
                <TableHead className="whitespace-nowrap">Phòng Ban</TableHead>
                <TableHead className="whitespace-nowrap">Quyền Hạn Chi Tiết</TableHead>
                <TableHead className="text-center whitespace-nowrap">Trạng Thái</TableHead>
                <TableHead className="text-center whitespace-nowrap">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, idx) => (
                <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="text-center font-bold text-slate-500 text-xs whitespace-nowrap">
                    {idx + 1}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"}
                        alt={user.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {user.fullName}
                          {user.id === currentUser?.id && (
                            <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-indigo-100 text-indigo-800 rounded">Bạn</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        user.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                          : user.role === "COORDINATOR"
                          ? "bg-violet-100 text-violet-800 border-violet-200"
                          : user.role === "ACCOUNTANT"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }`}
                    >
                      {user.role === "ADMIN"
                        ? "Quản Trị Viên (Admin)"
                        : user.role === "COORDINATOR"
                        ? "Điều Phối Viên"
                        : user.role === "ACCOUNTANT"
                        ? "Kế Toán / Báo Cáo"
                        : "Nhân Viên Studio"}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    {user.department}
                  </TableCell>

                  {/* Permissions Checklist Badges */}
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {user.permissions?.manageTalents && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border">Talent</span>
                      )}
                      {user.permissions?.manageCampaigns && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border">Campaigns</span>
                      )}
                      {user.permissions?.manageSchedule && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border">Lịch trực</span>
                      )}
                      {user.permissions?.viewReports && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border">Báo cáo</span>
                      )}
                      {user.permissions?.contactTalent && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                          <PhoneCall className="w-2.5 h-2.5 text-emerald-600" />
                          Liên hệ Talent
                        </span>
                      )}
                      {user.permissions?.manageSettings && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">Cấu hình</span>
                      )}
                      {user.permissions?.manageUsers && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">Phân quyền</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Hoạt Động" : "Tạm Khóa"}
                    </span>
                  </TableCell>

                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditUser(user)}
                        title="Chỉnh sửa quyền hạn"
                        className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>

                      {user.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          title="Xóa tài khoản"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: CREATE OR EDIT USER & PERMISSIONS */}
      {(isAddUserOpen || editingUser) && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                {editingUser ? `Chỉnh Sửa Quyền Hạn: ${editingUser.fullName}` : "Tạo Tài Khoản Nhân Viên Mới"}
              </h3>
              <button
                onClick={() => {
                  setIsAddUserOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Avatar File Upload Control */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img
                  src={userForm.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover border border-indigo-500 shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs">Ảnh Đại Diện Nhân Viên</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] rounded cursor-pointer transition-colors">
                    <Upload className="w-3 h-3" />
                    Tải Ảnh Từ Máy Tính...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUploadInModal}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Họ và Tên Nhân Viên</label>
                  <Input
                    required
                    placeholder="Nguyễn Văn A"
                    value={userForm.fullName || ""}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Đăng Nhập</label>
                  <Input
                    required
                    type="email"
                    placeholder="nhanvien@liveagency.vn"
                    value={userForm.email || ""}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vai Trò Hệ Thống</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="ADMIN">Admin (Quản trị viên)</option>
                    <option value="COORDINATOR">Coordinator (Điều phối)</option>
                    <option value="ACCOUNTANT">Kế Toán (Doanh số)</option>
                    <option value="STAFF">Staff (Nhân viên studio)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phòng Ban Hợp Tác</label>
                  <Input
                    value={userForm.department || ""}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {editingUser ? "Mật Khẩu Mới (Đặt lại nếu cần)" : "Mật Khẩu Khởi Tạo *"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showModalPassword ? "text" : "password"}
                      required={!editingUser}
                      placeholder="Nhập mật khẩu (VD: 123456)"
                      value={userForm.password || ""}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="pr-9 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Tài Khoản</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="ACTIVE">Hoạt Động (Cho phép đăng nhập)</option>
                    <option value="INACTIVE">Tạm Khóa (Vô hiệu hóa)</option>
                  </select>
                </div>
              </div>

              {/* Fine-Grained Permissions Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">
                  Giới Hạn Quyền Hạn Chi Tiết Theo Module:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.manageTalents}
                      onChange={() => togglePermission("manageTalents")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Quản lý Hồ Sơ Talent</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.manageCampaigns}
                      onChange={() => togglePermission("manageCampaigns")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Quản lý & Điều phối Campaign</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.manageSchedule}
                      onChange={() => togglePermission("manageSchedule")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Quản lý Lịch & Nhập GMV</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.viewReports}
                      onChange={() => togglePermission("viewReports")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Xem Báo Cáo Doanh Số</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/40 cursor-pointer hover:bg-emerald-50">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.contactTalent}
                      onChange={() => togglePermission("contactTalent")}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" />
                      Liên hệ trực tiếp với Talent
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.manageSettings}
                      onChange={() => togglePermission("manageSettings")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Cấu hình Hệ thống Agency</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-white">
                    <input
                      type="checkbox"
                      checked={!!userForm.permissions.manageUsers}
                      onChange={() => togglePermission("manageUsers")}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Quản lý Phân Quyền User</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddUserOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  {editingUser ? "Lưu Quyền Hạn" : "Khởi Tạo Tài Khoản"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
