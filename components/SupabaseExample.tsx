'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function SupabaseExample() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Check if environment variables are set
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError('Supabase environment variables not configured. Please check your .env.local file.')
          setIsConnected(false)
          return
        }

        const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1)
        
        if (error) {
          setError(error.message)
          setIsConnected(false)
        } else {
          setIsConnected(true)
        }
      } catch (err) {
        setError('Failed to connect to Supabase')
        setIsConnected(false)
      }
    }

    testConnection()
  }, [])

  if (isConnected === null) {
    return <div className="p-4">Testing Supabase connection...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Status</h3>
      {isConnected ? (
        <div className="text-green-600">
          ✅ Successfully connected to Supabase!
        </div>
      ) : (
        <div className="text-red-600">
          ❌ Failed to connect to Supabase
          {error && <div className="text-sm mt-1">Error: {error}</div>}
        </div>
      )}
    </div>
  )
}
