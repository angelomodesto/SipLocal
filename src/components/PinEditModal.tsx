'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface PinEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: {
    id: string;
    businessId: string;
    businessName: string;
    status: 'favorite' | 'want_to_try';
    userNotes: string | null;
    userImageUrl: string | null;
  } | null;
  userId: string;
  onSave: () => void;
}

export default function PinEditModal({ isOpen, onClose, pin, userId, onSave }: PinEditModalProps) {
  const [status, setStatus] = useState<'favorite' | 'want_to_try'>(pin?.status || 'want_to_try');
  const [notes, setNotes] = useState(pin?.userNotes || '');
  const [imageUrl, setImageUrl] = useState(pin?.userImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !pin) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('business_id', pin.businessId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setImageUrl(json.url);
      } else {
        alert(json.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          business_id: pin.businessId,
          status,
          user_notes: notes.trim() || null,
          user_image_url: imageUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        onSave();
        onClose();
      } else {
        alert(json.error || 'Failed to save pin');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save pin');
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Edit Pin: {pin.businessName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--color-surface)] transition-[var(--transition-base)]"
            >
              <svg
                className="w-6 h-6"
                style={{ color: 'var(--color-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus('want_to_try')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-[var(--transition-base)] ${
                  status === 'want_to_try'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                }`}
              >
                📌 Want to Try
              </button>
              <button
                onClick={() => setStatus('favorite')}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-[var(--transition-base)] ${
                  status === 'favorite'
                    ? 'bg-red-500 text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'
                }`}
              >
                ❤️ Favorite
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Your Photo (Optional)
            </label>
            {imageUrl ? (
              <div className="relative">
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-[var(--color-border-warm)]">
                  <Image
                    src={imageUrl}
                    alt="Your photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-[var(--transition-base)]"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--color-primary)] transition-[var(--transition-base)]"
                style={{ borderColor: 'var(--color-border-warm)' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 animate-spin mb-2"
                      style={{ color: 'var(--color-primary)' }}
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 mb-2"
                      style={{ color: 'var(--color-muted)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Click to upload a photo
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your thoughts about this café..."
              rows={4}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-[var(--color-primary)] transition-[var(--transition-base)] resize-none"
              style={{
                borderColor: 'var(--color-border-muted)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border rounded-xl font-medium transition-[var(--transition-base)]"
              style={{
                borderColor: 'var(--color-border-muted)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-dark)] transition-[var(--transition-base)] font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

