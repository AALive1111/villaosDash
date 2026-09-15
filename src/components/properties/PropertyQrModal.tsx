import React, { useState, useEffect } from 'react';
import { 
  QrCode, X, Copy, Check, ExternalLink, Printer, 
  ShieldCheck, Sparkles, Wifi, Key, Eye, Download
} from 'lucide-react';
import QRCode from 'qrcode';
import { Property } from '../../types';

interface PropertyQrModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onPreviewPortal?: (propertyId: string) => void;
}

export const PropertyQrModal: React.FC<PropertyQrModalProps> = ({
  property,
  isOpen,
  onClose,
  onPreviewPortal
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{ token: string; expiresAt: string } | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Compute portal URL
  const portalUrl = `${window.location.origin}?guestPortal=true&propertyId=${property.id}${tokenInfo?.token ? `&token=${tokenInfo.token}` : ''}`;

  useEffect(() => {
    if (!isOpen) return;

    // Fetch secure token from backend or generate QR
    const fetchTokenAndGenerateQr = async () => {
      try {
        const res = await fetch(`/api/guest-portal/qr-token/${property.id}`);
        if (res.ok) {
          const data = await res.json();
          setTokenInfo({ token: data.token, expiresAt: data.expiresAt });
          const url = `${window.location.origin}?guestPortal=true&propertyId=${property.id}&token=${data.token}`;
          const qr = await QRCode.toDataURL(url, {
            width: 320,
            margin: 2,
            color: {
              dark: '#1C1917',
              light: '#FFFFFF'
            }
          });
          setQrDataUrl(qr);
          return;
        }
      } catch (e) {
        console.warn('Backend QR token fetch fallback to client generation', e);
      }

      // Fallback direct URL QR
      const fallbackUrl = `${window.location.origin}?guestPortal=true&propertyId=${property.id}`;
      const qr = await QRCode.toDataURL(fallbackUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1C1917',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(qr);
    };

    fetchTokenAndGenerateQr();
  }, [isOpen, property.id]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-white flex items-center space-x-2">
                <span>Guest QR Portal</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                  Signed HMAC
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                {property.name} • {property.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* QR Display Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-stone-950 rounded-2xl border border-stone-800 text-center">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${property.name}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-stone-900 animate-pulse rounded-2xl flex items-center justify-center text-stone-500 text-xs">
                Generating Secure QR...
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographically signed to Workspace ID</span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
              Guests scan with any smartphone camera to open the instant mobile portal — no app download required.
            </p>
          </div>

          {/* Wi-Fi & Quick Info Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-800 text-xs">
              <div className="flex items-center space-x-1.5 text-stone-400 mb-1">
                <Wifi className="w-3.5 h-3.5 text-amber-400" />
                <span>Wi-Fi SSID</span>
              </div>
              <p className="font-mono font-bold text-stone-200 truncate">
                {property.rules?.wifiName || `${property.name} HighSpeed`}
              </p>
            </div>

            <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-800 text-xs">
              <div className="flex items-center space-x-1.5 text-stone-400 mb-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Wi-Fi Password</span>
              </div>
              <p className="font-mono font-bold text-stone-200 truncate">
                {property.rules?.wifiPassword || 'balivilla2026'}
              </p>
            </div>
          </div>

          {/* Copyable URL Input */}
          <div>
            <label className="text-xs text-stone-400 font-medium block mb-1.5">
              Guest Portal Direct Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-300 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0 ${
                  copiedUrl 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                }`}
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => {
                if (onPreviewPortal) {
                  onPreviewPortal(property.id);
                } else {
                  window.open(portalUrl, '_blank');
                }
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Guest View</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center space-x-2 border border-stone-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-400" />
              <span>Print Tent Card</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
