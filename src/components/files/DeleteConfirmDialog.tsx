interface DeleteConfirmDialogProps {
  fileName: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({ fileName, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-dialog-title" className="text-base font-semibold text-gray-900">
          Delete file?
        </h2>
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-700 break-all">{fileName}</span> will be permanently
          removed from your saved files. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors cursor-pointer"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
