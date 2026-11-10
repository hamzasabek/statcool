import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Renders a LaTeX formula with KaTeX. `math` must come from our own code, never from user input.
export default function Tex({ math, display = false, className }) {
  const html = useMemo(
    () => katex.renderToString(math, { displayMode: display, throwOnError: false }),
    [math, display],
  )
  const Tag = display ? 'div' : 'span'
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
