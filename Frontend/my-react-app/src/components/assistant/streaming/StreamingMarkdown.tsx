import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Landmark } from 'lucide-react'

interface StreamingMarkdownProps {
  content: string
}

export function StreamingMarkdown({ content }: StreamingMarkdownProps) {
  // Parse lines and formatted blocks progressively
  const formattedBlocks = useMemo(() => {
    const lines = content.split('\n')
    const blocks: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []

    const renderInline = (text: string) => {
      // 1. Convert bold **text**
      const parts = text.split(/(\*\*.*?\*\*)/g)
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          )
        }
        // 2. Convert *italic*
        const italicParts = part.split(/(\*.*?\*)/g)
        return italicParts.map((sub, sIdx) => {
          if (sub.startsWith('*') && sub.endsWith('*') && sub.length > 2) {
            return (
              <em key={sIdx} className="text-slate-300 italic">
                {sub.slice(1, -1)}
              </em>
            )
          }
          // 3. Convert citations like [Article 21] or [Section 57 CrPC]
          const citationParts = sub.split(/(\[[A-Za-z0-9\s.,()-]+\])/g)
          return citationParts.map((cite, cIdx) => {
            if (cite.startsWith('[') && cite.endsWith(']')) {
              const label = cite.slice(1, -1)
              return (
                <Link
                  key={cIdx}
                  to={`/constitution`}
                  className="inline-citation-pill"
                  title={`View ${label} in Constitutional Map`}
                >
                  <Landmark size={11} className="inline-cite-icon" />
                  <span>{label}</span>
                </Link>
              )
            }
            return cite
          })
        })
      })
    }

    const flushTable = (keyPrefix: number) => {
      if (tableRows.length === 0) return
      const headers = tableRows[0]
      const rows = tableRows.slice(1).filter((r) => !r.every((c) => c.includes('---') || c.includes(':--')))

      blocks.push(
        <div key={`table-${keyPrefix}`} className="streaming-table-wrapper">
          <table className="streaming-markdown-table">
            <thead>
              <tr>
                {headers.map((th, i) => (
                  <th key={i}>{renderInline(th.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell.trim())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      tableRows = []
      inTable = false
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect markdown table rows
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true
        const cells = line
          .trim()
          .slice(1, -1)
          .split('|')
        tableRows.push(cells)
        continue
      } else if (inTable) {
        flushTable(i)
      }

      // Headings
      if (line.startsWith('### ')) {
        blocks.push(
          <h4 key={i} className="stream-heading-4">
            {renderInline(line.slice(4))}
          </h4>
        )
      } else if (line.startsWith('## ')) {
        blocks.push(
          <h3 key={i} className="stream-heading-3">
            {renderInline(line.slice(3))}
          </h3>
        )
      } else if (line.startsWith('> ')) {
        // Blockquote
        blocks.push(
          <blockquote key={i} className="stream-blockquote">
            {renderInline(line.slice(2))}
          </blockquote>
        )
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        // Bullet point
        blocks.push(
          <div key={i} className="stream-bullet-item">
            <span className="stream-bullet-dot">&bull;</span>
            <span className="stream-bullet-content">{renderInline(line.trim().slice(2))}</span>
          </div>
        )
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list item
        const match = line.trim().match(/^(\d+)\.\s(.*)$/)
        if (match) {
          blocks.push(
            <div key={i} className="stream-numbered-item">
              <span className="stream-num-badge">{match[1]}.</span>
              <span className="stream-numbered-content">{renderInline(match[2])}</span>
            </div>
          )
        }
      } else if (line.trim() === '') {
        blocks.push(<div key={i} className="stream-spacer" />)
      } else {
        // Standard paragraph line
        blocks.push(
          <p key={i} className="stream-paragraph">
            {renderInline(line)}
          </p>
        )
      }
    }

    if (inTable) {
      flushTable(lines.length)
    }

    return blocks
  }, [content])

  return <div className="streaming-content-wrapper">{formattedBlocks}</div>
}
