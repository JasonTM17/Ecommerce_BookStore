"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Users, Search, ChevronLeft, ChevronRight, UserCheck, UserX, Shield, Eye, Mail, Phone, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/providers/language-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-red-100", text: "text-red-700" },
  MANAGER: { bg: "bg-purple-100", text: "text-purple-700" },
  CUSTOMER: { bg: "bg-blue-100", text: "text-blue-700" },
};

const COPY = {
  vi: {
    dashboard: "Dashboard",
    title: "Quản lý người dùng",
    subtitle: "Tổng cộng {count} người dùng",
    totalUsers: "Tổng người dùng",
    active: "Đang hoạt động",
    inactive: "Đã vô hiệu",
    admin: "Quản trị viên",
    searchPlaceholder: "Tìm kiếm theo tên, email...",
    roleFilter: "Vai trò",
    statusFilter: "Trạng thái",
    allRoles: "Tất cả vai trò",
    allStatus: "Tất cả",
    tableName: "Người dùng",
    tableRole: "Vai trò",
    tableStatus: "Trạng thái",
    tableJoined: "Ngày tham gia",
    tableAction: "Hành động",
    empty: "Không tìm thấy người dùng nào",
    page: "Trang {current} / {total}",
    prev: "Trước",
    next: "Sau",
    roleLabels: {
      ADMIN: "Quản trị viên",
      MANAGER: "Quản lý",
      CUSTOMER: "Khách hàng",
    },
    activeLabel: "Hoạt động",
    inactiveLabel: "Vô hiệu",
    detailTitle: "Chi tiết người dùng",
    joined: "Tham gia {date}",
    disableConfirm: 'Vô hiệu hóa tài khoản "{name}"?',
    activateSuccess: "Kích hoạt tài khoản thành công",
    activateError: "Kích hoạt tài khoản thất bại",
    deactivateSuccess: "Vô hiệu hóa tài khoản thành công",
    deactivateError: "Vô hiệu hóa tài khoản thất bại",
    activate: "Kích hoạt",
    deactivate: "Vô hiệu hóa",
    email: "Email",
    phone: "Số điện thoại",
  },
  en: {
    dashboard: "Dashboard",
    title: "User management",
    subtitle: "{count} users in total",
    totalUsers: "Total users",
    active: "Active",
    inactive: "Inactive",
    admin: "Admins",
    searchPlaceholder: "Search by name or email...",
    roleFilter: "Role",
    statusFilter: "Status",
    allRoles: "All roles",
    allStatus: "All",
    tableName: "User",
    tableRole: "Role",
    tableStatus: "Status",
    tableJoined: "Joined",
    tableAction: "Action",
    empty: "No users found",
    page: "Page {current} / {total}",
    prev: "Previous",
    next: "Next",
    roleLabels: {
      ADMIN: "Admin",
      MANAGER: "Manager",
      CUSTOMER: "Customer",
    },
    activeLabel: "Active",
    inactiveLabel: "Inactive",
    detailTitle: "User details",
    joined: "Joined {date}",
    disableConfirm: 'Disable account "{name}"?',
    activateSuccess: "Account activated successfully",
    activateError: "Failed to activate account",
    deactivateSuccess: "Account disabled successfully",
    deactivateError: "Failed to disable account",
    activate: "Activate",
    deactivate: "Disable",
    email: "Email",
    phone: "Phone",
  },
} as const;

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { locale } = useLanguage();
  const copy = COPY[locale];
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/login");
    }
  }, [isAdmin, router]);

  const { data, isLoading } = useQuery<PageResponse<User>>({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
      });
      if (search) params.set("keyword", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      const endpoint = search ? "/admin/users/search" : "/admin/users";
      const res = await api.get(`${endpoint}?${params.toString()}`);
      return res.data;
    },
    retry: false,
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(copy.activateSuccess);
    },
    onError: () => {
      toast.error(copy.activateError);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(copy.deactivateSuccess);
    },
    onError: () => {
      toast.error(copy.deactivateError);
    },
  });

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  if (!isAdmin) {
    return null;
  }

  const roleOptions = [
    { value: "all", label: copy.allRoles },
    { value: "ADMIN", label: copy.roleLabels.ADMIN },
    { value: "MANAGER", label: copy.roleLabels.MANAGER },
    { value: "CUSTOMER", label: copy.roleLabels.CUSTOMER },
  ];

  const statusOptions = [
    { value: "all", label: copy.allStatus },
    { value: "active", label: copy.active },
    { value: "inactive", label: copy.inactive },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <a href="/admin" className="hover:text-blue-600 transition-colors">{copy.dashboard}</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{copy.title}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {copy.title}
              </h1>
              <p className="text-gray-500 mt-1">
                {copy.subtitle.replace("{count}", String(totalElements))}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{copy.totalUsers}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{copy.active}</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.content.filter((u) => u.enabled).length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{copy.inactive}</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.content.filter((u) => !u.enabled).length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{copy.admin}</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.content.filter((u) => u.roles.includes("ADMIN")).length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-0 shadow-lg mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={copy.searchPlaceholder}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={(v) => { setRoleFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder={copy.roleFilter} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value || "all-roles"} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder={copy.statusFilter} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value || "all-status"} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{copy.tableName}</TableHead>
                    <TableHead>{copy.tableRole}</TableHead>
                    <TableHead>{copy.tableStatus}</TableHead>
                    <TableHead>{copy.tableJoined}</TableHead>
                    <TableHead className="text-right">{copy.tableAction}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(8)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j} className="py-4">
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">{copy.empty}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="text-gray-400 text-sm">{page * 10 + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge key={role} className={cn("text-xs font-medium", ROLE_COLORS[role]?.bg, ROLE_COLORS[role]?.text)}>
                                {copy.roleLabels[role as keyof typeof copy.roleLabels] || role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs font-medium", user.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                            {user.enabled ? copy.activeLabel : copy.inactiveLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.enabled ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                  if (window.confirm(copy.disableConfirm.replace("{name}", user.fullName))) {
                                    deactivateMutation.mutate(user.id);
                                  }
                                }}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-green-50 hover:text-green-600"
                                onClick={() => activateMutation.mutate(user.id)}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <p className="text-sm text-gray-500">
                  {copy.page.replace("{current}", String(page + 1)).replace("{total}", String(totalPages))}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-xl h-9">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {copy.prev}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1} className="rounded-xl h-9">
                    {copy.next}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{copy.detailTitle}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.fullName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.fullName}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.roles.map((role) => (
                      <Badge key={role} className={cn("text-xs", ROLE_COLORS[role]?.bg, ROLE_COLORS[role]?.text)}>
                        {copy.roleLabels[role as keyof typeof copy.roleLabels] || role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{selectedUser.email}</span>
                </div>
                {selectedUser.phoneNumber && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{selectedUser.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {copy.joined.replace("{date}", new Date(selectedUser.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }))}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge className={cn("text-xs font-medium", selectedUser.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                    {selectedUser.enabled ? copy.activeLabel : copy.inactiveLabel}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                {selectedUser.enabled ? (
                  <Button
                    variant="destructive"
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      deactivateMutation.mutate(selectedUser.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    {copy.deactivate}
                  </Button>
                ) : (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                    onClick={() => {
                      activateMutation.mutate(selectedUser.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    {copy.activate}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
