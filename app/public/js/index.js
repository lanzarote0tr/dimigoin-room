addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.querySelector('.login-btn');

  loginBtn.addEventListener('click', () => {
    window.location.href = '/auth/google';
  });
});
