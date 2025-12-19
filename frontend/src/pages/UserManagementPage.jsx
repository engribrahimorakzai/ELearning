import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Filter, Check, X, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { adminAPI } from '../services/api';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    is_verified: '',
    search: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers({ ...filters, page: pagination.page });
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (userId, currentStatus) => {
    try {
      await adminAPI.verifyInstructor(userId, !currentStatus);
      toast.success(`Instructor ${!currentStatus ? 'verified' : 'unverified'} successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to verify instructor:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.id);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ full_name: '', email: '', role: '' });
  };

  const handleUpdateUser = async (userId) => {
    try {
      await adminAPI.updateUser(userId, editForm);
      toast.success('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>

                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={filters.is_verified}
                  onChange={(e) => setFilters({ ...filters, is_verified: e.target.value })}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>

                <Button onClick={fetchUsers} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Email</th>
                          <th className="text-left py-3 px-4">Role</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Joined</th>
                          <th className="text-right py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              {editingUser === user.id ? (
                                <Input
                                  value={editForm.full_name}
                                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                  className="h-8"
                                />
                              ) : (
                                user.full_name
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {editingUser === user.id ? (
                                <Input
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="h-8"
                                  type="email"
                                />
                              ) : (
                                user.email
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingUser === user.id ? (
                                <select
                                  value={editForm.role}
                                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                  className="px-2 py-1 border rounded-md text-sm"
                                >
                                  <option value="student">Student</option>
                                  <option value="instructor">Instructor</option>
                                  <option value="admin">Admin</option>
                                </select>
                              ) : (
                                <Badge variant={user.role === 'admin' ? 'destructive' : 'default'} className="capitalize">
                                  {user.role}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {user.role === 'instructor' && (
                                <Badge variant={user.is_verified ? 'success' : 'secondary'}>
                                  {user.is_verified ? 'Verified' : 'Unverified'}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {editingUser === user.id ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => handleUpdateUser(user.id)}
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditClick(user)}
                                      title="Edit user"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    {user.role === 'instructor' && (
                                      <Button
                                        size="sm"
                                        variant={user.is_verified ? 'outline' : 'default'}
                                        onClick={() => handleVerifyToggle(user.id, user.is_verified)}
                                        title={user.is_verified ? 'Unverify instructor' : 'Verify instructor'}
                                        className={user.is_verified ? '' : 'bg-green-600 hover:bg-green-700'}
                                      >
                                        {user.is_verified ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteUser(user.id)}
                                      title="Delete user"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-muted-foreground">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Page {pagination.page} of {pagination.pages}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* First Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: 1 })}
                          disabled={pagination.page === 1}
                        >
                          First
                        </Button>
                        
                        {/* Previous */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                          disabled={pagination.page === 1}
                        >
                          Previous
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {(() => {
                            const pages = [];
                            const currentPage = pagination.page;
                            const totalPages = pagination.pages;
                            
                            // Always show first page
                            if (currentPage > 3) {
                              pages.push(
                                <Button
                                  key={1}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPagination({ ...pagination, page: 1 })}
                                  className="w-10"
                                >
                                  1
                                </Button>
                              );
                              if (currentPage > 4) {
                                pages.push(<span key="dots1" className="px-2">...</span>);
                              }
                            }
                            
                            // Show pages around current page
                            for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                              pages.push(
                                <Button
                                  key={i}
                                  variant={i === currentPage ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setPagination({ ...pagination, page: i })}
                                  className="w-10"
                                >
                                  {i}
                                </Button>
                              );
                            }
                            
                            // Always show last page
                            if (currentPage < totalPages - 2) {
                              if (currentPage < totalPages - 3) {
                                pages.push(<span key="dots2" className="px-2">...</span>);
                              }
                              pages.push(
                                <Button
                                  key={totalPages}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPagination({ ...pagination, page: totalPages })}
                                  className="w-10"
                                >
                                  {totalPages}
                                </Button>
                              );
                            }
                            
                            return pages;
                          })()}
                        </div>
                        
                        {/* Next */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                          disabled={pagination.page === pagination.pages}
                        >
                          Next
                        </Button>
                        
                        {/* Last Page */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPagination({ ...pagination, page: pagination.pages })}
                          disabled={pagination.page === pagination.pages}
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
