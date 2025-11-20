'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface PinButtonProps {
  businessId: string;
  businessName: string;
  className?: string;
  onPinChange?: (isPinned: boolean) => void;
}

export default function PinButton({ businessId, businessName, className = '', onPinChange }: PinButtonProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pinStatus, setPinStatus] = useState<'favorite' | 'want_to_try' | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if business is already pinned
        const res = await fetch(`/api/pins/check?business_id=${businessId}&user_id=${user.id}`);
        const json = await res.json();
        if (json.success) {
          setIsPinned(json.isPinned);
          setPinStatus(json.pin?.status || null);
        }
      }
    };
    
    checkUser();
  }, [businessId]);

  const handlePin = async () => {
    if (!currentUser) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    setIsLoading(true);
    try {
      if (isPinned) {
        // Unpin - find the pin ID first
        const pinsRes = await fetch(`/api/pins?user_id=${currentUser.id}`);
        const pinsJson = await pinsRes.json();
        const pin = pinsJson.pins?.find((p: any) => p.businessId === businessId);
        
        if (pin) {
          const res = await fetch(`/api/pins?pin_id=${pin.id}&user_id=${currentUser.id}`, {
            method: 'DELETE',
          });
          const json = await res.json();
          if (json.success) {
            setIsPinned(false);
            setPinStatus(null);
            onPinChange?.(false);
          }
        }
      } else {
        // Pin - default to 'want_to_try'
        const res = await fetch('/api/pins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser.id,
            business_id: businessId,
            status: 'want_to_try',
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsPinned(true);
          setPinStatus('want_to_try');
          onPinChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <button
        onClick={() => window.location.href = '/auth/login'}
        className={`p-2 rounded-full transition-[var(--transition-base)] hover:bg-[var(--color-surface)] ${className}`}
        title="Sign in to pin this café"
        aria-label="Sign in to pin"
      >
        <svg
          className="w-5 h-5"
          style={{ color: 'var(--color-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handlePin}
      disabled={isLoading}
      className={`p-2 rounded-full transition-[var(--transition-base)] ${
        isPinned
          ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
          : 'hover:bg-[var(--color-surface)]'
      } ${className}`}
      title={isPinned ? `Unpin ${businessName}` : `Pin ${businessName} to your board`}
      aria-label={isPinned ? 'Unpin' : 'Pin'}
    >
      {isLoading ? (
        <svg
          className="w-5 h-5 animate-spin"
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
      ) : (
        <svg
          className="w-5 h-5"
          fill={isPinned ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
    </button>
  );
}

