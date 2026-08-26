export function StorageWarning({ onRetry,onExport }: { onRetry:()=>void;onExport:()=>void }) {
  return <section className="storage-warning" role="alert">
    <div><strong>Your changes are not being saved</strong><p>This device refused local storage. Export a recovery copy, free some browser storage, then retry.</p></div>
    <div><button className="secondary compact" onClick={onExport}>Export recovery copy</button><button className="primary compact" onClick={onRetry}>Retry saving</button></div>
  </section>
}
