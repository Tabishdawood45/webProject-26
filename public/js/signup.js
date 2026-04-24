// const form = document.getElementById('signupForm');
// const message = document.getElementById('message');

// form.addEventListener('submit', async (e) => {
//   e.preventDefault();

//   const full_name = document.getElementById('full_name').value;
//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   try {
//     const res = await fetch('/api/auth/signup', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ full_name, email, password })
//     });

//     const data = await res.json();

//     if (res.ok) {
//       message.innerHTML = '<span class="text-success">Signup successful!</span>';
//       form.reset();
//     } else {
//       message.innerHTML = `<span class="text-danger">${data.message}</span>`;
//     }

//   } catch (error) {
//     message.innerHTML = '<span class="text-danger">Error occurred</span>';
//   }
// });





const form = document.getElementById('signupForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const full_name = document.getElementById('full_name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      message.innerHTML = '<span class="text-success">Signup successful! Redirecting to login...</span>';
      form.reset();

      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1000);
    } else {
      message.innerHTML = `<span class="text-danger">${data.message}</span>`;
    }

  } catch (error) {
    console.error(error);
    message.innerHTML = '<span class="text-danger">Error occurred</span>';
  }
});