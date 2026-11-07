import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { qrApi } from '../../api/client';
import { QrVerificationResponse } from '../../types';
import {
  QrCode,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QrScannerPage: React.FC = () => {
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrVerificationResponse | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleVerify = async (token: string) => {
    if (!token || !token.trim()) {
      setError('Please enter or scan a valid token');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await qrApi.verify(token.trim());
      if (res.data.success) {
        setResult(res.data.data);
        setManualToken('');

        // Stop camera if running
        if (scannerRef.current) {
          try {
            scannerRef.current.clear();
          } catch (e) {
            console.error('Error clearing scanner', e);
          }
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Verification failed. Token may be invalid or already used.'
      );
    } finally {
      setLoading(false);
    }
  };

  const startCamera = () => {
    setError(null);
    setCameraActive(true);

    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            scanner.clear();
            setCameraActive(false);
            handleVerify(decodedText);
          },
          (scanError) => {
            // normal scanning frames
          }
        );
        scannerRef.current = scanner;
      } catch (e: any) {
        setError('Camera access failed or is not available on this device. Please use manual token entry below.');
        setCameraActive(false);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // cleanup
        }
      }
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <QrCode className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          QR Verification Scanner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Scan the donor's code at pickup or the NGO's code at delivery to update the chain of custody.
        </p>
      </div>

      {/* Success Result Banner */}
      {result && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-emerald-950">
            {result.verificationType === 'PICKUP' ? 'Pickup Verified!' : 'Delivery Complete!'}
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
            {result.message}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/volunteer/dashboard"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
            >
              Back to Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Scanner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Device Camera Scanner */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Camera Scanner
            </span>
            {cameraActive && (
              <button
                onClick={() => {
                  if (scannerRef.current) scannerRef.current.clear();
                  setCameraActive(false);
                }}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Stop Camera
              </button>
            )}
          </div>

          {!cameraActive ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Activate Device Camera
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                Requires camera permissions on mobile or laptop.
              </p>
            </div>
          ) : (
            <div id="qr-reader" className="w-full overflow-hidden rounded-xl border border-slate-200" />
          )}
        </div>

        {/* Manual Token Entry Fallback */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Desktop Manual Token Fallback
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Testing on a desktop without a webcam? Copy the token from the donor/NGO QR modal and paste it here.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(manualToken);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="e.g. PICKUP-3fa85f64-... or DELIVERY-..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !manualToken.trim()}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shrink-0"
            >
              {loading ? 'Verifying...' : 'Submit Token'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
