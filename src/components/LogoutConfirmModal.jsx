function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl text-amber-600">
          ⏻
        </div>

        <h3 className="text-2xl font-black text-slate-900">Log out?</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Are you sure you want to sign out of your account? You’ll need to log in again to continue.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:brightness-110"
          >
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmModal
