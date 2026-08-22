import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Camera,
  Check,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Smile,
  Type
} from "lucide-react";
import { PRESET_AVATARS, UserAvatar } from "./UserAvatar";
import { User } from "../types";

interface AvatarPickerModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarData: {
    avatarType: "initials" | "preset" | "upload";
    avatarValue: string;
    avatarUrl?: string;
  }) => Promise<void>;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<"preset" | "upload" | "camera" | "initials">(
    user.avatarType || "initials"
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(
    user.avatarType === "preset" ? user.avatarValue || "avatar-1" : "avatar-1"
  );
  const [uploadedImage, setUploadedImage] = useState<string>(
    user.avatarType === "upload" ? user.avatarUrl || user.avatarValue || "" : ""
  );

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start / Stop camera when camera tab is active
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera is not supported on this device/browser. You can upload a photo instead.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: "user" }
      });
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError("Camera unavailable or permission denied. You can upload a photo instead.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 400;
    canvas.height = videoRef.current.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(dataUrl);
      setUploadedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (activeTab === "preset") {
        await onSave({
          avatarType: "preset",
          avatarValue: selectedPreset,
          avatarUrl: ""
        });
      } else if (activeTab === "upload" || (activeTab === "camera" && capturedPhoto)) {
        const imageToSave = capturedPhoto || uploadedImage;
        if (!imageToSave) {
          setError("Please select or upload an image first.");
          setSaving(false);
          return;
        }
        await onSave({
          avatarType: "upload",
          avatarValue: imageToSave,
          avatarUrl: imageToSave
        });
      } else if (activeTab === "initials") {
        await onSave({
          avatarType: "initials",
          avatarValue: "",
          avatarUrl: ""
        });
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile avatar.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg p-6 rounded-3xl border border-slate-800 shadow-2xl bg-slate-900/95 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Choose Profile Picture</h3>
              <p className="text-xs text-slate-400">Select an avatar or upload a personal photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview of currently active selection */}
        <div className="flex items-center justify-center py-2">
          <div className="relative">
            {activeTab === "preset" ? (
              <UserAvatar
                name={user.name}
                avatarType="preset"
                avatarValue={selectedPreset}
                size="xl"
                role={user.role}
              />
            ) : activeTab === "upload" || activeTab === "camera" ? (
              capturedPhoto || uploadedImage ? (
                <img
                  src={capturedPhoto || uploadedImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-brand-500 shadow-xl"
                />
              ) : (
                <UserAvatar name={user.name} size="xl" role={user.role} />
              )
            ) : (
              <UserAvatar name={user.name} avatarType="initials" size="xl" role={user.role} />
            )}
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[9px] font-bold bg-slate-900 border border-slate-700 text-slate-300 rounded-full">
              Preview
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Source Mode Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "preset" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "upload" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "camera" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("initials")}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === "initials" ? "bg-brand-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Initials</span>
          </button>
        </div>

        {/* Tab 1: 8 Preset Avatars */}
        {activeTab === "preset" && (
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400">
              Select one of the 8 professional avatars:
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition border ${
                    selectedPreset === preset.id
                      ? "border-brand-400 bg-brand-950/40 shadow-lg scale-105"
                      : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${preset.bg} flex items-center justify-center text-xl shadow`}
                  >
                    {preset.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <label className="p-6 bg-slate-950/80 border-2 border-dashed border-slate-800 hover:border-brand-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition space-y-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-slate-200">
                Click to browse photo from computer
              </div>
              <div className="text-[11px] text-slate-500">Supports PNG, JPG, JPEG, WEBP (Max 5MB)</div>
            </label>

            {uploadedImage && (
              <div className="text-center text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Photo loaded into preview!
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Take Photo with Camera */}
        {activeTab === "camera" && (
          <div className="space-y-3 text-center">
            {cameraError ? (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">{cameraError}</div>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Switch to Upload Photo
                </button>
              </div>
            ) : capturedPhoto ? (
              <div className="space-y-2">
                <img
                  src={capturedPhoto}
                  alt="Captured"
                  className="w-40 h-40 mx-auto rounded-2xl object-cover border-2 border-brand-500 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCapturedPhoto(null);
                    startCamera();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                >
                  Retake Photo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Snap Photo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Initials Avatar */}
        {activeTab === "initials" && (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Use your clean geometric monogram initials (<strong>{user.name}</strong>) with role-tailored gradient styling.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
