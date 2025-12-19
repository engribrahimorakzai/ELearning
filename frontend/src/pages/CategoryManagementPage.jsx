import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { adminAPI } from '../services/api';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminAPI.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCategory(formData);
      setFormData({ name: '', description: '', icon: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
      alert('Failed to create category');
    }
  };

  const handleUpdate = async (id) => {
    try {
      const category = categories.find(c => c.id === id);
      await adminAPI.updateCategory(id, category);
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will affect all courses in this category.')) return;

    try {
      await adminAPI.deleteCategory(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.error || 'Failed to delete category');
    }
  };

  const updateCategory = (id, field, value) => {
    setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Category Management</h1>
              <p className="text-muted-foreground">Manage course categories</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input
                    placeholder="Category Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Input
                    placeholder="Icon (e.g., 💻)"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Create</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    {editingId === category.id ? (
                      <div className="space-y-3">
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                        />
                        <Input
                          value={category.description || ''}
                          onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                          placeholder="Description"
                        />
                        <Input
                          value={category.icon || ''}
                          onChange={(e) => updateCategory(category.id, 'icon', e.target.value)}
                          placeholder="Icon"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(category.id)}>
                            <Save className="w-4 h-4 mr-1" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {category.icon && <span className="text-2xl">{category.icon}</span>}
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(category.id)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
