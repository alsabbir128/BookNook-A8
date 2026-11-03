'use client'

import { useState } from 'react'

type BookCoverImageProps = {
  src: string
  fallbackSrc?: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  decoding?: 'sync' | 'async' | 'auto'
}

export default function BookCoverImage({ src, fallbackSrc, alt, className, loading = 'lazy', decoding = 'async' }: BookCoverImageProps) {
  const [usingFallback, setUsingFallback] = useState(false)
  const imageSrc = usingFallback && fallbackSrc ? fallbackSrc : src

  return <img
    src={imageSrc}
    alt={alt}
    className={className}
    loading={loading}
    decoding={decoding}
    onError={() => {
      if (!usingFallback && fallbackSrc && fallbackSrc !== src) setUsingFallback(true)
    }}
  />
}
