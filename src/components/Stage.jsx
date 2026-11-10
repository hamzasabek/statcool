import { Link } from 'react-router'
import { useText } from '../i18n.jsx'
import { COMMON } from '../text.js'

// Full-viewport layout for a learning page: everything fits on one screen, no scrolling.
//   head  : back link, title, optional steps
//   say   : one short line (the task)
//   bar   : optional toolbar above the main area
//   main  : grows to fill the remaining height (charts measure it)
//   foot  : feedback and actions
export function Stage({ title, steps, current, say, bar, foot, children, flowOnNarrow = false, className = '' }) {
  const tx = useText(COMMON)
  return (
    <article className={`stage${flowOnNarrow ? ' is-flow-narrow' : ''}${className ? ` ${className}` : ''}`}>
      <header className="stage-head">
        <div className="stage-title">
          <Link to="/" className="back-link">
            {tx.back}
          </Link>
          <h1>{title}</h1>
        </div>
        {steps && <Steps steps={steps} current={current} />}
      </header>
      {say && <div className="stage-say">{say}</div>}
      {bar && <div className="stage-bar">{bar}</div>}
      <div className="stage-main">{children}</div>
      {foot && <footer className="stage-foot">{foot}</footer>}
    </article>
  )
}

export function Steps({ steps, current }) {
  const tx = useText(COMMON)
  return (
    <ol className="steps" aria-label={tx.progress}>
      {steps.map((s, i) => (
        <li
          key={s}
          className={i === current ? 'is-current' : i < current ? 'is-done' : ''}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="step-num">{i < current ? '✓' : i + 1}</span>
          <span className="step-label">{s}</span>
        </li>
      ))}
    </ol>
  )
}
