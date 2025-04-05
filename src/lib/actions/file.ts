'use server'

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { unstable_cache } from 'next/cache'

const s3Client = new S3Client({
  region: 'us-east-1', // Digital Ocean Spaces uses this region
  endpoint: `https://${process.env.STORAGE_ENDPOINT}`,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
  },
})

export type FileKey = string

export async function uploadFile(file: File): Promise<FileKey> {
  const key = `${Date.now()}-${file.name}`

  const command = new PutObjectCommand({
    Bucket: process.env.STORAGE_BUCKET!,
    Key: key,
    ContentType: file.type,
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  return key
}

export async function getSignedFileUrl(key: FileKey): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET!,
    Key: key,
  })
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return signedUrl.replace(
    `${process.env.STORAGE_ENDPOINT}`,
    `${process.env.STORAGE_ENDPOINT_CDN}`,
  )
}

export const cachedGetSignedFileUrl = async (key: FileKey) =>
  unstable_cache(getSignedFileUrl, ['getSignedFileUrl'], {
    tags: [`getSignedFileUrl-${key}`],
    revalidate: 3600,
  })(key)
