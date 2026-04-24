const user = JSON.parse(localStorage.getItem('user'));

const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const deleteAccountForm = document.getElementById('deleteAccountForm');
const logoutBtn = document.getElementById('logoutBtn');

const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');

const profileAlert = document.getElementById('profileAlert');
const passwordAlert = document.getElementById('passwordAlert');
const deleteAlert = document.getElementById('deleteAlert');

if (!user) {
  alert('Please login first');
  window.location.href = '/login.html';
}

function showAlert(element, message, type = 'success') {
  element.className = `alert alert-${type}`;
  element.textContent = message;
}

function loadUserData() {
  if (!user) return;
  fullNameInput.value = user.full_name || '';
  emailInput.value = user.email || '';
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    user_id: user.id,
    full_name: fullNameInput.value.trim(),
    email: emailInput.value.trim()
  };

  try {
    const res = await fetch(`/api/auth/profile/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(profileAlert, data.message || 'Failed to update profile', 'danger');
      return;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    showAlert(profileAlert, 'Profile updated successfully', 'success');
  } catch (error) {
    console.error(error);
    showAlert(profileAlert, 'Something went wrong', 'danger');
  }
});

passwordForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById('currentPassword').value.trim();
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  if (newPassword.length < 6) {
    showAlert(passwordAlert, 'New password must be at least 6 characters', 'danger');
    return;
  }

  if (newPassword !== confirmPassword) {
    showAlert(passwordAlert, 'New password and confirm password do not match', 'danger');
    return;
  }

  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(passwordAlert, data.message || 'Failed to change password', 'danger');
      return;
    }

    passwordForm.reset();
    showAlert(passwordAlert, 'Password changed successfully', 'success');
  } catch (error) {
    console.error(error);
    showAlert(passwordAlert, 'Something went wrong', 'danger');
  }
});

logoutBtn.addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to logout?');
  if (!confirmed) return;

  localStorage.removeItem('user');
  window.location.href = '/login.html';
});

deleteAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const deletePassword = document.getElementById('deletePassword').value.trim();

  const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
  if (!confirmed) return;

  try {
    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        password: deletePassword
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(deleteAlert, data.message || 'Failed to delete account', 'danger');
      return;
    }

    localStorage.removeItem('user');
    alert('Your account has been deleted successfully');
    window.location.href = '/index.html';
  } catch (error) {
    console.error(error);
    showAlert(deleteAlert, 'Something went wrong', 'danger');
  }
});

loadUserData();