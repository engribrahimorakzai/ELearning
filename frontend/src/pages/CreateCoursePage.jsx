import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileUploader } from '../components/FileUploader';
import { courseAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Upload, Book, DollarSign, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [thumbnailUploadMethod, setThumbnailUploadMethod] = useState('url');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    level: 'beginner',
    thumbnail_url: '',
    status: 'draft'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await courseAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Course title is required');
        return false;
      }
      if (!formData.description.trim()) {
        toast.error('Description is required');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.category_id) {
        toast.error('Please select a category');
        return false;
      }
    }

    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        level: formData.level.toLowerCase(), // Convert to lowercase for database constraint
        price: parseFloat(formData.price) || 0,
        status: isDraft ? 'draft' : 'published'
      };

      console.log('📝 Submitting course data:', submitData);
      const response = await courseAPI.createCourse(submitData);
      console.log('✅ Course created successfully:', response);
      
      toast.success(`Course ${isDraft ? 'saved as draft' : 'published'} successfully!`);
      
      setTimeout(() => {
        navigate('/my-courses');
      }, 1500);
    } catch (err) {
      console.error('❌ Course creation error:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error(err.response?.data?.error || err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Basic Info' },
      { num: 2, label: 'Details' },
      { num: 3, label: 'Pricing' },
      { num: 4, label: 'Review' }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, index) => (
          <React.Fragment key={s.num}>
            <div className={`flex items-center ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
              </div>
              <span className="ml-2 hidden md:inline">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Course Title *</label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Complete Web Development Bootcamp"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/100 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Course Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what students will learn in this course..."
          className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">{formData.description.length}/500 characters</p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Category *</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Level</label>
        <select
          name="level"
          value={formData.level}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Course Thumbnail (optional)</label>
        
        {/* Thumbnail Upload Method Tabs */}
        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            size="sm"
            variant={thumbnailUploadMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setThumbnailUploadMethod('url')}
            className="flex-1"
          >
            🔗 Image URL
          </Button>
          <Button
            type="button"
            size="sm"
            variant={thumbnailUploadMethod === 'upload' ? 'default' : 'outline'}
            onClick={() => setThumbnailUploadMethod('upload')}
            className="flex-1"
          >
            📤 Upload Image
          </Button>
        </div>

        {thumbnailUploadMethod === 'url' ? (
          <div className="space-y-2">
            <Input
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">💡 Paste image URL from web</p>
          </div>
        ) : (
          <div className="space-y-3">
            <FileUploader
              type="image"
              maxSize={5}
              label="Upload Course Thumbnail"
              onUploadComplete={(data) => {
                setFormData({ ...formData, thumbnail_url: data.url });
                toast.success('Thumbnail uploaded successfully!');
              }}
            />
            {formData.thumbnail_url && thumbnailUploadMethod === 'upload' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">✅ Thumbnail uploaded!</p>
                <img src={formData.thumbnail_url} alt="Preview" className="mt-2 w-full max-w-xs rounded-lg" />
              </div>
            )}
            <p className="text-xs text-muted-foreground">📤 Upload JPG, PNG, GIF, WEBP (Max 5MB)</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">Recommended: 1280x720px (16:9 ratio)</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Price (USD)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Enter 0 for free course</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">Pricing Tips:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Beginner courses: $10-$50</li>
            <li>• Intermediate courses: $50-$100</li>
            <li>• Advanced/Professional: $100-$200+</li>
            <li>• Free courses attract more students initially</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{formData.title || 'Course Title'}</CardTitle>
          <CardDescription>{formData.description || 'No description provided'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Category:</span>
              <p className="text-muted-foreground">
                {categories.find(c => c.id === parseInt(formData.category_id))?.name || 'Not selected'}
              </p>
            </div>
            <div>
              <span className="font-medium">Level:</span>
              <p className="text-muted-foreground capitalize">{formData.level}</p>
            </div>
            <div>
              <span className="font-medium">Price:</span>
              <p className="text-muted-foreground">
                {formData.price ? `$${parseFloat(formData.price).toFixed(2)}` : 'Free'}
              </p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-muted-foreground">Will be saved as Draft</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-900">
            <strong>Next Steps:</strong> After creating the course, you'll be able to add curriculum (sections and lessons), 
            upload videos, create quizzes, and assignments.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Create New Course</h1>
              <p className="text-muted-foreground">
                Fill in the details below to create your course. You can save as draft and publish later.
              </p>
            </div>

            {renderStepIndicator()}

            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                    {success}
                  </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1 || loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {step === 4 ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleSubmit(true)}
                          disabled={loading}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          onClick={() => handleSubmit(false)}
                          disabled={loading}
                        >
                          {loading ? 'Creating...' : 'Create & Publish'}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={nextStep} disabled={loading}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};
