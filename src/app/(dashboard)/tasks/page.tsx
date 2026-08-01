"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CustomToastModal, CustomNotification } from "@/components/ui/custom-toast";
import { useCrmStore } from "@/lib/store";
import { TaskItem, TaskPriority, TaskStatus, UserRole } from "@/types";
import { formatVND } from "@/lib/utils";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Pencil,
  Trash2,
  Building2,
  Megaphone,
  Shield,
} from "lucide-react";

export default function TasksPage() {
  const { tasks, users, campaigns, talents, addTask, updateTask, updateTaskStatus, deleteTask, currentUser } = useCrmStore();
  const canAssign = currentUser?.role === "ADMIN" || currentUser?.role === "COORDINATOR";

  const [viewMode, setViewMode] = useState<"KANBAN" | "TABLE">("KANBAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [notification, setNotification] = useState<CustomNotification | null>(null);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeId: users[0]?.id || "",
    priority: "HIGH" as TaskPriority,
    status: "TODO" as TaskStatus,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    relatedCampaignName: "",
    relatedTalentName: "",
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "ALL" || task.assigneeRole === selectedRole;
    const matchesPriority = selectedPriority === "ALL" || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === "ALL" || task.status === selectedStatus;

    return matchesSearch && matchesRole && matchesPriority && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setEditingTask(null);
    const defaultUser = users[0] || currentUser;
    setFormData({
      title: "",
      description: "",
      assigneeId: defaultUser?.id || "",
      priority: "HIGH",
      status: "TODO",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      relatedCampaignName: campaigns[0]?.campaignName || "",
      relatedTalentName: talents[0]?.stageName || "",
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      relatedCampaignName: task.relatedCampaignName || "",
      relatedTalentName: task.relatedTalentName || "",
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assigneeId) return;

    const assignee = users.find((u) => u.id === formData.assigneeId) || {
      fullName: currentUser?.fullName || "Admin",
      role: (currentUser?.role || "ADMIN") as UserRole,
      avatarUrl: currentUser?.avatarUrl,
    };

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title,
        description: formData.description,
        assigneeId: formData.assigneeId,
        assigneeName: assignee.fullName,
        assigneeRole: assignee.role,
        assigneeAvatar: assignee.avatarUrl,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        relatedCampaignName: formData.relatedCampaignName,
        relatedTalentName: formData.relatedTalentName,
      });

      setNotification({
        type: "success",
        title: "Đã Cập Nhật Nhiệm Vụ",
        message: `Nhiệm vụ "${formData.title}" đã được cập nhật thành công.`,
      });
    } else {
      addTask({
        title: formData.title,
        description: formData.description,
        assigneeId: formData.assigneeId,
        assigneeName: assignee.fullName,
        assigneeRole: assignee.role,
        assigneeAvatar: assignee.avatarUrl,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        relatedCampaignName: formData.relatedCampaignName,
        relatedTalentName: formData.relatedTalentName,
      });

      setNotification({
        type: "success",
        title: "Đã Giao Nhiệm Vụ Mới",
        message: `Nhiệm vụ mới đã được giao thành công cho ${assignee.fullName} (${assignee.role}).`,
      });
    }

    setIsTaskModalOpen(false);
  };

  const handleDeleteTaskConfirm = (task: TaskItem) => {
    setNotification({
      type: "confirm",
      title: "Xác Nhận Xóa Nhiệm Vụ",
      message: `Bạn có chắc chắn muốn xóa nhiệm vụ "${task.title}" khỏi hệ thống?`,
      confirmText: "Xóa Nhiệm Vụ",
      cancelText: "Hủy",
      onConfirm: () => {
        deleteTask(task.id);
        setNotification({
          type: "success",
          title: "Đã Xóa Nhiệm Vụ",
          message: `Đã xóa nhiệm vụ khỏi danh sách.`,
        });
      },
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    setNotification({
      type: "success",
      title: "Đã Cập Nhật Trạng Thái",
      message: `Đã chuyển trạng thái công việc sang ${
        newStatus === "TODO"
          ? "Cần Làm"
          : newStatus === "IN_PROGRESS"
          ? "Đang Thực Hiện"
          : newStatus === "REVIEW"
          ? "Chờ Duyệt"
          : "Hoàn Thành"
      }.`,
    });
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Admin</span>;
      case "COORDINATOR":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Coordinator</span>;
      case "ACCOUNTANT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Kế Toán</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Staff</span>;
    }
  };

  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">🔴 Ưu Tiên Cao</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟡 Trung Bình</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">🟢 Thấp</span>;
    }
  };

  const kanbanColumns: { status: TaskStatus; title: string; color: string; bgColor: string }[] = [
    { status: "TODO", title: "Cần Làm (Todo)", color: "text-slate-700", bgColor: "bg-slate-100 dark:bg-slate-800/60" },
    { status: "IN_PROGRESS", title: "Đang Thực Hiện", color: "text-indigo-700", bgColor: "bg-indigo-50 dark:bg-indigo-950/40" },
    { status: "REVIEW", title: "Chờ Duyệt (Review)", color: "text-amber-700", bgColor: "bg-amber-50 dark:bg-amber-950/40" },
    { status: "DONE", title: "Đã Hoàn Thành", color: "text-emerald-700", bgColor: "bg-emerald-50 dark:bg-emerald-950/40" },
  ];

  return (
    <div className="space-y-6">
      <CustomToastModal notification={notification} onClose={() => setNotification(null)} />

      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Quản Lý & Phân Công Nhiệm Vụ ({filteredTasks.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "KANBAN"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "TABLE"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Danh Sách (Table)
            </button>
          </div>

          {canAssign && (
            <Button
              size="sm"
              onClick={handleOpenAddModal}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs h-9"
            >
              <Plus className="w-4 h-4" />
              + Giao Nhiệm Vụ Mới
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Tìm tiêu đề nhiệm vụ, người thực hiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Vai Trò (Roles)</option>
                <option value="ADMIN">Admin</option>
                <option value="COORDINATOR">Coordinator Ca Live</option>
                <option value="ACCOUNTANT">Kế Toán Doanh Số</option>
                <option value="STAFF">Nhân Viên Staff</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Mức Ưu Tiên</option>
                <option value="HIGH">Ưu tiên Cao</option>
                <option value="MEDIUM">Ưu tiên Trung bình</option>
                <option value="LOW">Ưu tiên Thấp</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="ALL">Tất cả Trạng Thái</option>
                <option value="TODO">Cần Làm (Todo)</option>
                <option value="IN_PROGRESS">Đang Thực Hiện</option>
                <option value="REVIEW">Chờ Duyệt</option>
                <option value="DONE">Hoàn Thành</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VIEW MODE 1: KANBAN BOARD VIEW */}
      {viewMode === "KANBAN" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);

            return (
              <div key={col.status} className="space-y-3">
                <div className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 ${col.bgColor} flex items-center justify-between`}>
                  <h3 className={`text-xs font-bold ${col.color} flex items-center gap-1.5`}>
                    <span>{col.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold border">
                      {colTasks.length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group/card bg-white dark:bg-slate-900"
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          {renderPriorityBadge(task.priority)}
                          <div className="flex items-center gap-1">
                            {canAssign && (
                              <>
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  className="text-slate-400 hover:text-indigo-600 p-1"
                                  title="Sửa nhiệm vụ"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTaskConfirm(task)}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                  title="Xóa nhiệm vụ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                            {task.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-normal">
                            {task.description}
                          </p>
                        </div>

                        {(task.relatedCampaignName || task.relatedTalentName) && (
                          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
                            {task.relatedCampaignName && (
                              <p className="truncate flex items-center gap-1 font-semibold">
                                <Megaphone className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="truncate">{task.relatedCampaignName}</span>
                              </p>
                            )}
                            {task.relatedTalentName && (
                              <p className="truncate flex items-center gap-1">
                                <User className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>Talent: {task.relatedTalentName}</span>
                              </p>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <img
                              src={task.assigneeAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                              alt={task.assigneeName}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 leading-tight">
                                {task.assigneeName}
                              </p>
                              {renderRoleBadge(task.assigneeRole)}
                            </div>
                          </div>

                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {task.dueDate}
                          </span>
                        </div>

                        {/* Quick Change Status Dropdown */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className="w-full h-7 px-2 text-[10px] font-bold rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="TODO">Chuyển sang: Cần Làm</option>
                            <option value="IN_PROGRESS">Chuyển sang: Đang Thực Hiện</option>
                            <option value="REVIEW">Chuyển sang: Chờ Duyệt</option>
                            <option value="DONE">Chuyển sang: Hoàn Thành</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                      Không có nhiệm vụ
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE DATA VIEW */}
      {viewMode === "TABLE" && (
        <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                Bảng Danh Sách Phân Công Nhiệm Vụ ({filteredTasks.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold text-xs whitespace-nowrap">
                  <TableHead className="w-12 text-center whitespace-nowrap">STT</TableHead>
                  <TableHead className="whitespace-nowrap">Tiêu Đề & Nội Dung Nhiệm Vụ</TableHead>
                  <TableHead className="whitespace-nowrap">Người Được Giao (Assignee)</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Mức Ưu Tiên</TableHead>
                  <TableHead className="whitespace-nowrap">Hạn Hoàn Thành</TableHead>
                  <TableHead className="text-center whitespace-nowrap">Trạng Thái</TableHead>
                  <TableHead className="text-center w-24 whitespace-nowrap">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, idx) => (
                  <TableRow key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-xs whitespace-nowrap">
                    <TableCell className="text-center font-bold text-slate-400 whitespace-nowrap">{idx + 1}</TableCell>
                    <TableCell className="whitespace-nowrap max-w-sm">
                      <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{task.description}</p>
                      {task.relatedCampaignName && (
                        <span className="text-[10px] text-indigo-600 font-semibold block">🎯 {task.relatedCampaignName}</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={task.assigneeAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                          alt={task.assigneeName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{task.assigneeName}</p>
                          {renderRoleBadge(task.assigneeRole)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">{renderPriorityBadge(task.priority)}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {task.dueDate}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="h-8 px-2 text-xs font-bold rounded border border-slate-300 bg-white dark:bg-slate-900"
                      >
                        <option value="TODO">Cần Làm</option>
                        <option value="IN_PROGRESS">Đang Thực Hiện</option>
                        <option value="REVIEW">Chờ Duyệt</option>
                        <option value="DONE">Hoàn Thành</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {canAssign && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(task)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTaskConfirm(task)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ADD / EDIT TASK POPUP MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" />
                {editingTask ? `Chỉnh Sửa Nhiệm Vụ` : "Giao Nhiệm Vụ Mới Cho Vai Trò"}
              </h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên Nhiệm Vụ (Task Title)</label>
                <Input
                  required
                  placeholder="Ví dụ: Chốt danh sách Host ca live Mega Sale 8.8"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô Tả Chi Tiết Công Việc</label>
                <textarea
                  rows={3}
                  placeholder="Ghi rõ chi tiết yêu cầu, sản phẩm đính kèm, liên hệ ai..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giao Cho Nhân Viên / Vai Trò</label>
                  <select
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mức Độ Ưu Tiên</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="HIGH">🔴 Cao (High)</option>
                    <option value="MEDIUM">🟡 Trung Bình (Medium)</option>
                    <option value="LOW">🟢 Thấp (Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trạng Thái Ban Đầu</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white dark:bg-slate-900 font-medium"
                  >
                    <option value="TODO">Cần Làm (Todo)</option>
                    <option value="IN_PROGRESS">Đang Thực Hiện</option>
                    <option value="REVIEW">Chờ Duyệt</option>
                    <option value="DONE">Hoàn Thành</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hạn Hoàn Thành (Due Date)</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Liên Quan Chiến Dịch (Tùy chọn)</label>
                  <Input
                    placeholder="Mega Sale 8.8..."
                    value={formData.relatedCampaignName}
                    onChange={(e) => setFormData({ ...formData, relatedCampaignName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Liên Quan Talent (Tùy chọn)</label>
                  <Input
                    placeholder="Trang Hí Live..."
                    value={formData.relatedTalentName}
                    onChange={(e) => setFormData({ ...formData, relatedTalentName: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsTaskModalOpen(false)}>Hủy</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  {editingTask ? "Cập Nhật Nhiệm Vụ" : "Giao Nhiệm Vụ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
