import Rating from "./Rating.jsx";

export default function ReviewCard({ review }) {
  const initial = review.customerName?.charAt(0) || "?";
  return (
    <div className="card review-card">
      <div className="review-card-head">
        <div className="review-avatar-row">
          <span className="review-avatar">{initial}</span>
          <div>
            <div className="review-name">{review.customerName}</div>
            <div className="review-date">{review.date}</div>
          </div>
        </div>
        <Rating value={review.rating} />
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  );
}
