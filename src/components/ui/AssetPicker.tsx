import React, { useState, useEffect } from 'react';
import { uploadAsset, getAssets, ContentAsset } from '@/lib/api/content';
import { CORE_ASSETS } from '@/lib/core_assets';

interface AssetPickerProps {
  onSelect: (url: string) => void;
  onCancel?: () => void;
}

export function AssetPicker({ onSelect, onCancel }: AssetPickerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'core'>('library');
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'library') {
      fetchAssets();
    }
  }, [activeTab]);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    setError(null);
    try {
      const data = await getAssets();
      setAssets(data);
    } catch (err: any) {
      setError('Failed to load assets');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const response = await uploadAsset(file);
      onSelect(response.publicUrl);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(`Failed to upload: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-3xl mx-auto flex flex-col h-[600px]">
      <div className="flex border-b border-gray-200 dark:border-gray-700 p-4 justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-t-lg">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Select Asset</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          ✕
        </button>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-primary text-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload New
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'border-b-2 border-primary text-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('library')}
        >
          Cloud Library
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'core'
              ? 'border-b-2 border-primary text-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onClick={() => setActiveTab('core')}
        >
          Core Assets
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded mb-4 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-8">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
              Drag and drop your file here, or click to browse
            </p>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept="image/*,audio/*"
            />
            <label
              htmlFor="file-upload"
              className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark cursor-pointer transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>
        )}
        
        {activeTab === 'library' && (
          <div>
            {loadingAssets ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                No assets found in library.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.name}
                    className="group relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all hover:shadow-md"
                    onClick={() => onSelect(asset.publicUrl)}
                  >
                    {asset.metadata?.mimetype?.startsWith('audio') ? (
                       <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                         <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                         <span className="text-xs px-2 text-center truncate w-full">{asset.name}</span>
                       </div>
                    ) : (
                      <img
                        src={asset.publicUrl}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'core' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CORE_ASSETS.map((asset) => (
              <div
                key={asset.path}
                className="group relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all hover:shadow-md"
                onClick={() => onSelect(asset.path)}
                title={asset.path}
              >
                 {asset.type === 'audio' ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                     <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                     <span className="text-xs px-2 text-center truncate w-full font-medium">{asset.name}</span>
                     <span className="text-[10px] text-gray-400">{asset.category}</span>
                   </div>
                ) : (
                  // For local assets in web admin, we can't really "Preview" them easily if they are outside public.
                  // But we might have valid paths if we assume we are running in a context where they are known.
                  // Or just show a placeholder icon.
                  // Wait, daving_web cannot load C:/.../assets/svg/bear1.svg
                  // So we should show a placeholder icon with the name.
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                     <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     <span className="text-xs px-2 text-center truncate w-full font-medium">{asset.name}</span>
                     <span className="text-[10px] text-gray-400">{asset.category}</span>
                   </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
