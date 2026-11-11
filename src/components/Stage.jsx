import { Link, useParams } from 'react-router'
import { useLang, useText } from '../i18n.jsx'
import { COMMON } from '../text.js'
import { findTopic } from '../topics/topics.js'

// Full-viewport layout for a learning page: everything fits on one screen, no scrolling.
//   head  : back link, title, optional steps
//   say   : one short line (the task)
//   bar   : optional toolbar above the main area
//   main  : grows to fill the remaining height (charts measure it)
//   foot  : feedback and actions
// `onGuide` adds a "? Guide" button in the head that replays the page's guided tour (Tour.jsx).
export function Stage({ title, steps, current, say, bar, foot, children, flowOnNarrow = false, className = '', onGuide }) {
  const tx = useText(COMMON)
  const { lang } = useLang()
  // A game goes back to its topic's page ("← Mean, median and mode").
  const topic = findTopic(useParams().slug)
  return (
    <article className={`stage${flowOnNarrow ? ' is-flow-narrow' : ''}${className ? ` ${className}` : ''}`}>
      <header className="stage-head">
        <div className="stage-title">
          <Link to={topic ? `/topics/${topic.slug}` : '/topics'} className="back-link">
            {topic ? tx.backTo(topic.text[lang].title) : tx.back}
          </Link>
          <h1>{title}</h1>
        </div>
        {(steps || onGuide) && (
          <div className="stage-head-side">
            {steps && <Steps steps={steps} current={current} />}
            {onGuide && (
              <button type="button" className="btn btn-ghost btn-sm guide-btn" onClick={onGuide} title={tx.guideLabel}>
                <span className="guide-icon" aria-hidden="true">
                  ?
                </span>
                {tx.guide}
              </button>
            )}
          </div>
        )}
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
    <ol className="steps" aria-label={tx.progress} data-tour="steps">
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
