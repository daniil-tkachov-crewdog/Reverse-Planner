import type { ReactNode } from 'react'
import type { Status } from '../../../shared/types'
import { STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '../../../shared/types'

export function Modal({
  title,
  onClose,
  children,
  edgeTop,
  edgeRight,
  edgeBottom
}: {
  title: string
  onClose: () => void
  children: ReactNode
  edgeTop?: ReactNode
  edgeRight?: ReactNode
  edgeBottom?: ReactNode
}): JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {edgeTop && <div className="modal-edge modal-edge--top">{edgeTop}</div>}
        {edgeRight && <div className="modal-edge modal-edge--right">{edgeRight}</div>}
        {edgeBottom && <div className="modal-edge modal-edge--bottom">{edgeBottom}</div>}
        <div className="modal__body">
          <h2 className="modal__title">{title}</h2>
          {children}
        </div>
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
