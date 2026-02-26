export default function StatusBanner({ status }) {
  if (!status?.message) {
    return null;
  }

  return <p className={`status-banner ${status.type}`}>{status.message}</p>;
}
