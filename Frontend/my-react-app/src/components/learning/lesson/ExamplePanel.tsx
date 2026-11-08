import { Scale } from 'lucide-react'

export interface CitizenExampleData {
  title: string
  situation: string
  law: string
  action: string
  isIllustrative?: boolean
}

export interface ExamplePanelProps {
  example: CitizenExampleData
  className?: string
}

export function ExamplePanel({ example, className = '' }: ExamplePanelProps) {
  return (
    <section className={`lesson-example-panel ${className}`} aria-labelledby="example-panel-title">
      <div className="example-panel-header">
        <div className="example-badge">
          <Scale size={14} className="text-gold" aria-hidden="true" />
          <span>
            {example.isIllustrative !== false
              ? 'EVERYDAY CITIZEN EXAMPLE (ILLUSTRATIVE SCENARIO)'
              : 'EVERYDAY CITIZEN EXAMPLE'}
          </span>
        </div>
        <h3 id="example-panel-title" className="example-panel-title">
          {example.title}
        </h3>
      </div>

      <div className="example-columns-grid">
        {/* Column 1: Situation */}
        <div className="example-column column-situation">
          <div className="column-header">
            <span className="column-icon-dot situation-dot" />
            <span className="column-tag">What Happened</span>
          </div>
          <p className="column-content">{example.situation}</p>
        </div>

        {/* Column 2: What the law says */}
        <div className="example-column column-law">
          <div className="column-header">
            <span className="column-icon-dot law-dot" />
            <span className="column-tag">What The Law Says</span>
          </div>
          <p className="column-content">{example.law}</p>
        </div>

        {/* Column 3: What you can do */}
        <div className="example-column column-action">
          <div className="column-header">
            <span className="column-icon-dot action-dot" />
            <span className="column-tag">What You Can Do</span>
          </div>
          <p className="column-content">{example.action}</p>
        </div>
      </div>
    </section>
  )
}
