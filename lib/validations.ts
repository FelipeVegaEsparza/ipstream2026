import { z } from 'zod'

// Validación para datos básicos
export const basicDataSchema = z.object({
  projectName: z.string().min(1, 'El nombre del proyecto es requerido'),
  projectDescription: z.string().min(1, 'La descripción es requerida'),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  radioStreamingUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  videoStreamingUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Validación para redes sociales
export const socialNetworksSchema = z.object({
  facebook: z.string().url('URL inválida').optional().or(z.literal('')),
  youtube: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().url('URL inválida').optional().or(z.literal('')),
  tiktok: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  x: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Validación para programas
export const programSchema = z.object({
  name: z.string().min(1, 'El nombre del programa es requerido'),
  imageUrl: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  weekDays: z.array(z.string()).min(1, 'Selecciona al menos un día'),
})

// Validación para noticias
export const newsSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  shortText: z.string().min(1, 'El texto corto es requerido'),
  longText: z.string().min(1, 'El texto largo es requerido'),
  imageUrl: z.string().optional(),
})

// Validación para ranking de videos
export const rankingVideoSchema = z.object({
  name: z.string().min(1, 'El nombre del video es requerido'),
  videoUrl: z.string().url('URL del video inválida'),
  description: z.string().min(1, 'La descripción es requerida'),
})

// Validación para auspiciadores
export const sponsorSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  facebook: z.string().url('URL inválida').optional().or(z.literal('')),
  youtube: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().url('URL inválida').optional().or(z.literal('')),
  tiktok: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  x: z.string().url('URL inválida').optional().or(z.literal('')),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Validación para promociones
export const promotionSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  imageUrl: z.string().optional(),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Validación para autenticación
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type BasicDataInput = z.infer<typeof basicDataSchema>
export type SocialNetworksInput = z.infer<typeof socialNetworksSchema>
export type ProgramInput = z.infer<typeof programSchema>
export type NewsInput = z.infer<typeof newsSchema>
export type RankingVideoInput = z.infer<typeof rankingVideoSchema>
export type SponsorInput = z.infer<typeof sponsorSchema>
export type PromotionInput = z.infer<typeof promotionSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>