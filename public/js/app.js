function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function updateNavbar() {
  const user = getLoggedInUser();

  const authElements = document.querySelectorAll('[data-auth]');
  const guestElements = document.querySelectorAll('[data-guest]');
  const logoutButtons = document.querySelectorAll('[data-logout]');
  const navWelcome = document.getElementById('navWelcome');

  if (user) {
    authElements.forEach(el => {
      if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'SPAN') {
        el.style.display = '';
      }
    });

    guestElements.forEach(el => {
      el.style.display = 'none';
    });

    if (navWelcome) {
      navWelcome.textContent = `Hi, ${user.full_name || user.name || 'User'}`;
      navWelcome.style.display = 'inline-block';
    }
  } else {
    authElements.forEach(el => {
      el.style.display = 'none';
    });

    guestElements.forEach(el => {
      if (el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'SPAN') {
        el.style.display = '';
      }
    });

    if (navWelcome) {
      navWelcome.textContent = '';
      navWelcome.style.display = 'none';
    }
  }

  logoutButtons.forEach(button => {
    button.addEventListener('click', () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/index.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', updateNavbar);