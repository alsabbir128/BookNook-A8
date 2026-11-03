'use client'

import { useEffect, useState } from 'react'
import { ImagePlus } from 'lucide-react'

type BookImageFieldProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  currentImage?: string
  imageUrl: string
  onImageUrlChange: (url: string) => void
  required?: boolean
}

export default function BookImageField({ file, onFileChange, currentImage, imageUrl, onImageUrlChange, required = false }: BookImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState(currentImage ?? '')

  useEffect(() => {
    if (!file) {
      setPreviewUrl(imageUrl.trim() || currentImage || '')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [currentImage, file, imageUrl])

  return (
    <div className="book-image-field">
      <div className="book-image-preview">
        {previewUrl ? <img src={previewUrl} alt="Book cover preview" /> : <ImagePlus size={22} aria-hidden="true" />}
      </div>
      <div className="book-image-input-wrap">
        <label htmlFor="book-image">Book image{required ? ' *' : ''}</label>
        <input
          id="book-image"
          name="book-image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required={required && !currentImage && !imageUrl.trim() && !file}
          aria-describedby="book-image-help"
          onChange={(event) => {
            const selectedFile = event.currentTarget.files?.[0] ?? null
            onFileChange(selectedFile)
            if (selectedFile) onImageUrlChange('')
          }}
        />
        <label htmlFor="book-image-url">Or paste a hosted HTTPS image URL</label>
        <input
          id="book-image-url"
          name="book-image-url"
          type="url"
          value={imageUrl}
          maxLength={2048}
          placeholder="https://…"
          aria-describedby="book-image-help"
          onChange={(event) => {
            onImageUrlChange(event.currentTarget.value)
            if (event.currentTarget.value.trim()) onFileChange(null)
          }}
        />
        <p id="book-image-help">JPEG, PNG, WebP, or GIF · up to 5 MB. File uploads use ImgBB when configured.</p>
      </div>
    </div>
  )
}
