import { useEffect, useState } from 'react'
import { num, useText } from '../../i18n.jsx'
import { SDCALC } from './sdCalcText.js'

// "Why n − 1?" (Live calculation of topic 02). The dots on the line become a whole population, with
// its true variance σ² (sum of squares ÷ N). Random samples of size k are drawn from it (with
// replacement, like independent measurements). For each sample, the variance is computed twice:
// dividing by k, and dividing by k − 1. Their averages over many samples are drawn as bars next to
// σ²: dividing by k comes out too small on average (by the factor (k − 1)/k), dividing by k − 1
// comes out right. Why: each sample's deviations are measured from its own mean, which sits closer to
// its own points than the true mean μ does.

const SIZES = [2, 3, 5]

const variance = (v, d) => {
  const m = v.reduce((s, x) => s + x, 0) / v.length
  return v.reduce((s, x) => s + (x - m) ** 2, 0) / d
}
const f2 = (v) => num(v, Math.abs(v) >= 10 ? 1 : 2)

export default function WhyN1({ values }) {
  const tx = useText(SDCALC)
  const [k, setK] = useState(3)
  const [acc, setAcc] = useState({ count: 0, byN: 0, byN1: 0, last: null })
  const key = `${values.join(',')}|${k}`
  // A new population or sample size starts the count again.
  useEffect(() => setAcc({ count: 0, byN: 0, byN1: 0, last: null }), [key])

  const N = values.length
  const sigma2 = N ? variance(values, N) : 0
  if (N < 2 || sigma2 === 0) return <p className="cl-note why-n1-empty">{tx.whyNeed}</p>

  function drawSamples(times) {
    setAcc((a) => {
      let { count, byN, byN1, last } = a
      for (let i = 0; i < times; i++) {
        const s = Array.from({ length: k }, () => values[Math.floor(Math.random() * N)])
        byN += variance(s, k)
        byN1 += variance(s, k - 1)
        count++
        last = s
      }
      return { count, byN, byN1, last }
    })
  }

  const avgN = acc.count ? acc.byN / acc.count : 0
  const avgN1 = acc.count ? acc.byN1 / acc.count : 0
  const top = Math.max(sigma2 * 1.35, avgN, avgN1)
  const bars = [
    { key: 'true', label: tx.whyTrue, v: sigma2, show: true },
    { key: 'n', label: tx.whyByN(k), v: avgN, show: acc.count > 0 },
    { key: 'n1', label: tx.whyByN1(k, k - 1), v: avgN1, show: acc.count > 0 },
  ]

  return (
    <div className="why why-n1" data-tour="why">
      <div className="why-n1-controls">
        <div className="segmented" role="group" aria-label={tx.whySizeLabel}>
          {SIZES.map((s) => (
            <button key={s} type="button" className={k === s ? 'is-active' : ''} aria-pressed={k === s} onClick={() => setK(s)}>
              {tx.whySize(s)}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => drawSamples(1)}>
          {tx.whyDraw1}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => drawSamples(100)}>
          {tx.whyDraw100}
        </button>
        <span className="why-n1-count">{tx.whyCount(acc.count)}</span>
      </div>
      {acc.last && (
        <p className="why-n1-last">
          {tx.whyLast}{' '}
          {acc.last.map((v, i) => (
            <span key={i} className="cl-chip">
              {num(v)}
            </span>
          ))}{' '}
          <span className="why-n1-pair">
            ÷ {k} → <strong>{f2(variance(acc.last, k))}</strong> · ÷ {k - 1} → <strong>{f2(variance(acc.last, k - 1))}</strong>
          </span>
        </p>
      )}
      <div className="why-n1-bars" role="img" aria-label={tx.whyBarsLabel}>
        {bars.map((b) => (
          <div key={b.key} className={`why-n1-row is-${b.key}`}>
            <span className="why-n1-label">{b.label}</span>
            <span className="why-n1-track">
              {b.show && <span className="why-n1-bar" style={{ width: `${(b.v / top) * 100}%` }} />}
              <span className="why-n1-target" style={{ left: `${(sigma2 / top) * 100}%` }} />
            </span>
            <strong className="why-n1-value">{b.show ? f2(b.v) : '–'}</strong>
          </div>
        ))}
      </div>
      {acc.count >= 50 && <p className="why-n1-verdict">{tx.whyVerdict(f2(avgN / sigma2), num((k - 1) / k, 2), f2(avgN1 / sigma2))}</p>}
    </div>
  )
}
