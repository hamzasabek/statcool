import { useEffect } from 'react'
import { useLocation } from 'react-router'
import cites from 'virtual:cites'
import RefList from '../components/RefList.jsx'
import { useText } from '../i18n.jsx'
import { REFS_PAGE } from './text.js'

// /references: every work cited on the site, in APA 7 (the citation bubbles link here, to
// #ref-<key>). The list is built from the sources at build time (virtual:cites).
export default function References() {
  const tx = useText(REFS_PAGE)
  const { hash } = useLocation()

  // Coming from a citation: scroll to that reference (after App's scroll-to-top).
  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' }), 60)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <article className="about prose">
      <h1>{tx.title}</h1>
      <p className="lead">{tx.lead}</p>
      <RefList keys={cites.all} />
    </article>
  )
}
