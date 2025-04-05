import sharp from 'sharp'

export type ImageOptimizationOptions = {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {
    width: 100,
    height: 100,
    quality: 80,
    format: 'webp',
  },
): Promise<File> {
  const buffer = Buffer.from(await file.arrayBuffer())
  let sharpInstance = sharp(buffer)

  // Apply optimizations if specified
  if (options.width || options.height) {
    sharpInstance = sharpInstance.resize(options.width, options.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }

  // Set quality and format
  const format = options.format || 'webp'
  const quality = options.quality || 80

  // Convert to optimized format
  const optimizedBuffer = await sharpInstance
    .toFormat(format, { quality })
    .toBuffer()

  // log saved file size
  console.log(
    `After optimization: ${optimizedBuffer.length / 1024 / 1024}MB. Before optimization: ${
      buffer.length / 1024 / 1024
    }MB`,
  )

  // Create new File object with optimized image
  return new File([optimizedBuffer], `${file.name.split('.')[0]}.${format}`, {
    type: `image/${format}`,
  })
}
