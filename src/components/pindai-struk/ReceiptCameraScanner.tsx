"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  AlertCircle,
  ScanLine,
  Image as ImageIcon,
} from "lucide-react";

interface ReceiptCameraScannerProps {
  onCapture: (imageDataUrl: string) => void;
  onSwitchToUpload: () => void;
}

export default function ReceiptCameraScanner({
  onCapture,
  onSwitchToUpload,
}: ReceiptCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const nativeInputRef = useRef<HTMLInputElement | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setHasCameraPermission(false);
        setErrorMessage("Perangkat tidak mendukung akses video kamera langsung.");
        return;
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 1920 },
        },
        audio: false,
      });

      setStream(newStream);
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      console.warn("Camera access denied or failed:", err);
      setHasCameraPermission(false);
      setErrorMessage(
        "Izin kamera tidak diberikan atau kamera tidak tersedia. Gunakan tombol kamera native atau unggah file."
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        stopStream();
        onCapture(dataUrl);
      }
    }
  };

  const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          stopStream();
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={nativeInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCapture}
        className="hidden"
      />

      {/* Viewfinder Container */}
      <div className="relative w-full aspect-[3/4] max-w-sm bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
        {hasCameraPermission === false || errorMessage ? (
          <div className="p-6 text-center space-y-3 z-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              {errorMessage || "Kamera langsung belum aktif."}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => nativeInputRef.current?.click()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Camera size={16} />
                <span>Buka Kamera Bawaan HP</span>
              </button>
              <button
                type="button"
                onClick={onSwitchToUpload}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <ImageIcon size={16} />
                <span>Pilih dari Galeri / File</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Receipt Scanner Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              {/* Outer dimmed border */}
              <div className="relative w-full h-[85%] border-2 border-dashed border-blue-400/80 rounded-2xl flex flex-col justify-between p-3 bg-black/10">
                {/* 4 Corner Markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />

                {/* Animated Laser Guideline */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-pulse" />

                <div className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold py-1 px-3 rounded-full mx-auto flex items-center gap-1.5 shadow-xs">
                  <ScanLine size={13} className="text-blue-400 animate-spin" />
                  <span>Posisikan struk di dalam kotak</span>
                </div>
              </div>
            </div>

            {/* Top In-Camera Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsFlashOn((prev) => !prev)}
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition ${
                  isFlashOn ? "bg-amber-400 text-slate-950" : "bg-black/50 text-white hover:bg-black/70"
                }`}
                title="Flash"
              >
                {isFlashOn ? <Zap size={16} /> : <ZapOff size={16} />}
              </button>

              <button
                type="button"
                onClick={toggleCameraFacing}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition"
                title="Ganti Kamera"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Shutter & Alternate Action Buttons */}
      <div className="flex items-center justify-center gap-6 w-full max-w-sm pt-2">
        <button
          type="button"
          onClick={onSwitchToUpload}
          className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-xs transition active:scale-95"
          title="Galeri / File"
        >
          <ImageIcon size={20} />
        </button>

        {/* Shutter Button */}
        <button
          type="button"
          onClick={capturePhoto}
          disabled={hasCameraPermission === false}
          className="w-18 h-18 rounded-full border-4 border-blue-500 p-1 flex items-center justify-center shadow-xl transition active:scale-90 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="w-full h-full bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-inner">
            <Camera size={26} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => nativeInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center shadow-xs transition active:scale-95"
          title="Kamera Bawaan"
        >
          <Camera size={20} />
        </button>
      </div>
    </div>
  );
}
