import React, { useState, useEffect } from 'react';
import { qrApi } from '../../api/client';
import { QrCodeResponse } from '../../types';
import { QrCode, X, Copy, Check, ShieldCheck } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface DeliveryQrModalProps {
  assignmentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryQrModal: React.FC<DeliveryQrModalProps> = ({ assignmentId, isOpen, onClose }) => {
  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !assignmentId) return;

    const fetchQr = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await qrApi.getDeliveryQr(assignmentId);
        if (res.data.success) {
          setQrData(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to generate delivery QR code');
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [assignmentId, isOpen]);

  const handleCopyToken = () => {
    if (qrData?.token) {
      navigator.clipboard.writeText(qrData.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">Delivery Verification QR</h3>
        <p className="text-xs text-slate-500 mt-1">
          Present this single-use code to the volunteer when they deliver the food to your shelter.
        </p>

        {loading ? (
          <LoadingSpinner message="Generating secure QR token..." />
        ) : error ? (
          <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-xs mt-4">
            {error}
          </div>
        ) : qrData ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-inner">
              <img
                src={qrData.qrCodeBase64}
                alt="Delivery QR Code"
                className="w-52 h-52 mx-auto rounded-lg object-contain"
              />
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-left space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Manual Token Fallback
              </span>
              <div className="flex items-center justify-between text-xs font-mono text-slate-800 font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span className="truncate mr-2">{qrData.token}</span>
                <button
                  onClick={handleCopyToken}
                  className="text-sky-600 hover:text-sky-700 p-1"
                  title="Copy token"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Expires at {new Date(qrData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
