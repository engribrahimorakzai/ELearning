import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Play, CheckCircle, ChevronRight, Download, FileText, SkipForward, SkipBack, Lock, HelpCircle } from 'lucide-react';
import { courseAPI, lessonAPI } from '../services/api';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import ReactPlayer from 'react-player';

export const CoursePlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [played, setPlayed] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseData, curriculumData] = await Promise.all([
        courseAPI.getById(id),
        courseAPI.getCurriculum(id)
      ]);
      setCourse(courseData.course);
      setCurriculum(curriculumData.curriculum || []);
      
      // Set first lesson as current
      if (curriculumData.curriculum?.[0]?.lessons?.[0]) {
        loadLesson(curriculumData.curriculum[0].lessons[0].id);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lessonId, isLocked = false) => {
    if (isLocked) {
      toast.error('🔒 Please complete the previous lesson first to unlock this one!');
      return;
    }
    
    try {
      const response = await lessonAPI.getById(lessonId);
      console.log('📹 Loaded lesson:', response.lesson);
      console.log('📹 Video URL:', response.lesson?.video_url);
      console.log('📹 Content Type:', response.lesson?.content_type);
      console.log('🎯 Quiz ID:', response.lesson?.quiz_id);
      console.log('📄 Assignment ID:', response.lesson?.assignment_id);
      setCurrentLesson(response.lesson);
      setPlayed(0); // Reset progress
      
      // Load resources for this lesson (mock for now)
      setResources([
        { id: 1, name: 'Lesson Notes.pdf', type: 'pdf', url: '#' },
        { id: 2, name: 'Code Examples.zip', type: 'zip', url: '#' }
      ]);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  };

  // Check if lesson is unlocked based on previous completion
  const isLessonUnlocked = (lessonIndex, sectionLessons, checkLesson) => {
    // For quiz/assignment lessons, check if at least 3 video lessons are completed across ALL sections
    if (checkLesson?.content_type === 'quiz' || checkLesson?.lesson_type === 'quiz' ||
        checkLesson?.content_type === 'assignment' || checkLesson?.lesson_type === 'assignment') {
      
      // Get ALL video lessons from ALL sections in the entire course
      const allVideoLessons = curriculum.flatMap(section => 
        (section.lessons || []).filter(
          lesson => lesson.content_type === 'video' || lesson.lesson_type === 'video'
        )
      );
      
      // Count completed video lessons across entire course
      const completedVideoCount = allVideoLessons.filter(
        lesson => lesson.is_completed == true || lesson.is_completed === 'true'
      ).length;
      
      console.log('🔒 Checking quiz unlock:', {
        quizTitle: checkLesson.title,
        totalVideoLessons: allVideoLessons.length,
        allVideoLessons: allVideoLessons.map(l => ({
          title: l.title,
          is_completed: l.is_completed,
          type: typeof l.is_completed
        })),
        completedVideos: completedVideoCount,
        requiredVideos: 3
      });
      
      // Quiz is unlocked if at least 3 video lessons are completed (from any section)
      const isUnlocked = completedVideoCount >= 3;
      
      console.log('🔓 Quiz unlock result:', isUnlocked);
      return isUnlocked;
    }
    
    // First lesson (video) is always unlocked
    if (lessonIndex === 0) return true;
    
    // For regular video lessons, check if previous lesson is completed
    const previousLesson = sectionLessons[lessonIndex - 1];
    return previousLesson?.is_completed === true;
  };

  const handleProgress = (state) => {
    setPlayed(state.played);
    console.log('🎬 Video progress:', Math.round(state.played * 100) + '%');
    
    // Auto mark complete when 90% watched
    if (state.played >= 0.9 && currentLesson && !currentLesson.is_completed) {
      console.log('✅ Auto-completing lesson at 90%...');
      markComplete();
    }
  };

  const goToNextLesson = () => {
    const allLessons = curriculum.flatMap(s => s.lessons || []);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex < allLessons.length - 1) {
      loadLesson(allLessons[currentIndex + 1].id);
    }
  };

  const goToPreviousLesson = () => {
    const allLessons = curriculum.flatMap(s => s.lessons || []);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex > 0) {
      loadLesson(allLessons[currentIndex - 1].id);
    }
  };

  const markComplete = async () => {
    if (!currentLesson) return;
    
    if (currentLesson.is_completed) {
      toast.success('✅ This lesson is already completed!');
      return;
    }
    
    try {
      console.log('✅ Marking lesson complete:', currentLesson.id);
      const response = await lessonAPI.markComplete(currentLesson.id);
      console.log('✅ Completion response:', response);
      
      // Show success toast
      toast.success('🎉 Lesson marked as complete!');
      
      // Refresh curriculum to update completion status and progress
      const [courseData, curriculumData] = await Promise.all([
        courseAPI.getById(id),
        courseAPI.getCurriculum(id)
      ]);
      
      setCourse(courseData.course);
      setCurriculum(curriculumData.curriculum || []);
      
      // Update current lesson with fresh data
      const updatedLesson = curriculumData.curriculum
        ?.flatMap(s => s.lessons || [])
        .find(l => l.id === currentLesson.id);
      
      if (updatedLesson) {
        setCurrentLesson(updatedLesson);
      }
      
      console.log('✅ Curriculum refreshed with updated completion status!');
    } catch (error) {
      console.error('❌ Failed to mark complete:', error);
      toast.error(error.response?.data?.error || 'Failed to mark lesson as complete. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = course?.progress || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6 max-w-5xl mx-auto">
          {currentLesson ? (
            <>
              <h1 className="text-2xl font-bold mb-4">{currentLesson.title}</h1>
              
              {/* Video Player */}
              {(currentLesson.content_type === 'video' || currentLesson.lesson_type === 'video') && currentLesson.video_url && (
                <div className="mb-6">
                  <div className="relative w-full" style={{ maxHeight: '480px' }}>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg" style={{ maxHeight: '480px' }}>
                      <ReactPlayer
                        ref={playerRef}
                        url={currentLesson.video_url}
                        width="100%"
                        height="100%"
                      controls
                      playing={false}
                      playbackRate={playbackRate}
                      onProgress={handleProgress}
                      config={{
                        youtube: {
                          playerVars: { 
                            showinfo: 1,
                            modestbranding: 1,
                            rel: 0
                          }
                        }
                      }}
                    />
                    </div>
                  </div>
                  
                  {/* Playback Controls */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Speed:</span>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={`px-2 py-1 rounded text-sm ${
                            playbackRate === rate 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                    
                    <div className="ml-auto flex gap-2">
                      <Button variant="outline" size="sm" onClick={goToPreviousLesson}>
                        <SkipBack className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToNextLesson}>
                        Next
                        <SkipForward className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Content */}
              {currentLesson.content && (
                <Card className="p-6 mb-6">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                </Card>
              )}

              {/* Quiz/Assignment Actions */}
              {(currentLesson.content_type === 'quiz' || currentLesson.lesson_type === 'quiz') && (
                <>
                  {currentLesson.quiz_id ? (
                    <Button 
                      onClick={() => {
                        console.log('🎯 Navigating to quiz:', currentLesson.quiz_id);
                        navigate(`/quiz/${currentLesson.quiz_id}`);
                      }} 
                      className="w-full" 
                      size="lg"
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Take Quiz
                    </Button>
                  ) : (
                    <Card className="p-6 bg-yellow-50 border-yellow-200">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">⚠️</div>
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-1">Quiz Not Available</h4>
                          <p className="text-sm text-yellow-700 mb-2">
                            This quiz hasn't been set up yet by the instructor. Please check back later or contact your instructor.
                          </p>
                          <p className="text-xs text-yellow-600 italic">
                            Note: Quiz feature is currently under development
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}

              {(currentLesson.content_type === 'assignment' || currentLesson.lesson_type === 'assignment') && (
                <Button onClick={() => navigate(`/assignment/${currentLesson.assignment_id}`)} className="w-full" size="lg">
                  <FileText className="mr-2 h-5 w-5" />
                  View Assignment
                </Button>
              )}

              {(currentLesson.content_type === 'video' || currentLesson.lesson_type === 'video') && (
                <Button onClick={markComplete} className="w-full" size="lg" disabled={currentLesson.is_completed}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {currentLesson.is_completed ? 'Completed ✓' : 'Mark as Complete'}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Select a lesson to start learning</p>
            </div>
          )}
        </div>

        {/* Curriculum Sidebar */}
        <aside className="w-96 border-l bg-white p-4 overflow-y-auto h-screen">
          <div className="mb-4">
            <h2 className="font-semibold mb-2">{course?.title}</h2>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% Complete</p>
          </div>

          <div className="space-y-4">
            {curriculum.map((section, sectionIndex) => (
              <div key={section.id} className="border-b pb-4">
                <h3 className="font-semibold text-sm mb-3 text-foreground flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {sectionIndex + 1}
                  </span>
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.lessons?.map((lesson, lessonIndex) => {
                    const isUnlocked = isLessonUnlocked(lessonIndex, section.lessons, lesson);
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = lesson.is_completed;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => loadLesson(lesson.id, !isUnlocked)}
                        disabled={!isUnlocked}
                        className={`w-full p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-primary/20 to-blue-500/20 border-2 border-primary shadow-md' 
                            : isUnlocked
                            ? 'hover:bg-primary/5 border border-transparent hover:border-primary/30'
                            : 'opacity-50 cursor-not-allowed bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <div className="bg-green-500 rounded-full p-1">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : isUnlocked ? (
                            <div className={`rounded-full p-1 ${
                              lesson.content_type === 'quiz' || lesson.lesson_type === 'quiz'
                                ? 'bg-amber-500/20'
                                : 'bg-primary/20'
                            }`}>
                              {lesson.content_type === 'quiz' || lesson.lesson_type === 'quiz' ? (
                                <HelpCircle className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Play className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-200 rounded-full p-1">
                              <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block truncate ${
                            isActive ? 'text-primary' : isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {lesson.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {lesson.duration && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(lesson.duration / 60)} min
                              </span>
                            )}
                            {(lesson.content_type === 'quiz' || lesson.lesson_type === 'quiz') && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                Quiz
                              </span>
                            )}
                          </div>
                        </div>
                        {!isUnlocked && (
                          <div className="flex-shrink-0">
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                              Locked
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Course Progress</span>
              <span className="text-sm text-primary font-bold">{progress}%</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Completed Lessons:</span>
                <span className="font-medium">
                  {curriculum.reduce((acc, section) => 
                    acc + (section.lessons?.filter(l => l.is_completed).length || 0), 0
                  )} / {curriculum.reduce((acc, section) => 
                    acc + (section.lessons?.length || 0), 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
