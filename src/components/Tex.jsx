import katex from 'katex'
import 'katex/dist/katex.min.css'

// A math formula, typeset by KaTeX. `math` is LaTeX. \htmlClass{name}{…} is allowed, so a part of
// a formula can be styled from CSS (e.g. the active case of the median formula).
//   block : centred on its own line (display mode)
export default function Tex({ math, block = false, className = '' }) {
  const html = katex.renderToString(math, {
    displayMode: block,
    throwOnError: false,
    output: 'htmlAndMathml', // MathML for screen readers
    trust: (ctx) => ctx.command === '\\htmlClass',
    strict: (code) => (code === 'htmlExtension' ? 'ignore' : 'warn'),
  })
  return <span className={`tex${block ? ' is-block' : ''}${className ? ` ${className}` : ''}`} dangerouslySetInnerHTML={{ __html: html }} />
}

// A number written for LaTeX: French decimal commas need braces ("4{,}8"), or KaTeX adds a space.
export const texNum = (s) => String(s).replace(',', '{,}')
