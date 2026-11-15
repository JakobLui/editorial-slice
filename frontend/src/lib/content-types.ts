import { FileText, Mail, Mic, Video, type LucideIcon } from 'lucide-react'
import type { ContentType } from '@/api/generated/model'

/** An icon per content type, so the type reads without relying on the label alone. */
export const TYPE_ICONS: Record<ContentType, LucideIcon> = {
  article: FileText,
  newsletter: Mail,
  podcast: Mic,
  video: Video,
}
