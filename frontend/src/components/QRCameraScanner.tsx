import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Upload, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface QRCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QRCameraScanner: React.FC<QRCameraScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-camera-region");
      }

      setCameraActive(true);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          handleSuccess(decodedText);
        },
        (errorMessage) => {
          // Frame parse failure is normal while scanning
        }
      );
    } catch (err: any) {
      console.warn("Camera scan start error:", err);
      setCameraActive(false);
      setErrorMsg(
        err.message || "Camera access was denied or no camera is available on this device. You can upload a QR image below."
      );
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn("Stop camera error:", err);
      }
    }
    setCameraActive(false);
  };

  const handleSuccess = (text: string) => {
    stopCamera();
    // Parse credential ID from URL or plain text
    let credId = text;
    if (text.includes("?id=")) {
      const match = text.match(/[?&]id=([^&#]+)/);
      if (match && match[1]) {
        credId = decodeURIComponent(match[1]);
      }
    }
    onScanSuccess(credId);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-camera-region");
      }
      const result = await scannerRef.current.scanFile(file, true);
      handleSuccess(result);
    } catch (err: any) {
      setErrorMsg("Could not detect a valid QR code in the uploaded image. Please ensure the QR is clear.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Scan Credential QR</h3>
              <p className="text-[11px] text-slate-400">Point your camera at the QR code</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <div id="qr-camera-region" className="w-full h-full"></div>

          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
              <Camera className="w-10 h-10 text-slate-600" />
              <p className="text-xs text-slate-400 max-w-xs">
                {errorMsg || "Connecting to camera..."}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera</span>
              </button>
            </div>
          )}
        </div>

        {/* Alternative: Image Upload */}
        <div className="pt-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4 text-brand-400" />
            <span>Upload QR Code Image / Screenshot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
