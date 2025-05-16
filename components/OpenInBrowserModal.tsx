'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function OpenInBrowserModal() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Delay a tick so the page renders first
    setTimeout(() => setShow(true), 100)
  }, [])

  if (!show) return null

  // Construct an Android Intent URI if on Android
  const currentURL = window.location.href
  const isAndroid = /Android/i.test(navigator.userAgent)
  const intentURL = isAndroid
    ? `intent://${currentURL.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`
    : currentURL

  const handleOpen = () => {
    // On Android: intent:// opens Chrome
    // On iOS/Web: just open a fresh tab
    window.location.href = intentURL
  }

  return (
    <div
      className={clsx(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4',
        'z-50'
      )}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">Open in your browser</h2>
        <p className="mb-4 text-gray-700">
          Google Sign-In doesn’t work inside this in-app browser. Tap the button
          below to continue in your device’s default browser.
        </p>
        <button
          onClick={handleOpen}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open in Browser
        </button>
      </div>
    </div>
  )
}
