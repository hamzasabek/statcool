// A small neuron for "A neuron adds up": the cell body in the middle with the sum of the last trial,
// and k synapses on a ring around it, each joined to the body by a dendrite. After a trial each
// synapse shows its push: + (excitatory, blue) or − (inhibitory, red). `trial` changes on every
// fire, so the synapses flash again.
//   k: number of synapses   last: { inputs, sum, id } or null   fmtSum(v) → "+4"

export default function NeuronPic({ k, last, fmtSum, aria }) {
  const R = 40 // the ring of synapses (viewBox −50…50)
  const r = k <= 4 ? 5 : k <= 16 ? 3.6 : 2.1
  const inputs = last && last.inputs.length === k ? last.inputs : null
  const pts = Array.from({ length: k }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / k + (k === 2 ? Math.PI / 2 : 0)
    return [R * Math.cos(a), R * Math.sin(a)]
  })
  return (
    <svg className="nr-pic" viewBox="-50 -50 100 100" role="img" aria-label={aria}>
      {pts.map(([x, y], i) => (
        <line key={`d${i}`} className="nr-dendrite" x1={x * 0.92} y1={y * 0.92} x2={x * 0.32} y2={y * 0.32} />
      ))}
      <circle className="nr-soma" r="15" />
      {pts.map(([x, y], i) => {
        const v = inputs?.[i]
        return (
          <circle
            key={`s${i}-${last?.id ?? 0}`}
            className={`nr-syn${v === 1 ? ' is-exc' : v === -1 ? ' is-inh' : ''}`}
            cx={x}
            cy={y}
            r={r}
            style={inputs ? { animationDelay: `${Math.min(300, i * (300 / k))}ms` } : undefined}
          />
        )
      })}
      {k <= 4 &&
        inputs &&
        pts.map(([x, y], i) => (
          <text key={`t${i}-${last.id}`} className="nr-sign" x={x} y={y + 2.3} textAnchor="middle">
            {inputs[i] > 0 ? '+' : '−'}
          </text>
        ))}
      <text key={`sum-${last?.id ?? 0}`} className="nr-sum" y="4.5" textAnchor="middle">
        {inputs ? fmtSum(last.sum) : '·'}
      </text>
    </svg>
  )
}
