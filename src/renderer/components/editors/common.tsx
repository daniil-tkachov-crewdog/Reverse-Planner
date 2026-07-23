import type { ReactNode } from 'react'
import type { Status } from '../../../shared/types'
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '../../../shared/types'

export function Modal({
  title,
  onClose,
  children
}: {
  title: string
  onClose: () => void
  children: ReactNode
}): JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className="modal__title">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
    </div>
  )
}

export function StatusSelect({
  value,
  onChange
}: {
  value: Status
  onChange: (s: Status) => void
}): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="status-dot" style={{ background: STATUS_COLOR[value] }} />
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value as Status)}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  )
}
