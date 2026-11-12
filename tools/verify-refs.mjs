// npm run verify-refs: compares every reference that has a DOI (src/references.js) with its record
// at Crossref (the public DOI registry): authors' surnames and order, year, title, journal, volume,
// issue and pages. Prints each difference; exit code 1 if any. Only the DOIs are sent.
// Crossref data is not perfect (a missing issue, a title in capitals, a journal's old name): read
// the differences, then fix the reference or keep it if Crossref is the one that is wrong.

import { REFS } from '../src/references.js'

const norm = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const pages = (s) => String(s ?? '').replace(/[–—-]/g, '-')

let problems = 0
const ids = Object.entries(REFS).filter(([, r]) => r.doi)
for (const [key, r] of ids) {
  let msg
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(r.doi)}`, {
      headers: { 'User-Agent': 'StatsCool-reference-check/1.0' },
    })
    if (!res.ok) {
      console.log(`✗ ${key}: DOI ${r.doi} not found at Crossref (${res.status})`)
      problems++
      continue
    }
    msg = (await res.json()).message
  } catch (e) {
    console.log(`? ${key}: Crossref not reachable (${e.message})`)
    problems++
    continue
  }
  const diffs = []
  const ok = new Set(r.crossrefOk ?? [])
  const theirs = (msg.author ?? []).map((a) => a.family ?? a.name ?? '')
  const ours = r.authors.map(([f]) => f)
  if (theirs.length !== ours.length || theirs.some((f, i) => norm(f) !== norm(ours[i])))
    diffs.push(`authors: ours ${ours.join(', ')} | Crossref ${theirs.join(', ')}`)
  const year = (msg['published-print'] ?? msg['published'] ?? msg.issued)?.['date-parts']?.[0]?.[0]
  if (year !== r.year && !ok.has('year')) diffs.push(`year: ours ${r.year} | Crossref ${year}`)
  const title = [msg.title?.[0], msg.subtitle?.[0]].filter(Boolean).join(': ')
  if (norm(title) !== norm(r.title) && norm(msg.title?.[0]) !== norm(r.title) && !ok.has('title')) diffs.push(`title: ours “${r.title}” | Crossref “${title}”`)
  if (r.type === 'article') {
    const journal = msg['container-title']?.[0]
    if (norm(journal) !== norm(r.journal)) diffs.push(`journal: ours ${r.journal} | Crossref ${journal}`)
    if (msg.volume && String(msg.volume) !== String(r.volume)) diffs.push(`volume: ours ${r.volume} | Crossref ${msg.volume}`)
    if (msg.issue && norm(msg.issue) !== norm(r.issue)) diffs.push(`issue: ours ${r.issue ?? '—'} | Crossref ${msg.issue}`)
    const theirPages = msg['article-number'] ?? msg.page
    const ourPages = r.article ?? r.pages
    if (theirPages && pages(theirPages) !== pages(ourPages) && !ok.has('pages')) diffs.push(`pages: ours ${ourPages ?? '—'} | Crossref ${theirPages}`)
  }
  if (diffs.length) {
    problems++
    console.log(`✗ ${key}\n    ${diffs.join('\n    ')}`)
  } else console.log(`✓ ${key}`)
  await new Promise((ok) => setTimeout(ok, 120)) // be polite to the public API
}
const noDoi = Object.keys(REFS).filter((k) => !REFS[k].doi)
console.log(`\n${ids.length} DOI(s) checked, ${problems} with differences. Without a DOI (check by hand): ${noDoi.join(', ') || 'none'}.`)
process.exit(problems ? 1 : 0)
