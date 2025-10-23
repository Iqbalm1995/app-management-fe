import type { Metadata } from 'next'

export function generateMetadata(pageName?: string): Metadata {
  const title = pageName 
    ? `KOBRA - Project Management Apps | ${pageName}`
    : 'KOBRA - Project Management Apps'
  
  return {
    title,
    description: 'KOBRA Project Management System - Comprehensive project management solution',
    icons: {
      icon: '/img/favicon-bjb.png',
      shortcut: '/img/favicon-bjb.png',
      apple: '/img/favicon-bjb.png',
    },
  }
}

export const defaultMetadata: Metadata = generateMetadata()
