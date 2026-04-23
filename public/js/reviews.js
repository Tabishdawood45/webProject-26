const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const reviewAlert = document.getElementById('reviewAlert');
const reviewIdInput = document.getElementById('reviewId');
const ratingInput = document.getElementById('rating');
const commentInput = document.getElementById('comment');

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

const productId = getProductIdFromUrl();

function showAlert(message, type = 'success') {
  reviewAlert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

async function loadReviews() {
  if (!productId) return;

  try {
    const res = await fetch(`/api/reviews/${productId}`);
    const reviews = await res.json();
    const user = getLoggedInUser();

    if (!reviews.length) {
      reviewsList.innerHTML = '<div class="alert alert-info">No reviews yet.</div>';
      return;
    }

    reviewsList.innerHTML = reviews.map(review => {
      const isOwner = user && Number(user.id) === Number(review.user_id);
      const isAdmin = user && user.role === 'admin';

      return `
        <div class="card review-card" style="margin-bottom: 18px;">
          <div class="card-body">
            <div class="space-between" style="margin-bottom: 12px;">
              <div>
                <h4 style="margin: 0 0 8px;">${escapeHtml(review.full_name)}</h4>
                <div class="review-rating-badge">Rating: ${review.rating}/5</div>
              </div>
              <small class="small">${new Date(review.created_at).toLocaleDateString()}</small>
            </div>

            <p class="review-comment">${escapeHtml(review.comment)}</p>

            <div class="review-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-outline-primary btn-sm" onclick="likeReview(${review.id}, this)">
                👍 Like <span style="margin-left: 4px;">${review.likes_count}</span>
              </button>

              ${isOwner ? `
                <button
                  class="btn btn-secondary btn-sm"
                  onclick="editReviewFromButton(this)"
                  data-review-id="${review.id}"
                  data-review-rating="${review.rating}"
                  data-review-comment="${encodeURIComponent(review.comment)}"
                >
                  ✏ Edit comment
                </button>
              ` : ''}

              ${isAdmin ? `
                <button
                  class="btn btn-danger btn-sm"
                  onclick="deleteReview(${review.id})"
                >
                  Delete Review
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error(error);
    reviewsList.innerHTML = '<div class="alert alert-danger">Could not load reviews.</div>';
  }
}

function editReviewFromButton(button) {
  const id = button.dataset.reviewId;
  const rating = button.dataset.reviewRating;
  const comment = decodeURIComponent(button.dataset.reviewComment || '');

  reviewIdInput.value = id;
  ratingInput.value = rating;
  commentInput.value = comment;
  ratingInput.disabled = true;

  showAlert(
    'You can edit only your comment. Rating cannot be changed after publishing.',
    'info'
  );

  if (reviewForm) {
    window.scrollTo({
      top: reviewForm.offsetTop - 100,
      behavior: 'smooth'
    });
  }
}

reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = getLoggedInUser();

  if (!user) {
    showAlert('Please login first.', 'danger');
    return;
  }

  const reviewId = reviewIdInput.value;
  const comment = commentInput.value.trim();
  const rating = ratingInput.value;

  if (!comment) {
    showAlert('Please enter comment.', 'danger');
    return;
  }

  try {
    let res;

    if (reviewId) {
      res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          comment
        })
      });
    } else {
      res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          comment,
          rating
        })
      });
    }

    const data = await res.json();

    if (res.ok) {
      showAlert(data.message, 'success');
      reviewForm.reset();
      reviewIdInput.value = '';
      ratingInput.disabled = false;
      loadReviews();
    } else {
      showAlert(data.message, 'danger');
    }
  } catch (error) {
    console.error(error);
    showAlert('Something went wrong.', 'danger');
  }
});

async function likeReview(id, button) {
  const user = getLoggedInUser();

  if (!user) {
    alert('Please login first to like a review.');
    return;
  }

  try {
    button.disabled = true;

    const res = await fetch(`/api/reviews/like/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });

    const data = await res.json();

    if (res.ok) {
      loadReviews();
    } else {
      alert(data.message);
      button.disabled = false;
    }
  } catch (error) {
    console.error(error);
    alert('Could not like review');
    button.disabled = false;
  }
}

async function deleteReview(reviewId) {
  const user = getLoggedInUser();

  if (!user || user.role !== 'admin') {
    alert('Only admin can delete reviews');
    return;
  }

  const confirmDelete = confirm('Are you sure you want to delete this review?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_role: user.role })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to delete review');
      return;
    }

    alert('Review deleted successfully');
    loadReviews();
  } catch (error) {
    console.error(error);
    alert('Error deleting review');
  }
}

window.likeReview = likeReview;
window.editReviewFromButton = editReviewFromButton;
window.deleteReview = deleteReview;

loadReviews();