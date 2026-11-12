import { Reference, byApaOrder } from '../cite.jsx'
import { useLang } from '../i18n.jsx'

// An APA 7 reference list: alphabetical by first author, hanging indent, one anchor per entry
// (#ref-<key>, the target of the citation bubbles' "All references" link).
export default function RefList({ keys }) {
  const { lang } = useLang()
  const sorted = [...new Set(keys)].sort(byApaOrder)
  return (
    <ol className="ref-list">
      {sorted.map((k) => (
        <li key={k} id={`ref-${k}`}>
          <Reference id={k} lang={lang} />
        </li>
      ))}
    </ol>
  )
}
