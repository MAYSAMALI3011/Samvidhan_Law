import { useEffect } from 'react'

interface Meta {
  title: string
  description: string
  path?: string
}

export function usePageMeta({ title, description, path }: Meta): void {
  useEffect(() => {
    document.title = `${title} · Samvidhan`
    const set = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    set('description', description)
    set('og:title', `${title} · Samvidhan`, 'property')
    set('og:description', description, 'property')
    set('og:type', 'website', 'property')
    const canonicalPath = path ?? window.location.pathname
    const url = `${window.location.origin}${canonicalPath}`
    set('og:url', url, 'property')
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [title, description, path])
}
