import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

/** Lightweight rich text: contentEditable + a few word-doc style tools. */
export function RichDescription({ value, onChange, placeholder }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  // Sync external value in without clobbering the caret while typing.
  useEffect(() => {
    const el = ref.current
    if (el && document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  const exec = (command: string): void => {
    ref.current?.focus()
    document.execCommand(command, false)
    if (ref.current) onChange(ref.current.innerHTML)
  }

  return (
    <div>
      <div className="desc-toolbar">
        <button type="button" className="desc-tool-btn" title="Bold" onClick={() => exec('bold')}>
          <strong>B</strong>
        </button>
        <button type="button" className="desc-tool-btn" title="Italic" onClick={() => exec('italic')}>
          <em>I</em>
        </button>
        <button
          type="button"
          className="desc-tool-btn"
          title="Bullet points"
          onClick={() => exec('insertUnorderedList')}
        >
          • List
        </button>
      </div>
      <div
        ref={ref}
        className="rich"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />
    </div>
  )
}
