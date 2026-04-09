"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  CUSTOMER: "Khách hàng",
};

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      const res = await api.get(`/admin/users?${params}`);
      return res.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Kích hoạt tài khoản thành công");
    },
    onError: () => {
      toast.error("Kích hoạt tài khoản thất bại");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.put(`/admin/users/${userId}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Vô hiệu hóa tài khoản thành công");
    },
    onError: () => {
      toast.error("Vô hiệu hóa tài khoản thất bại");
    },
  });

  const users = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50/30">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <a href="/admin" className="hover:text-blue-600 transition-colors">Dashboard</a>
            <span>/</span>
            <span className="text-gray-900 font-medium">Quản lý người dùng</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Quản lý người dùng
              </h1>
              <p className="text-gray-500 mt-1">
                Tổng cộng <span className="font-semibold text-blue-600">{totalElements}</span> người dùng
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tổng người dùng</p>
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
                  <p className="text-sm text-gray-500">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.content.filter((u) => u.enabled).length ?? 0}
                  </p>
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
                  <p className="text-sm text-gray-500">Đã vô hiệu</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.content.filter((u) => !u.enabled).length ?? 0}
                  </p>
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
                  <p className="text-sm text-gray-500">Quản trị viên</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.content.filter((u) => u.roles.includes("ADMIN")).length ?? 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl border-0 shadow-lg mb-6">
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả vai trò</SelectItem>
                  <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="CUSTOMER">Khách hàng</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-48 h-12 bg-gray-50 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="inactive">Đã vô hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
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
                        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="text-gray-400 text-sm">
                          {page * 10 + index + 1}
                        </TableCell>
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
                              <Badge
                                key={role}
                                className={cn(
                                  "text-xs font-medium",
                                  ROLE_COLORS[role]?.bg,
                                  ROLE_COLORS[role]?.text
                                )}
                              >
                                {ROLE_LABELS[role] || role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-xs font-medium",
                              user.enabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {user.enabled ? "Hoạt động" : "Vô hiệu"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN", {
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
                                  if (confirm(`Vô hiệu hóa tài khoản "${user.fullName}"?`)) {
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
                                onClick={() => {
                                  activateMutation.mutate(user.id);
                                }}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                <p className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="rounded-xl h-9"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="rounded-xl h-9"
                  >
                    Sau
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* User Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết người dùng</DialogTitle>
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
                      <Badge
                        key={role}
                        className={cn(
                          "text-xs",
                          ROLE_COLORS[role]?.bg,
                          ROLE_COLORS[role]?.text
                        )}
                      >
                        {ROLE_LABELS[role] || role}
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
                    Tham gia {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    className={cn(
                      "text-xs font-medium",
                      selectedUser.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {selectedUser.enabled ? "Đang hoạt động" : "Đã vô hiệu"}
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
                    Vô hiệu hóa
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
                    Kích hoạt
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
