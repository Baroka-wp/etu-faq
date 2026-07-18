import sharp from 'sharp'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function normalizeUploadedImage(
  file: File,
  options: { maxBytes: number; width: number; height: number; fit: 'cover' | 'inside' }
): Promise<Buffer> {
  if (!(file instanceof File) || !ALLOWED_IMAGE_TYPES.has(file.type) || file.size <= 0 || file.size > options.maxBytes) {
    throw new Error('INVALID_IMAGE')
  }

  const source = Buffer.from(await file.arrayBuffer())
  const metadata = await sharp(source, { limitInputPixels: 40_000_000 }).metadata()
  if (!metadata.width || !metadata.height || !['jpeg', 'png', 'webp'].includes(metadata.format || '')) {
    throw new Error('INVALID_IMAGE')
  }

  return sharp(source, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize(options.width, options.height, { fit: options.fit, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer()
}
