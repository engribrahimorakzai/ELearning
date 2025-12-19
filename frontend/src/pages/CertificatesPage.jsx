import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { dashboardAPI } from '../services/api';
import { Award, Download, Share2, ExternalLink, Calendar } from 'lucide-react';

export const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const certificateRef = useRef(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getCertificates();
      setCertificates(data.certificates || []);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (cert) => {
    // Set the certificate to display and trigger print
    setSelectedCert(cert);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleShare = (cert) => {
    const shareUrl = `${window.location.origin}/certificate/${cert.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${cert.course_title}`,
        text: `I completed ${cert.course_title}!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CertificatePreview = ({ certificate }) => (
    <div
      ref={certificateRef}
      className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-blue-50 to-indigo-100 border-8 border-amber-600 rounded-lg p-12 flex flex-col items-center justify-center text-center"
    >
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-amber-600"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-amber-600"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-amber-600"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-amber-600"></div>

      {/* Content */}
      <Award className="w-24 h-24 text-amber-600 mb-6" />
      
      <h1 className="text-5xl font-serif font-bold text-gray-800 mb-2">Certificate of Completion</h1>
      <div className="w-32 h-1 bg-amber-600 mb-8"></div>
      
      <p className="text-xl text-gray-600 mb-4">This is to certify that</p>
      
      <h2 className="text-4xl font-bold text-gray-900 mb-8">
        {certificate.student_name || 'Student Name'}
      </h2>
      
      <p className="text-xl text-gray-600 mb-4">has successfully completed</p>
      
      <h3 className="text-3xl font-semibold text-indigo-700 mb-8">
        {certificate.course_title}
      </h3>
      
      <div className="flex items-center gap-2 text-gray-600 mb-4">
        <Calendar className="w-5 h-5" />
        <p className="text-lg">
          Completed on {formatDate(certificate.completed_at || new Date())}
        </p>
      </div>

      {certificate.progress && certificate.progress === 100 && (
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full">
            <Award className="w-5 h-5 text-green-700" />
            <span className="text-lg font-semibold text-green-700">
              100% Course Completion
            </span>
          </div>
        </div>
      )}

      <div className="mt-auto pt-8 border-t-2 border-gray-300 w-full">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 px-8">
              <p className="font-semibold">Instructor Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-gray-400 pt-2 px-8">
              <p className="font-semibold">Platform Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate ID */}
      <p className="absolute bottom-2 right-4 text-xs text-gray-500">
        Certificate ID: CERT-{certificate.id}-{new Date().getFullYear()}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            <p className="text-center text-muted-foreground">Loading certificates...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
            <p className="text-muted-foreground">
              {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
            </p>
          </div>

          {certificates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Complete courses to earn certificates and showcase your achievements
                </p>
              </CardContent>
            </Card>
          ) : selectedCert ? (
            <div className="space-y-6">
              <Button variant="outline" onClick={() => setSelectedCert(null)} className="print:hidden">
                ← Back to All Certificates
              </Button>

              <Card>
                <CardContent className="p-8">
                  <CertificatePreview certificate={selectedCert} />

                  <div className="flex gap-3 mt-6 justify-center print:hidden">
                    <Button onClick={() => window.print()} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleShare(selectedCert)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.enrollment_id || cert.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Award className="w-12 h-12 text-amber-600" />
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Completed: {formatDate(cert.completed_at || cert.enrolled_at)}
                    </p>
                    {cert.instructor_name && (
                      <p className="text-xs text-muted-foreground mb-4">
                        By {cert.instructor_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      By {cert.instructor_name}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedCert(cert)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(cert);
                        }}
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
