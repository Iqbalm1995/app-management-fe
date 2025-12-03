import type { Metadata } from 'next'

export function generateMetadata(pageName?: string): Metadata {
  const title = pageName
    ? `bjb aPPs - Project Management Apps | ${pageName}`
    : 'bjb aPPs - Project Management Apps'

  return {
    title,
    description: 'bjb aPPs Project Management System - Comprehensive project management solution',
    icons: {
      icon: '/img/favicon-bjb.png',
      shortcut: '/img/favicon-bjb.png',
      apple: '/img/favicon-bjb.png',
    },
  }
}

export const defaultMetadata: Metadata = generateMetadata()
