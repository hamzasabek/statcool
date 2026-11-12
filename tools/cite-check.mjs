// Citation checks (run by `npm run check`, or alone: node tools/cite-check.mjs). Fails if:
//   - a text cites a key that is not in src/references.js;
//   - a reference in src/references.js is never cited;
//   - a text has a hand-typed citation ("(Miller, 1956)", "Miller (1956)", "Simon’s 1971 study")
//     instead of a token ([@miller1956], @miller1956). A line that must keep a year next to a name
//     (not a citation) carries the comment  // cite-ok  on it or on the line above
// Comments in the code are ignored. Prints what is wrong, exit code 1.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REFS } from '../src/references.js'
import { citeIndex, files, keysInFile, rel, stripComments } from './cites.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const src = join(root, 'src')
const problems = []

const used = new Set()
for (const f of files(src)) {
  if (/references\.js$|cite\.jsx$/.test(f)) continue
  for (const k of keysInFile(f)) {
    used.add(k)
    if (!REFS[k]) problems.push(`${rel(root, f)}: unknown reference @${k}`)
  }
  // hand-typed citations
  const lines = readFileSync(f, 'utf8').split('\n')
  stripComments(lines.join('\n'))
    .split('\n')
    .forEach((line, i) => {
      if (/cite-ok/.test(lines[i] ?? '') || /cite-ok/.test(lines[i - 1] ?? '')) return
      const Y = String.raw`(?:1[6-9]|20)\d{2}[a-z]?`
      const NAME = String.raw`\p{Lu}[\p{L}'’-]+(?:\s(?:&|and|et)\s\p{Lu}[\p{L}'’-]+|\set al\.)?`
      const pats = [
        new RegExp(String.raw`${NAME},?\s${Y}\b`, 'u'), // Miller, 1956 / Miller 1956
        new RegExp(String.raw`${NAME}\s\(${Y}\)`, 'u'), // Miller (1956)
        new RegExp(String.raw`\p{Lu}[\p{L}-]+[’']s\s${Y}\b`, 'u'), // Simon’s 1971 study
      ]
      const hit = pats.map((p) => line.match(p)).find(Boolean)
      if (hit) problems.push(`${rel(root, f)}:${i + 1}: hand-typed citation “${hit[0]}”: use a token like [@key]`)
    })
}
for (const k of Object.keys(REFS)) if (!used.has(k)) problems.push(`src/references.js: @${k} is never cited`)

const idx = citeIndex(root)
if (problems.length) {
  console.log(`Citations: ${problems.length} problem(s)`)
  problems.forEach((p) => console.log(`  ✗ ${p}`))
  process.exit(1)
}
console.log(`Citations: ${idx.all.length} references cited, all in src/references.js, none hand-typed.`)
