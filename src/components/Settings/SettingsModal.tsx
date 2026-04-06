import { useRef, useEffect, useCallback } from 'react'
import { SettingsContent } from './SettingsContent'
import styles from './Settings.module.css'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Sync React state when the dialog is closed natively (e.g. Escape key)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [onClose])

  // Close when clicking the backdrop (the dialog element itself, outside dialogInner)
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) onClose()
    },
    [onClose],
  )

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      aria-labelledby="settings-title"
    >
      <div className={styles.dialogInner}>
        <div className={styles.dialogHeader}>
          <h2 id="settings-title" className={styles.dialogTitle}>
            Settings
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        <SettingsContent />
      </div>
    </dialog>
  )
}
