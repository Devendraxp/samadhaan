import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { User, Complaint, Domain, Role, ComplaintStatus, NotificationType } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS, DOMAIN_LABELS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Eye, Trash2, Edit, UserPlus } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("complaints");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      if (response.data.role !== "ADMIN") {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page.",
        });
        navigate("/login");
        return;
      }
      setUser(response.data);
      await loadComplaints();
      await loadUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load profile",
      });
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const response = await api.get("/complaint");
      setComplaints(response.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load complaints",
      });
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get("/user");
      setUsers(response.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load users",
      });
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    try {
      await api.patch(`/complaint/${id}`, { status });
      toast({
        title: "Success",
        description: "Complaint status updated successfully",
      });
      await loadComplaints();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update complaint",
      });
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/user/${id}`);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      await loadUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete user",
      });
    }
  };

  const activeStatuses: ComplaintStatus[] = ["CREATED", "REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS", "RESOLVED"];
  const archivedStatuses: ComplaintStatus[] = ["ARCHIVED", "CANCELED", "DELETED"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="space-y-4">
          <ComplaintsKanban
            complaints={complaints.filter((c) => activeStatuses.includes(c.status))}
            onStatusChange={updateComplaintStatus}
            onViewDetails={(id) => navigate(`/complaint/${id}`)}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Archived Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {complaints
                  .filter((c) => archivedStatuses.includes(c.status))
                  .map((complaint) => (
                    <div
                      key={complaint.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{complaint.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(complaint.createdAt), "PPP")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[complaint.status]}>
                          {STATUS_LABELS[complaint.status]}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/complaint/${complaint.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagement
            users={users}
            onRefresh={loadUsers}
            onDelete={deleteUser}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationCreation onSuccess={() => toast({ title: "Notification created successfully" })} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ComplaintsKanbanProps {
  complaints: Complaint[];
  onStatusChange: (id: string, status: ComplaintStatus) => void;
  onViewDetails: (id: string) => void;
}

const ComplaintsKanban = ({ complaints, onStatusChange, onViewDetails }: ComplaintsKanbanProps) => {
  const statuses: ComplaintStatus[] = ["CREATED", "REVIEWED", "ASSIGNED", "WORK_IN_PROGRESS", "RESOLVED"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {statuses.map((status) => (
        <Card key={status}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {STATUS_LABELS[status]}
            </CardTitle>
            <CardDescription>
              {complaints.filter((c) => c.status === status).length} complaints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {complaints
              .filter((c) => c.status === status)
              .map((complaint) => (
                <div
                  key={complaint.id}
                  className="p-3 border rounded-lg space-y-2 hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-sm line-clamp-2">{complaint.subject}</p>
                  <Badge variant="outline">{DOMAIN_LABELS[complaint.domain]}</Badge>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(complaint.createdAt), "PP")}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onViewDetails(complaint.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {status !== "RESOLVED" && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const currentIndex = statuses.indexOf(status);
                          if (currentIndex < statuses.length - 1) {
                            onStatusChange(complaint.id, statuses[currentIndex + 1]);
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface UserManagementProps {
  users: User[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
}

const UserManagement = ({ users, onRefresh, onDelete }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and their roles</CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <UserForm onSuccess={() => { setCreateDialogOpen(false); onRefresh(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === "ACTIVE"
                        ? "bg-success/20 text-success hover:bg-success/30"
                        : "bg-muted"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          {selectedUser && (
            <UserForm
              user={selectedUser}
              onSuccess={() => {
                setEditDialogOpen(false);
                onRefresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
}

const UserForm = ({ user, onSuccess }: UserFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "STUDENT" as Role,
    status: user?.status || "ACTIVE" as import("@/lib/types").UserStatus,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.patch(`/user/${user.id}`, updateData);
      } else {
        await api.post("/user", formData);
      }
      toast({
        title: "Success",
        description: `User ${user ? "updated" : "created"} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || `Failed to ${user ? "update" : "create"} user`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
        <DialogDescription>
          {user ? "Update user information" : "Add a new user to the system"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: Role) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MESS">Mess Staff</SelectItem>
            <SelectItem value="INTERNET">Internet Staff</SelectItem>
            <SelectItem value="CLEANING">Cleaning Staff</SelectItem>
            <SelectItem value="WATER">Water Staff</SelectItem>
            <SelectItem value="TRANSPORT">Transport Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: import("@/lib/types").UserStatus) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="VIEW_ONLY">View Only</SelectItem>
              <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
              <SelectItem value="DELETED">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">{user ? "New Password (leave empty to keep current)" : "Password"}</Label>
        <Input
          id="password"
          type="password"
          required={!user}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {user ? "Update User" : "Create User"}
      </Button>
    </form>
  );
};

interface NotificationCreationProps {
  onSuccess: () => void;
}

const NotificationCreation = ({ onSuccess }: NotificationCreationProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    domain: "" as Domain | "",
    type: "UPDATE" as NotificationType,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("type", formData.type);
      if (formData.domain) {
        formPayload.append("domain", formData.domain);
      }
      if (file) {
        formPayload.append("file", file);
      }

      await api.post("/notification", formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Success",
        description: "Notification created successfully",
      });
      
      setFormData({
        title: "",
        description: "",
        domain: "",
        type: "UPDATE",
      });
      setFile(null);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create notification",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Notification</CardTitle>
        <CardDescription>Send announcements and updates to users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: NotificationType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALERT">Alert</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Optional)</Label>
            <Select
              value={formData.domain}
              onValueChange={(value: Domain) => setFormData({ ...formData, domain: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Domains</SelectItem>
                <SelectItem value="WATER">Water</SelectItem>
                <SelectItem value="MESS">Mess</SelectItem>
                <SelectItem value="INTERNET">Internet</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Image (Optional)</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
