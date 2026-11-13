// Page checker for StatsCool, for any developer or AI assistant (Claude, Gemini, …).
// Builds the site, serves it, opens each page in headless Chrome at several screen sizes and in
// both languages, and reports for each one:
//   - fits     : the page height equals the window height (one screen), or how many px it scrolls
//   - overflow : the page is wider than the screen (horizontal scroll: always a bug)
//   - errors   : JavaScript errors and console errors / warnings
//   - katex    : formulas KaTeX could not render
// Guided tours are skipped (marked as seen) so they do not hide the page.
//
// Usage:
//   npm run check                                  every page (crawled from /topics)
//   npm run check -- /topics/variance-sd/quiz      only these routes (hash routes, without "#")
//   npm run check -- --sizes=1366x768,390x844 --lang=en,fr --shots --no-build
//     --shots    save a screenshot of each page in scratch/check/ (gitignored)
//     --no-build use the existing dist/
// Chrome: set CHROME=/path/to/chrome if it is not found. Needs Node 22+ (built-in WebSocket).

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { build, preview } from 'vite'

const args = process.argv.slice(2)
const opt = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def
const flag = (name) => args.includes(`--${name}`)
const sizes = opt('sizes', '1366x768,390x844')
  .split(',')
  .map((s) => s.split('x').map(Number))
const langs = opt('lang', 'en,fr').split(',')
const shots = flag('shots')
// A route can be written "topics/x/y", "/topics/x/y" or "#/topics/x/y" (Git Bash turns a leading
// "/" into a Windows path: that is undone here too).
const norm = (r) =>
  '/' +
  r
    .replace(/^.*?#/, '')
    .replace(/^[A-Za-z]:[\\/].*?[\\/]Git[\\/]/, '')
    .replace(/^\/+/, '')
let routes = args.filter((a) => !a.startsWith('--')).map(norm)
const PORT = 4179
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const CHROMES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)
const chromePath = CHROMES.find((p) => existsSync(p))
if (!chromePath) {
  console.error('Chrome not found: set CHROME=/path/to/chrome')
  process.exit(2)
}

if (!flag('no-build')) {
  console.log('Building…')
  await build({ logLevel: 'error' })
}
// Citations first (fast, no browser): unknown keys, unused references, hand-typed citations.
{
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync(process.execPath, ['tools/cite-check.mjs'], { stdio: 'inherit' })
  if (r.status) {
    console.log('Fix the citations above (see src/references.js).')
    process.exit(1)
  }
}
const server = await preview({ preview: { port: PORT, strictPort: true }, logLevel: 'error' })
const base = `http://localhost:${PORT}/`

// ---- a tiny Chrome DevTools Protocol client ----
const profile = join(tmpdir(), `statscool-check-${process.pid}`)
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9399', `--user-data-dir=${profile}`, '--no-first-run', '--autoplay-policy=no-user-gesture-required', 'about:blank'])
let tabs
for (let i = 0; i < 60 && !tabs; i++) {
  try {
    tabs = await (await fetch('http://127.0.0.1:9399/json')).json()
  } catch {
    await sleep(250)
  }
}
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let nextId = 0
const pending = new Map()
let problems = []
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m)
    pending.delete(m.id)
  }
  if (m.method === 'Runtime.exceptionThrown') problems.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) problems.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200))
})
const send = (method, params = {}) => new Promise((r) => { const id = ++nextId; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })) })
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.result?.value
await send('Runtime.enable')
await send('Page.enable')
// Skip every guided tour: any "statscool-tour-…" key reads as "done".
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `(() => { const get = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { return String(k).startsWith('statscool-tour-') ? 'done' : get.call(this, k) } })()`,
})

async function open(route, w, h, lang) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 })
  await send('Page.navigate', { url: base })
  await sleep(300)
  await ev(`localStorage.setItem('statscool-lang', '${lang}')`)
  // A hash-only change does not reload the page (the app would keep the language it read at load
  // time), and a reload right after it can race and reload the previous route: go through a blank
  // page so the route is always a fresh load that reads the language just stored.
  await send('Page.navigate', { url: 'about:blank' })
  await sleep(80)
  await send('Page.navigate', { url: `${base}#${route}` })
  await sleep(1400)
}

// No routes given: crawl the topics page, then each topic page, for every link.
if (!routes.length) {
  await open('/topics', 1366, 768, 'en')
  const topics = await ev(`[...new Set([...document.querySelectorAll('a[href^="#/topics/"]')].map((a) => a.getAttribute('href').slice(1)))]`)
  const all = new Set(['/', '/topics', '/about', '/references', ...topics])
  for (const t of topics) {
    await open(t, 1366, 768, 'en')
    const links = await ev(`[...document.querySelectorAll('a[href^="#/topics/"]')].map((a) => a.getAttribute('href').slice(1))`)
    links.forEach((l) => all.add(l))
  }
  routes = [...all]
}

if (shots) {
  rmSync('scratch/check', { recursive: true, force: true })
  mkdirSync('scratch/check', { recursive: true })
}
let bad = 0
console.log(`\n${routes.length} page(s) × ${sizes.length} size(s) × ${langs.length} language(s)\n`)
for (const route of routes) {
  for (const [w, h] of sizes) {
    for (const lang of langs) {
      problems = []
      await open(route, w, h, lang)
      const r = await ev(`({ pageH: document.documentElement.scrollHeight, h: innerHeight, wide: document.documentElement.scrollWidth > innerWidth + 1, katex: document.querySelectorAll('.katex-error').length, cite: (document.body.innerText.match(/\\[@|(?<![\\w.@])@[a-z][a-z-]*\\d{4}|\\[object Object\\]/) || [''])[0], title: document.querySelector('h1')?.textContent ?? '' })`)
      const missing = /^(Page not found|Page introuvable)$/.test(r.title)
      const scroll = r.pageH - r.h
      const fail = missing || r.wide || problems.length || r.katex || r.cite
      if (fail) bad++
      const parts = [
        fail ? '✗' : '✓',
        `${route}`.padEnd(42),
        `${w}×${h} ${lang}`.padEnd(13),
        missing ? 'PAGE NOT FOUND' : scroll > 1 ? `scrolls +${scroll}px` : 'one screen',
        r.wide ? '· WIDER THAN THE SCREEN' : '',
        r.katex ? `· ${r.katex} KaTeX error(s)` : '',
        r.cite ? `· raw citation or [object Object] on the page: “${r.cite}”` : '',
        problems.length ? `· ${problems.length} console error(s): ${problems[0]}` : '',
      ]
      console.log(parts.filter(Boolean).join('  '))
      if (shots) {
        const shot = await send('Page.captureScreenshot', { format: 'png' })
        const name = `${route.replace(/\W+/g, '_').replace(/^_|_$/g, '') || 'home'}-${w}-${lang}.png`
        writeFileSync(join('scratch/check', name), Buffer.from(shot.result.data, 'base64'))
      }
    }
  }
}
console.log(`\n${bad ? `${bad} problem(s)` : 'No problems'}. "scrolls" is fine on phones; on desktop, games should fit one screen.${shots ? ' Screenshots: scratch/check/' : ''}`)
chrome.kill()
await server.close()
try {
  rmSync(profile, { recursive: true, force: true })
} catch {
  /* Chrome may still hold the folder for a moment */
}
process.exit(bad ? 1 : 0)
