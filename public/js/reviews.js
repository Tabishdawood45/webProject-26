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

      return `
        <div class="card shadow-sm border-0 mb-4 review-card">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <h5 class="mb-1 fw-bold">${review.full_name}</h5>
                <div class="review-rating-badge">Rating: ${review.rating}/5</div>
              </div>
              <small class="text-muted">${new Date(review.created_at).toLocaleDateString()}</small>
            </div>

            <p class="review-comment mb-3">${review.comment}</p>

            <div class="review-actions d-flex gap-2 flex-wrap">
              <button class="btn btn-outline-primary btn-sm review-like-btn" onclick="likeReview(${review.id}, this)">
                👍 Like <span class="badge bg-primary ms-1">${review.likes_count}</span>
              </button>

              ${isOwner ? `
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  onclick="editReview(${review.id}, ${review.rating}, ${JSON.stringify(review.comment)})"
                >
                  ✏ Edit comment
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

function editReview(id, rating, comment) {
  reviewIdInput.value = id;
  ratingInput.value = rating;
  commentInput.value = comment;

  ratingInput.disabled = true;

  showAlert('You can edit only your comment. Rating cannot be changed after publishing.', 'info');
  window.scrollTo({ top: reviewForm.offsetTop - 100, behavior: 'smooth' });
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

loadReviews();