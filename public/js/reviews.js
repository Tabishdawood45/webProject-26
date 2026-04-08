const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');
const reviewMessage = document.getElementById('reviewMessage');

// temporary product/user values for testing
const productId = 1;

function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('user'));
}

async function loadReviews() {
  try {
    const res = await fetch(`/api/reviews/${productId}`);
    const reviews = await res.json();

    if (!reviews.length) {
      reviewsList.innerHTML = '<div class="alert alert-info">No reviews yet.</div>';
      return;
    }

    reviewsList.innerHTML = reviews.map(review => `
      <div class="card mb-3 shadow-sm border-0">
        <div class="card-body">
          <p class="mb-1"><strong>Rating:</strong> ${review.rating}/5</p>
          <p class="mb-2">${review.comment}</p>
          <button class="btn btn-outline-primary btn-sm" onclick="likeReview(${review.id})">
            Like (${review.likes_count})
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    reviewsList.innerHTML = '<div class="alert alert-danger">Could not load reviews.</div>';
  }
}

reviewForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = getLoggedInUser();

  if (!user) {
    reviewMessage.innerHTML = '<div class="alert alert-danger">Please login first.</div>';
    return;
  }

  const comment = document.getElementById('comment').value;
  const rating = document.getElementById('rating').value;

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        product_id: productId,
        comment,
        rating
      })
    });

    const data = await res.json();

    if (res.ok) {
      reviewMessage.innerHTML = `<div class="alert alert-success d-block">${data.message}</div>`;
      reviewForm.reset();
      loadReviews();
    } else {
      reviewMessage.innerHTML = `<div class="alert alert-danger d-block">${data.message}</div>`;
    }
  } catch (error) {
    reviewMessage.innerHTML = '<div class="alert alert-danger d-block">Something went wrong.</div>';
  }
});

async function likeReview(id) {
  await fetch(`/api/reviews/like/${id}`, { method: 'PUT' });
  loadReviews();
}

loadReviews();