import React, { useState, useEffect } from 'react';
import { X, QrCode, Mail, Share2, Copy, Check, ExternalLink } from 'lucide-react';

// Generate QR Code using QR Server API
const generateQRCode = (text, size = 150) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
};

const ShareModal = ({ 
  showShareModal, 
  setShowShareModal, 
  showQRCode, 
  setShowQRCode,
  formId = 'abc123', // This should be passed as a prop with the actual form ID
  formTitle = 'My Form' // This should be passed as a prop with the actual form title
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  
  // Generate the actual form URL - replace with your actual domain
  const formUrl = `https://dbox.app/forms/${formId}`;
  
  useEffect(() => {
    // Check if Web Share API is supported
    setShareSupported('share' in navigator);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWebAPI = async () => {
    if (shareSupported) {
      try {
        await navigator.share({
          title: formTitle,
          text: `Please fill out this form: ${formTitle}`,
          url: formUrl
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Please fill out: ${formTitle}`);
    const body = encodeURIComponent(`Hi,\n\nPlease fill out this form: ${formTitle}\n\n${formUrl}\n\nThank you!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const openFormInNewTab = () => {
    window.open(formUrl, '_blank');
  };

  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Share Form</h3>
            <button 
              onClick={() => setShowShareModal(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Form Link Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Form Link</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formUrl}
                  readOnly
                  className="flex-1 p-2 border rounded text-sm bg-gray-50"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={copyToClipboard}
                    className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 inline mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 inline mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                  <button 
                    onClick={openFormInNewTab}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                    title="Open form in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Share Options */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className={`p-3 border rounded-lg hover:bg-gray-50 text-center transition-colors ${
                  showQRCode ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <QrCode className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">QR Code</span>
              </button>
              
              <button 
                onClick={shareViaEmail}
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                <Mail className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Email</span>
              </button>
              
              {shareSupported && (
                <button 
                  onClick={shareViaWebAPI}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-center"
                >
                  <Share2 className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-sm">Share</span>
                </button>
              )}
            </div>

            {/* QR Code Section */}
            {showQRCode && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-40 h-40 bg-white border mx-auto mb-3 flex items-center justify-center rounded-lg overflow-hidden">
                  <img 
                    src={generateQRCode(formUrl, 150)}
                    alt="QR Code for form"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full items-center justify-center text-xs text-gray-500"
                    style={{ display: 'none' }}
                  >
                    QR Code failed to load
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">Scan to open form</p>
                <p className="text-xs text-gray-500">
                  Point your camera at the QR code to open the form
                </p>
              </div>
            )}
            
            {/* Form Preview Info */}
            <div className="border-t pt-4 mt-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Form: {formTitle}</p>
                <p>ID: {formId}</p>
                <p className="text-xs mt-2">
                  Anyone with this link can access and fill out your form
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example usage component

export default ShareModal;