const FORM_LINK = "FORM_LINK_HERE";
document.querySelectorAll('[data-form-link]').forEach(link => {
  link.addEventListener('click', event => {
    if (FORM_LINK === 'FORM_LINK_HERE') {
      event.preventDefault();
      alert('Testpere vormi link lisatakse siia enne avaldamist.');
    } else {
      link.href = FORM_LINK;
    }
  });
});

const topbar = document.querySelector('.topbar');
const hero = document.querySelector('.hero');
function updateTopbar(){
  const threshold = (hero ? hero.offsetHeight : 600) - 90;
  topbar.classList.toggle('scrolled', window.scrollY > threshold);
}
window.addEventListener('scroll', updateTopbar, { passive: true });
window.addEventListener('resize', updateTopbar);
updateTopbar();
