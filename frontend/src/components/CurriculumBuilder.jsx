import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileUploader } from './FileUploader';
import { sectionAPI, lessonAPI } from '../services/api';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronRight, Video, FileText, CheckSquare, ClipboardList } from 'lucide-react';

export const CurriculumBuilder = ({ courseId }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    section_id: '',
    title: '',
    content: '',
    video_url: '',
    duration: '',
    lesson_type: 'video'
  });
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'upload'

  useEffect(() => {
    loadCurriculum();
  }, [courseId]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const data = await sectionAPI.getSections(courseId);
      setSections(data.sections || []);
      // Expand first section by default
      if (data.sections?.length > 0) {
        setExpandedSections(new Set([data.sections[0].id]));
      }
    } catch (err) {
      console.error('Failed to load curriculum:', err);
      setError('Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleAddSection = async () => {
    if (!newSection.title.trim()) {
      setError('Section title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Creating section for course:', courseId, 'with data:', newSection);
      const data = await sectionAPI.createSection(courseId, newSection);
      console.log('Section created:', data);
      setSections([...sections, data.section]);
      setNewSection({ title: '', description: '' });
      setSuccess('Section added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to create section:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to add section';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionId, updates) => {
    try {
      setLoading(true);
      setError('');
      const data = await sectionAPI.updateSection(sectionId, updates);
      setSections(sections.map(s => s.id === sectionId ? data.section : s));
      setEditingSection(null);
      setSuccess('Section updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update section');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!confirm('Are you sure? This will delete all lessons in this section.')) return;

    try {
      setLoading(true);
      setError('');
      await sectionAPI.deleteSection(sectionId);
      setSections(sections.filter(s => s.id !== sectionId));
      setSuccess('Section deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete section');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async (sectionId) => {
    if (!newLesson.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const lessonData = { ...newLesson, section_id: sectionId };
      const data = await lessonAPI.createLesson(lessonData);
      
      // Update sections with new lesson
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: [...(section.lessons || []), data.lesson]
          };
        }
        return section;
      }));

      setNewLesson({
        section_id: '',
        title: '',
        content: '',
        video_url: '',
        duration: '',
        lesson_type: 'video'
      });
      setSuccess('Lesson added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (lessonId, updates) => {
    try {
      setLoading(true);
      setError('');
      const data = await lessonAPI.updateLesson(lessonId, updates);
      
      setSections(sections.map(section => ({
        ...section,
        lessons: section.lessons?.map(l => l.id === lessonId ? data.lesson : l)
      })));

      setEditingLesson(null);
      setSuccess('Lesson updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId, sectionId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    try {
      setLoading(true);
      setError('');
      await lessonAPI.deleteLesson(lessonId);
      
      setSections(sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons?.filter(l => l.id !== lessonId)
          };
        }
        return section;
      }));

      setSuccess('Lesson deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete lesson');
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      case 'quiz': return <CheckSquare className="w-4 h-4" />;
      case 'assignment': return <ClipboardList className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Course Curriculum</h2>
        <span className="text-sm text-muted-foreground">
          {sections.length} Sections • {sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} Lessons
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
          {success}
        </div>
      )}

      {/* Add New Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Section title (e.g., Introduction to React)"
            value={newSection.title}
            onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
          />
          <textarea
            placeholder="Section description (optional)"
            value={newSection.description}
            onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button onClick={handleAddSection} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((section, sIndex) => (
          <Card key={section.id} className="border-2">
            <CardHeader className="cursor-pointer hover:bg-accent/50" onClick={() => toggleSection(section.id)}>
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <div className="flex-1">
                  {editingSection === section.id ? (
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        setSections(sections.map(s => 
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        ));
                      }}
                      onBlur={() => handleUpdateSection(section.id, { title: section.title })}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <CardTitle className="text-lg">
                      Section {sIndex + 1}: {section.title}
                    </CardTitle>
                  )}
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSection(section.id);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(section.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedSections.has(section.id) && (
              <CardContent className="space-y-4">
                {/* Lessons List */}
                {section.lessons?.length > 0 && (
                  <div className="space-y-2 ml-8">
                    {section.lessons.map((lesson, lIndex) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-accent/30">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        {getLessonIcon(lesson.lesson_type)}
                        <div className="flex-1">
                          {editingLesson === lesson.id ? (
                            <Input
                              value={lesson.title}
                              onChange={(e) => {
                                setSections(sections.map(s => ({
                                  ...s,
                                  lessons: s.lessons?.map(l => 
                                    l.id === lesson.id ? { ...l, title: e.target.value } : l
                                  )
                                })));
                              }}
                              onBlur={() => handleUpdateLesson(lesson.id, { title: lesson.title })}
                              autoFocus
                            />
                          ) : (
                            <div>
                              <p className="font-medium text-sm">
                                {lIndex + 1}. {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-muted-foreground">{lesson.duration} min</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLesson(lesson.id)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(lesson.id, section.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Lesson Form */}
                <div className="ml-8 p-4 border-2 border-dashed rounded-md space-y-3">
                  <h4 className="font-semibold text-sm">Add New Lesson</h4>
                  
                  <Input
                    placeholder="Lesson title"
                    value={newLesson.section_id === section.id ? newLesson.title : ''}
                    onChange={(e) => setNewLesson({ ...newLesson, section_id: section.id, title: e.target.value })}
                  />

                  <select
                    value={newLesson.section_id === section.id ? newLesson.lesson_type : 'video'}
                    onChange={(e) => setNewLesson({ ...newLesson, section_id: section.id, lesson_type: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text/Article</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>

                  {(newLesson.lesson_type === 'video' && newLesson.section_id === section.id) && (
                    <div className="space-y-3">
                      {/* Video Source Tabs */}
                      <div className="flex gap-2 mb-3">
                        <Button
                          type="button"
                          size="sm"
                          variant={uploadMethod === 'url' ? 'default' : 'outline'}
                          onClick={() => setUploadMethod('url')}
                          className="flex-1"
                        >
                          🔗 YouTube URL
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={uploadMethod === 'upload' ? 'default' : 'outline'}
                          onClick={() => setUploadMethod('upload')}
                          className="flex-1"
                        >
                          📹 Upload Video
                        </Button>
                      </div>

                      {uploadMethod === 'url' ? (
                        <div className="space-y-2">
                          <div className="relative">
                            <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="YouTube Video URL (e.g., https://www.youtube.com/watch?v=xxxxx)"
                              value={newLesson.video_url}
                              onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                              className="pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <span>💡</span>
                            <span>Paste any YouTube video URL. Free and easy!</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <FileUploader
                            type="video"
                            maxSize={500}
                            label="Upload Course Video"
                            onUploadComplete={(data) => {
                              console.log('Video uploaded:', data);
                              setNewLesson({ ...newLesson, video_url: data.url });
                              toast.success('Video uploaded! Click "Add Lesson" to save.');
                            }}
                          />
                          {newLesson.video_url && uploadMethod === 'upload' && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-800">✅ Video uploaded successfully!</p>
                              <p className="text-xs text-green-600 mt-1 break-all">{newLesson.video_url}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <span>📹</span>
                            <span>Upload MP4, MOV, AVI, WEBM (Max 500MB). Videos are hosted on Cloudinary.</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(newLesson.lesson_type === 'quiz' && newLesson.section_id === section.id) && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Quiz Feature Coming Soon</p>
                      <p className="text-xs text-yellow-700">
                        Quiz creation is currently under development. For now, you can create a text lesson with quiz instructions. 
                        Full quiz functionality with questions, answers, and automatic grading will be available in the next update.
                      </p>
                    </div>
                  )}

                  {(newLesson.lesson_type === 'assignment' && newLesson.section_id === section.id) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 mb-2">📝 Assignment Instructions</p>
                      <p className="text-xs text-blue-700 mb-2">
                        Use the content field below to add assignment instructions, requirements, and submission guidelines.
                      </p>
                    </div>
                  )}

                  <textarea
                    placeholder="Lesson content/description"
                    value={newLesson.section_id === section.id ? newLesson.content : ''}
                    onChange={(e) => setNewLesson({ ...newLesson, section_id: section.id, content: e.target.value })}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />

                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={newLesson.section_id === section.id ? newLesson.duration : ''}
                    onChange={(e) => setNewLesson({ ...newLesson, section_id: section.id, duration: e.target.value })}
                  />

                  <Button onClick={() => handleAddLesson(section.id)} disabled={loading} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {sections.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No sections yet. Add your first section above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
