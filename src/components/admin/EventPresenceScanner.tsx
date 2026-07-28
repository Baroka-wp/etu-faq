"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Camera, Loader2, X } from "lucide-react";

interface EventPresenceScannerProps {
  onDetected: (membreId: string) => void;
  onClose: () => void;
}

export default function EventPresenceScanner({
  onDetected,
  onClose,
}: EventPresenceScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [starting, setStarting] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const reader = new BrowserQRCodeReader();

    const start = async () => {
      try {
        if (!videoRef.current) return;
        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" } } },
          videoRef.current,
          (result) => {
            if (!result || !mounted) return;
            const match = /^OMP-MEMBRE:([A-Za-z0-9_-]+)$/.exec(
              result.getText().trim(),
            );
            if (!match) {
              setError("Cette carte n'est pas une carte membre OMP valide.");
              return;
            }
            controlsRef.current?.stop();
            onDetected(match[1]);
          },
        );
        if (!mounted) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setStarting(false);
      } catch {
        if (mounted) {
          setStarting(false);
          setError(
            "La caméra n'est pas accessible. Autorisez-la ou utilisez la recherche manuelle.",
          );
        }
      }
    };

    start();
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-slate-950/80 sm:items-center sm:justify-center sm:p-6">
      <section className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Pointage
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Scanner la carte membre
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-4 sm:p-5">
          <div className="relative aspect-[3/4] max-h-[62vh] overflow-hidden rounded-2xl bg-slate-950 sm:aspect-[4/3]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
            <div className="pointer-events-none absolute inset-[12%] rounded-2xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(2,6,23,0.28)]" />
            {starting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Ouverture de la caméra…</span>
              </div>
            )}
          </div>
          {error ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error}
            </p>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-slate-600">
              <Camera className="h-4 w-4" />
              Placez le QR code de la carte dans le cadre.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
