import { useText } from '../../i18n.jsx'
import Tex from '../../components/Tex.jsx'
import { RECAP } from './recapText.js'

// Topic 01's recap sheet, on the topic page after the games: the definitions with their formulas,
// which centre for which kind of data (Stevens's levels of measurement), when to prefer which, the
// pitfalls, and how to report them (APA style). Meant to be read again before an exam.

export default function MeanRecap() {
  const tx = useText(RECAP)
  return (
    <section className="rc" aria-labelledby="recap-title">
      <h2 id="recap-title" className="rc-title">
        {tx.title} <small>{tx.subtitle}</small>
      </h2>

      <div className="rc-grid">
        <article className="rc-card is-mean">
          <h3>{tx.meanTitle}</h3>
          <Tex math={String.raw`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i`} block />
          <p>{tx.meanText}</p>
        </article>
        <article className="rc-card is-median">
          <h3>{tx.medianTitle}</h3>
          <Tex
            math={String.raw`\tilde{x} = \begin{cases} x_{\left(\frac{n+1}{2}\right)} & \text{${tx.odd}} \\[3pt] \tfrac{1}{2}\left(x_{\left(\frac{n}{2}\right)} + x_{\left(\frac{n}{2}+1\right)}\right) & \text{${tx.even}} \end{cases}`}
            block
          />
          <p>{tx.medianText}</p>
        </article>
        <article className="rc-card is-mode">
          <h3>{tx.modeTitle}</h3>
          <Tex math={String.raw`\mathrm{Mo} = \text{${tx.modeArg}}\ x\ \text{${tx.modeMax}}\ f(x)`} block />
          <p>{tx.modeText}</p>
        </article>
      </div>

      <h3 className="rc-sub">{tx.scalesTitle}</h3>
      <div className="rc-table-wrap">
        <table className="rc-table">
          <thead>
            <tr>
              <th scope="col">{tx.colScale}</th>
              <th scope="col">{tx.colExamples}</th>
              <th scope="col">{tx.colCentres}</th>
            </tr>
          </thead>
          <tbody>
            {tx.scales.map((r) => (
              <tr key={r.name}>
                <th scope="row">
                  {r.name}
                  <small>{r.what}</small>
                </th>
                <td>{r.examples}</td>
                <td>{r.centres}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rc-note">{tx.scalesNote}</p>

      <div className="rc-cols">
        <div>
          <h3 className="rc-sub">{tx.whichTitle}</h3>
          <ul className="rc-list">
            {tx.which.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="rc-sub">{tx.pitfallsTitle}</h3>
          <ul className="rc-list is-warn">
            {tx.pitfalls.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="rc-sub">{tx.reportTitle}</h3>
      <p className="rc-report">
        <span>{tx.reportExample}</span>
      </p>
      <p className="rc-note">{tx.reportNote}</p>
    </section>
  )
}
