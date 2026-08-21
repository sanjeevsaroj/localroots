import Rating from "./Rating.jsx";

export default function ReviewCard({ review }) {
  const customerName = review.customerName || review.user?.name || "Customer";

  const date = review.date
    ? review.date
    : review.createdAt
      ? new Date(review.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";

  const initial = customerName.charAt(0).toUpperCase();

  return (
    <div className="card review-card">
      <div className="review-card-head">
        <div className="review-avatar-row">
          <span className="review-avatar">{initial}</span>

          <div>
            <div className="review-name">{customerName}</div>
            <div className="review-date">{date}</div>
          </div>
        </div>

        <Rating value={review.rating} />
      </div>

      <p className="review-comment">{review.comment}</p>
    </div>
  );
}