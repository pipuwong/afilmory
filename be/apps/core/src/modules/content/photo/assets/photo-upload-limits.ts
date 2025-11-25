import { BizException, ErrorCode } from 'core/errors'
import type { Context } from 'hono'

import type { UploadAssetInput } from './photo-asset.types'

export const ABSOLUTE_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
export const ABSOLUTE_MAX_REQUEST_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB
export const MAX_UPLOAD_FILES_PER_BATCH = 32
export const MAX_TEXT_FIELDS_PER_REQUEST = 64

const PHOTO_UPLOAD_LIMIT_CONTEXT_KEY = 'photo.upload.limits'
const PHOTO_UPLOAD_INPUT_CONTEXT_KEY = 'photo.upload.inputs'

export type PhotoUploadLimits = {
  fileSizeLimitBytes: number
  totalSizeLimitBytes: number
}

export function resolveFileSizeLimitBytes(limitFromPlan: number | null): number {
  const resolved = limitFromPlan ?? ABSOLUTE_MAX_FILE_SIZE_BYTES
  return Math.min(Math.max(resolved, 1), ABSOLUTE_MAX_FILE_SIZE_BYTES)
}

export function resolveBatchSizeLimitBytes(fileSizeLimitBytes: number): number {
  const normalizedFileLimit = Math.max(fileSizeLimitBytes, 1)
  const theoreticalBatchLimit = normalizedFileLimit * MAX_UPLOAD_FILES_PER_BATCH
  return Math.min(theoreticalBatchLimit, ABSOLUTE_MAX_REQUEST_SIZE_BYTES)
}

export function setPhotoUploadLimitsOnContext(context: Context, limits: PhotoUploadLimits): void {
  context.set(PHOTO_UPLOAD_LIMIT_CONTEXT_KEY, limits)
}

export function getPhotoUploadLimitsFromContext(context: Context): PhotoUploadLimits {
  const limits = context.get(PHOTO_UPLOAD_LIMIT_CONTEXT_KEY)

  if (!limits) {
    throw new BizException(ErrorCode.COMMON_INTERNAL_SERVER_ERROR, { message: '上传限制校验未初始化' })
  }

  return limits
}

export function setPhotoUploadInputsOnContext(context: Context, inputs: UploadAssetInput[]): void {
  context.set(PHOTO_UPLOAD_INPUT_CONTEXT_KEY, inputs)
}

export function getPhotoUploadInputsFromContext(context: Context): UploadAssetInput[] {
  const inputs = context.get(PHOTO_UPLOAD_INPUT_CONTEXT_KEY)

  if (!inputs) {
    throw new BizException(ErrorCode.COMMON_INTERNAL_SERVER_ERROR, { message: '上传解析结果未初始化' })
  }

  return inputs
}
