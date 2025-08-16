import { X, QrCode, Mail, Share2, Copy } from 'lucide-react';

// Mobile-responsive Share Modal
const ShareModal = ({ showShareModal, setShowShareModal, showQRCode, setShowQRCode }) => {
  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Share Form</h3>
            <button onClick={() => setShowShareModal(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Form Link</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" 
                  value="https://dbox.app/forms/abc123" 
                  readOnly 
                  className="flex-1 p-2 border rounded text-sm"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap">
                  <Copy className="w-4 h-4 inline mr-1" />
                  Copy
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-3 border rounded-lg hover:bg-gray-50 text-center"
              >
                <QrCode className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">QR Code</span>
              </button>
              <button className="p-3 border rounded-lg hover:bg-gray-50 text-center">
                <Mail className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Email</span>
              </button>
            </div>

            {showQRCode && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-32 h-32 bg-white border mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
                <p className="text-sm text-gray-600">Scan to open form</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;