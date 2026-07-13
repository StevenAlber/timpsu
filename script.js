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
