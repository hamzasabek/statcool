// "A neuron adds up": each synapse gives the neuron a small push, +1 (excitatory) or −1
// (inhibitory), at random (50/50, independent). The neuron adds them up. One trial = one sum = one dot.
// With 1 synapse the sum is −1 or +1 (two bars); with 2 it is −2, 0 or +2 (a triangle: 0 happens two
// ways); with many it is a bell (the central limit theorem): the sum of many small independent
// pushes is close to a normal distribution, with mean 0 and SD √k.

export const SYNAPSES = [2, 4, 16, 64] // the choices of step 2 (step 1 uses 1)
export const SMALL = [1, 2, 4, 16, 64] // the small multiples of step 3
export const MIN_FIRST = 20 // trials with 1 synapse before step 2
export const MIN_BELL = 50 // trials with 16 or 64 synapses before step 3
export const MAX_TRIALS = 400 // per number of synapses (the chart stays readable)
export const SIM = 3000 // trials per small multiple in step 3

// One trial: the k pushes and their sum.
export function fire(k) {
  const inputs = Array.from({ length: k }, () => (Math.random() < 0.5 ? 1 : -1))
  return { inputs, sum: inputs.reduce((s, x) => s + x, 0) }
}

// The axis for k synapses: column centres from −K to K in steps of 2 (the sums of k pushes have the
// parity of k), wide enough for nearly every sum (about ±3.5 SD).
export function axis(k) {
  let K = Math.max(k <= 4 ? k + 2 : 0, Math.ceil(3.5 * Math.sqrt(k)))
  if ((K - k) % 2) K += 1
  const step = K <= 8 ? 2 : K <= 16 ? 4 : 8
  const ticks = []
  if (k % 2) for (let t = -K; t <= K; t += 2) ticks.push(t) // odd sums: every column
  else for (let t = -Math.floor(K / step) * step; t <= K; t += step) ticks.push(t)
  return { domain: [-K, K], bin: 2, ticks }
}

// The chance that every one of k synapses pushes the same way (the sum is +k): 1 in 2^k (a BigInt:
// 2^64 is too big for an exact Number).
export const allSame = (k) => 2n ** BigInt(k)
