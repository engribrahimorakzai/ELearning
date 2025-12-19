import React, { useRef } from 'react';
import { Award, Calendar, CheckCircle, Download, X } from 'lucide-react';

export const CertificateDisplay = ({ certificateData, onClose }) => {
  const certificateRef = useRef(null);
  
  if (!certificateData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors print:hidden"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 text-center print:hidden">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
          <p className="text-lg">You've earned your certificate!</p>
        </div>

        {/* Certificate */}
        <div className="p-8">
          <div className="relative aspect-[1.414/1] bg-gradient-to-br from-blue-50 to-indigo-100 border-8 border-amber-600 rounded-lg p-8 md:p-12 flex flex-col items-center justify-center text-center">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-600"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-600"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-600"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-600"></div>

            {/* Content */}
            <Award className="w-16 md:w-24 h-16 md:h-24 text-amber-600 mb-4" />
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-800 mb-2">
              Certificate of Completion
            </h1>
            <div className="w-24 md:w-32 h-1 bg-amber-600 mb-6"></div>
            
            <p className="text-lg md:text-xl text-gray-600 mb-3">This is to certify that</p>
            
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
              {certificateData.student_name}
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-3">has successfully completed</p>
            
            <h3 className="text-xl md:text-3xl font-semibold text-indigo-700 mb-6">
              {certificateData.course_title}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              <p className="text-base md:text-lg">
                Completed on {formatDate(certificateData.completion_date)}
              </p>
            </div>

            {certificateData.final_score && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full">
                  <Award className="w-5 h-5 text-green-700" />
                  <span className="text-lg font-semibold text-green-700">
                    Final Score: {certificateData.final_score}%
                  </span>
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t-2 border-gray-300 w-full">
              <div className="flex justify-around text-sm md:text-base">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {certificateData.instructor_name}
                  </p>
                  <p className="text-gray-600">Instructor</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">E-Learning Platform</p>
                  <p className="text-gray-600">Platform Authority</p>
                </div>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="mt-4 text-xs text-gray-500">
              Certificate ID: {certificateData.certificate_id}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 justify-center print:hidden">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
            >
              <Download className="w-5 h-5" />
              Download as PDF
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
