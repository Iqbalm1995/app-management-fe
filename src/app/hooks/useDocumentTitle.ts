import { useEffect } from 'react'

export function useDocumentTitle(pageName?: string) {
  useEffect(() => {
    const title = pageName 
      ? `KOBRA - Project Management Apps | ${pageName}`
      : 'KOBRA - Project Management Apps'
    
    document.title = title
    
    // Prevent Next.js dev server from overriding title
    const observer = new MutationObserver(() => {
      if (document.title !== title) {
        document.title = title
      }
    })
    
    observer.observe(document.querySelector('title') || document.head, {
      childList: true,
      subtree: true
    })
    
    return () => observer.disconnect()
  }, [pageName])
}
