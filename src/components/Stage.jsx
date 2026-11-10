import { Link } from 'react-router'

// Full-viewport layout for a learning page: everything fits on one screen, no scrolling.
//   head  : back link, title, optional steps
//   say   : one short line (the task)
//   bar   : optional toolbar above the main area
//   main  : grows to fill the remaining height (charts measure it)
//   foot  : feedback and actions
export function Stage({ title, steps, current, say, bar, foot, children, flowOnNarrow = false }) {
  return (
    <article className={`stage${flowOnNarrow ? ' is-flow-narrow' : ''}`}>
      <header className="stage-head">
        <div className="stage-title">
          <Link to="/topics" className="back-link">
            ← Topics
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
  return (
    <ol className="steps" aria-label="Progress">
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
