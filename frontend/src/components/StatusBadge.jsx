const STATUS_CLASS = {
  Pending: "status-pending",
  Accepted: "status-accepted",
  Preparing: "status-preparing",
  Ready: "status-ready",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || "status-pending";
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
