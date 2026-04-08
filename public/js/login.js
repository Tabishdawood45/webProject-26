const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      message.innerHTML = '<span class="text-success">Login successful!</span>';

      
      localStorage.setItem('user', JSON.stringify(data.user));

      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } else {
      message.innerHTML = `<span class="text-danger">${data.message}</span>`;
    }

  } catch (error) {
    message.innerHTML = '<span class="text-danger">Error occurred</span>';
  }
});