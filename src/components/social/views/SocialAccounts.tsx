import React, { useState, useEffect } from 'react';
import { SocialAccount } from '../../../types';
import { Share2, Instagram, Facebook, Plus, CheckCircle2, AlertCircle, Loader2, ChevronDown, Info, Settings, Globe } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface SocialAccountsProps {
  accounts: SocialAccount[];
  selectedPropertyId: string | null;
}

export const SocialAccounts: React.FC<SocialAccountsProps> = ({ accounts, selectedPropertyId }) => {
  const { connectSocialAccount } = useApp();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoInfo, setShowDemoInfo] = useState<{ missingVars: string[] } | null>(null);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const response = await fetch('/api/social/instagram/config');
        if (response.ok) {
          const data = await response.json();
          if (!data.isLive) {
            setShowDemoInfo({ missingVars: data.missingVars });
          }
        }
      } catch (e) {
        console.warn('[VillaOS] Failed to fetch social config status');
      }
    };
    checkConfig();
  }, []);

  const filteredAccounts = selectedPropertyId ? accounts.filter(a => a.propertyId === selectedPropertyId) : accounts;

  const handleConnect = async (provider: 'Instagram' | 'Facebook' | 'TikTok' | 'Google Business') => {
    if (!selectedPropertyId) {
      setError('Please select a property first.');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setShowDemoInfo(null);
    setShowDropdown(false);
    
    try {
      const data = await connectSocialAccount(selectedPropertyId, provider);
      if (data && !data.isLive) {
        setShowDemoInfo({ missingVars: data.missingVars });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate connection.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900">Connected Accounts</h2>
          <p className="text-sm text-stone-500">Manage connections to your social platforms.</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isConnecting}
            className="flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting Instagram...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Connect Account</span>
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 py-2 animate-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => handleConnect('Instagram')}
                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm font-medium transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
                <span>Instagram Business</span>
              </button>
              <button 
                disabled
                className="w-full flex items-center space-x-3 px-4 py-2.5 opacity-40 cursor-not-allowed text-stone-700 text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Facebook className="w-3.5 h-3.5" />
                </div>
                <span>Facebook Page</span>
              </button>
              <button 
                disabled
                className="w-full flex items-center space-x-3 px-4 py-2.5 opacity-40 cursor-not-allowed text-stone-700 text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center text-white">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <span>TikTok Business</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showDemoInfo && (
        <div className="bg-[#FEFAE0] border border-[#F1EDD4] p-5 rounded-2xl flex items-start space-x-4 text-[#2D2926] animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#2D2926]">Instagram Demo Mode Active</p>
              <button onClick={() => setShowDemoInfo(null)} className="text-stone-400 hover:text-stone-600 p-1">
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            </div>
            <p className="text-xs mt-1 leading-relaxed text-[#606C38]">
              Live Instagram Graph API integration is not configured. VillaOS is currently using sandbox demo data to simulate engagement and inbox interactions.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <button 
                onClick={() => setShowConfigDetails(!showConfigDetails)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-[#F1EDD4] rounded-lg text-[11px] font-bold text-[#606C38] hover:bg-[#FAF9F6] transition-all shadow-sm"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{showConfigDetails ? 'Close Setup Guide' : 'Connect Real Instagram Account'}</span>
              </button>
            </div>
            
            {showConfigDetails && (
              <div className="mt-4 p-5 bg-white rounded-xl border border-[#F1EDD4] text-xs space-y-5 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <h4 className="font-bold text-[#2D2926] flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#606C38] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Set up Meta Developer Portal</span>
                  </h4>
                  <div className="pl-7 space-y-2 text-[#606C38]">
                    <p>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-dotted underline-offset-2 hover:text-[#2D2926]">developers.facebook.com</a> and create a "Business" type app.</p>
                    <p>Add the <strong>Instagram Graph API</strong> product to your application.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#2D2926] flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#606C38] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Configure OAuth & Permissions</span>
                  </h4>
                  <div className="pl-7 space-y-2 text-[#606C38]">
                    <p>Add <code>{window.location.origin}/api/social/instagram/callback</code> to your Valid OAuth Redirect URIs.</p>
                    <p>Ensure your Instagram account is a <strong>Professional (Business/Creator)</strong> account linked to a Facebook Page.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-[#2D2926] flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#606C38] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Apply Environment Variables</span>
                  </h4>
                  <div className="pl-7">
                    <p className="mb-3">Open your application settings and provide the following keys:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {showDemoInfo.missingVars.map(v => (
                        <div key={v} className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
                          <code className="text-[10px] font-bold text-[#2D2926]">{v}</code>
                          <span className="text-[9px] text-[#BC6C25] font-bold uppercase tracking-widest">Required</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start space-x-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-[11px] text-blue-800 leading-normal">
                    <strong>Production Note:</strong> To access full analytics (Insights) and messaging, your Meta app will need to complete <strong>Business Verification</strong> and <strong>App Review</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start space-x-3 text-red-800 animate-in shake duration-500">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold">Connection Error</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold underline ml-auto">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map(account => (
          <div key={account.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    account.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600' :
                    account.platform === 'TikTok' ? 'bg-stone-900' : 'bg-blue-600'
                  }`}>
                    {account.platform === 'Instagram' ? <Instagram className="w-5 h-5" /> :
                     account.platform === 'TikTok' ? <Share2 className="w-5 h-5" /> :
                     <Facebook className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{account.handle}</h4>
                    <p className="text-[11px] text-stone-500">{account.propertyName}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">Followers</div>
                  <div className="font-bold text-sm text-stone-900 mt-1">{(account.followers || 0).toLocaleString()}</div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="text-[10px] text-stone-400 uppercase tracking-wider">Engagement</div>
                  <div className="font-bold text-sm text-emerald-700 mt-1">{account.engagementRate}%</div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {account.status === 'Connected' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : account.status === 'Demo Connection' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={`text-[11px] font-bold ${
                    account.status === 'Connected' ? 'text-emerald-700' : 
                    account.status === 'Demo Connection' ? 'text-amber-700' : 
                    'text-red-700'
                  }`}>
                    {account.status === 'Connected' ? 'LIVE' : account.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Synced {account.lastSync}</span>
              </div>
              {account.lastError && (
                <div className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100">
                  {account.lastError}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
