// document.addEventListener('DOMContentLoaded', () => {
//   const user = JSON.parse(localStorage.getItem('user'));

//   const navWelcome = document.getElementById('navWelcome');
//   const loginLink = document.getElementById('navLogin');
//   const signupLink = document.getElementById('navSignup');
//   const cartLink = document.getElementById('navCart');
//   const dashboardLink = document.getElementById('navDashboard');
//   const logoutBtn = document.getElementById('navLogout');

//   if (user) {
//     if (navWelcome) {
//       navWelcome.textContent = `Hi, ${user.full_name}${user.role === 'admin' ? ' (Admin)' : ''}`;
//     }

//     if (loginLink) loginLink.classList.add('hidden');
//     if (signupLink) signupLink.classList.add('hidden');

//     if (cartLink) cartLink.classList.remove('hidden');
//     if (dashboardLink) dashboardLink.classList.remove('hidden');
//     if (logoutBtn) logoutBtn.classList.remove('hidden');
//   } else {
//     if (navWelcome) navWelcome.textContent = '';

//     if (loginLink) loginLink.classList.remove('hidden');
//     if (signupLink) signupLink.classList.remove('hidden');

//     if (cartLink) cartLink.classList.add('hidden');
//     if (dashboardLink) dashboardLink.classList.add('hidden');
//     if (logoutBtn) logoutBtn.classList.add('hidden');
//   }

//   if (logoutBtn) {
//     logoutBtn.addEventListener('click', () => {
//       localStorage.removeItem('user');
//       localStorage.removeItem('cart');
//       window.location.href = '/login.html';
//     });
//   }
// });
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const navWelcome = document.getElementById('navWelcome');
  const authElements = document.querySelectorAll('[data-auth]');
  const guestElements = document.querySelectorAll('[data-guest]');
  const logoutButtons = document.querySelectorAll('[data-logout]');

  if (user) {
    if (navWelcome) {
      navWelcome.textContent = `Hi, ${user.full_name}${user.role === 'admin' ? ' (Admin)' : ''}`;
    }

    authElements.forEach(el => {
      el.classList.remove('d-none');
      el.classList.remove('hidden');
    });

    guestElements.forEach(el => {
      el.classList.add('d-none');
      el.classList.add('hidden');
    });
  } else {
    if (navWelcome) {
      navWelcome.textContent = '';
    }

    authElements.forEach(el => {
      el.classList.add('d-none');
      el.classList.add('hidden');
    });

    guestElements.forEach(el => {
      el.classList.remove('d-none');
      el.classList.remove('hidden');
    });
  }

  logoutButtons.forEach(button => {
    button.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      window.location.href = '/login.html';
    });
  });
});