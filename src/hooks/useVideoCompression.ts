'use client'

/**
 * Video Compression Hook
 * 
 * Uses ffmpeg.wasm (single-threaded version) to compress videos in the browser
 * No SharedArrayBuffer required!
 */

import { useState, useRef, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

export interface CompressionProgress {
  stage: 'loading' | 'compressing' | 'done' | 'error'
  percent: number
  message: string
}

export interface CompressionResult {
  success: boolean
  file?: File
  originalSize: number
  compressedSize?: number
  error?: string
}

export function useVideoCompression() {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState<CompressionProgress>({
    stage: 'loading',
    percent: 0,
    message: ''
  })
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const loadedRef = useRef(false)

  // Load FFmpeg WASM (single-threaded version - no SharedArrayBuffer needed)
  const loadFFmpeg = useCallback(async () => {
    if (loadedRef.current && ffmpegRef.current) {
      return ffmpegRef.current
    }

    setProgress({ stage: 'loading', percent: 0, message: 'Chargement du compresseur...' })
    
    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg

    // Set up progress handler
    ffmpeg.on('progress', ({ progress: p }) => {
      const percent = Math.min(Math.round(p * 100), 99)
      setProgress({
        stage: 'compressing',
        percent,
        message: `Compression en cours... ${percent}%`
      })
    })

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message)
    })

    try {
      // Use single-threaded core (no SharedArrayBuffer needed)
      const baseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm'
      
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      })
      
      loadedRef.current = true
      console.log('✅ FFmpeg loaded successfully (single-threaded)')
      return ffmpeg
    } catch (error: any) {
      console.error('❌ Failed to load FFmpeg:', error)
      throw new Error('Impossible de charger le compresseur vidéo: ' + error.message)
    }
  }, [])

  // Compress video
  const compressVideo = useCallback(async (
    file: File,
    options: {
      maxSizeMB?: number
      maxWidth?: number
      crf?: number
    } = {}
  ): Promise<CompressionResult> => {
    const { maxSizeMB = 45, maxWidth = 1280, crf = 28 } = options
    const originalSize = file.size
    const maxBytes = maxSizeMB * 1024 * 1024

    // Skip if already under size limit
    if (originalSize <= maxBytes) {
      console.log(`📹 Video already under ${maxSizeMB}MB, skipping compression`)
      return {
        success: true,
        file,
        originalSize,
        compressedSize: originalSize
      }
    }

    setIsCompressing(true)
    
    try {
      const ffmpeg = await loadFFmpeg()
      
      setProgress({ 
        stage: 'compressing', 
        percent: 0, 
        message: 'Préparation de la vidéo...' 
      })

      // Write input file
      const inputName = 'input.mp4'
      const outputName = 'output.mp4'
      
      const fileData = await fetchFile(file)
      await ffmpeg.writeFile(inputName, fileData)

      setProgress({ 
        stage: 'compressing', 
        percent: 5, 
        message: 'Compression en cours (cela peut prendre quelques minutes)...' 
      })

      // Run compression command - simpler options for better compatibility
      await ffmpeg.exec([
        '-i', inputName,
        '-vf', `scale=${maxWidth}:-2`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', crf.toString(),
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        outputName
      ])

      // Read output file
      const data = await ffmpeg.readFile(outputName) as Uint8Array
      const compressedBlob = new Blob([new Uint8Array(data)], { type: 'video/mp4' })
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.mp4'), {
        type: 'video/mp4'
      })

      // Cleanup
      try {
        await ffmpeg.deleteFile(inputName)
        await ffmpeg.deleteFile(outputName)
      } catch (e) {
        // Ignore cleanup errors
      }

      const compressedSize = compressedFile.size
      const reductionPercent = ((1 - compressedSize / originalSize) * 100).toFixed(1)

      console.log(`✅ Compressed: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressedSize / 1024 / 1024).toFixed(1)}MB (${reductionPercent}% reduction)`)

      setProgress({ 
        stage: 'done', 
        percent: 100, 
        message: `Compressé! ${(compressedSize / 1024 / 1024).toFixed(1)}MB` 
      })

      return {
        success: true,
        file: compressedFile,
        originalSize,
        compressedSize
      }

    } catch (error: any) {
      console.error('❌ Compression error:', error)
      setProgress({ 
        stage: 'error', 
        percent: 0, 
        message: error.message || 'Échec de la compression' 
      })
      
      return {
        success: false,
        originalSize,
        error: error.message || 'Compression failed'
      }
    } finally {
      setIsCompressing(false)
    }
  }, [loadFFmpeg])

  return {
    compressVideo,
    isCompressing,
    progress
  }
}
