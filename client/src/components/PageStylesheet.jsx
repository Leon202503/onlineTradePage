import { useEffect } from 'react'

export default function PageStylesheet({ href, bodyClass }) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.append(link)
    if (bodyClass) document.body.classList.add(bodyClass)
    return () => {
      link.remove()
      if (bodyClass) document.body.classList.remove(bodyClass)
    }
  }, [href, bodyClass])
  return null
}
