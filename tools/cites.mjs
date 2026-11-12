// Shared by vite.config.js (the `virtual:cites` module: which references each topic and page uses)
// and tools/cite-check.mjs (the checks). Reads the sources as text and finds citation tokens.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const KEY = String.raw`[a-z][a-z-]*\d{4}[a-z]?`
const TOKEN = new RegExp(String.raw`(?:\[[^\[\]]*?|(?<![\w@.]))-?@(${KEY})`, 'g')

export function files(dir) {
  const out = []
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) out.push(...files(p))
    else if (/\.(js|jsx)$/.test(f)) out.push(p)
  }
  return out
}

// Source without its comments (// … and /* … */), so a key in a comment is not a citation.
export const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')

export function keysInFile(path) {
  const src = stripComments(readFileSync(path, 'utf8'))
  return [...new Set([...src.matchAll(TOKEN)].map((m) => m[1]))]
}

// { topics: { slug: [keys] }, about: [keys], games: { 'slug/game': [keys] } (from topics.js), all: [keys] }
export function citeIndex(root) {
  const src = join(root, 'src')
  const topicsDir = join(src, 'topics')
  const topics = {}
  for (const d of readdirSync(topicsDir)) {
    const p = join(topicsDir, d)
    if (!statSync(p).isDirectory()) continue
    topics[d] = [...new Set(files(p).flatMap(keysInFile))]
  }
  const about = keysInFile(join(src, 'pages', 'text.js'))
  const all = [...new Set(files(src).filter((f) => !f.endsWith('references.js') && !f.endsWith('cite.jsx')).flatMap(keysInFile))]
  return { topics, about, all }
}

export const rel = (root, p) => relative(root, p).replaceAll('\\', '/')
