const feedbackForm = document.getElementById('feedbackForm');
const responseMessage = document.getElementById('responseMessage');

feedbackForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (res.ok) {
      responseMessage.innerHTML = `<div class="alert alert-success d-block">${data.message}</div>`;
      feedbackForm.reset();
    } else {
      responseMessage.innerHTML = `<div class="alert alert-danger d-block">${data.message}</div>`;
    }
  } catch (error) {
    responseMessage.innerHTML = `<div class="alert alert-danger d-block">Something went wrong</div>`;
  }
});