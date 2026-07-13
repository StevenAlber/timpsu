/* ------------------------------------------------------------------
   Timpsu — testpere modaal
   ------------------------------------------------------------------
   Kui soovid vormi päriselt e-postile saata, lisa alla oma Web3Formsi
   võti. Kuni võti on "WEB3FORMS_KEY_HERE", näidatakse kohe soe
   kinnitusteade ilma saatmiseta (demo-režiim).
------------------------------------------------------------------- */
const WEB3FORMS_KEY = "3f71e643-588f-4516-95df-3deb3ad145b2";

const modal = document.getElementById('testpere-modal');
const card = modal ? modal.querySelector('.tp-modal-card') : null;
const form = document.getElementById('tp-form');
const errorBox = document.getElementById('tp-error');
const viewForm = modal ? modal.querySelector('[data-view="form"]') : null;
const viewDone = modal ? modal.querySelector('[data-view="done"]') : null;
const submitBtn = form ? form.querySelector('.tp-submit') : null;
const submitLabel = form ? form.querySelector('.tp-submit-label') : null;
let lastFocus = null;

function openModal(event){
  if (event) event.preventDefault();
  if (!modal) return;
  lastFocus = document.activeElement;
  resetToForm();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  // Sunni reflow, et üleminek käivituks
  void modal.offsetWidth;
  modal.classList.add('tp-open');
  const first = document.getElementById('tp-child-name');
  window.setTimeout(() => { if (first) first.focus(); }, 60);
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove('tp-open');
  document.body.style.overflow = '';
  const done = () => {
    modal.hidden = true;
    modal.removeEventListener('transitionend', onEnd);
  };
  const onEnd = e => { if (e.target === modal) done(); };
  modal.addEventListener('transitionend', onEnd);
  window.setTimeout(done, 360); // varuvõrk, kui üleminekut pole
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}

function resetToForm(){
  if (viewForm) viewForm.hidden = false;
  if (viewDone) viewDone.hidden = true;
  if (errorBox){ errorBox.hidden = true; errorBox.textContent = ''; }
  form && form.querySelectorAll('.tp-field').forEach(f => f.classList.remove('tp-invalid'));
}

function showDone(){
  if (viewForm) viewForm.hidden = true;
  if (viewDone){
    viewDone.hidden = false;
    const h = viewDone.querySelector('h2');
    if (h) h.focus();
    if (card) card.scrollTop = 0;
  }
}

/* --- Avajad: „Tule testpereks”, finaali nupp jm --- */
document.querySelectorAll('.top-action, .finale-cta, [data-form-link], [data-open-form]')
  .forEach(el => el.addEventListener('click', openModal));

/* --- Sulgejad: taust, ristike, „Tagasi metsa” --- */
modal && modal.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', closeModal);
});

/* --- Escape sulgeb + lihtne fookuslõks --- */
document.addEventListener('keydown', e => {
  if (!modal || modal.hidden) return;
  if (e.key === 'Escape'){ closeModal(); return; }
  if (e.key === 'Tab' && card){
    const items = card.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const visible = Array.prototype.filter.call(items, el => el.offsetParent !== null || el === document.activeElement);
    if (!visible.length) return;
    const first = visible[0], last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
});

/* --- Saatmine --- */
function fieldValid(input){
  if (!input) return true;
  if (input.type === 'email'){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
  }
  return input.value.trim() !== '';
}

form && form.addEventListener('submit', async e => {
  e.preventDefault();
  if (errorBox){ errorBox.hidden = true; errorBox.textContent = ''; }

  const required = ['tp-child-name','tp-child-age','tp-country','tp-email'];
  let firstBad = null;
  required.forEach(id => {
    const input = document.getElementById(id);
    const wrap = input ? input.closest('.tp-field') : null;
    const ok = fieldValid(input);
    if (wrap) wrap.classList.toggle('tp-invalid', !ok);
    if (!ok && !firstBad) firstBad = input;
  });

  if (firstBad){
    if (errorBox){
      errorBox.textContent = firstBad.type === 'email' && firstBad.value.trim()
        ? 'Palun kontrolli e-posti aadressi.'
        : 'Palun täida tärniga väljad, et saaksime ühendust võtta.';
      errorBox.hidden = false;
    }
    firstBad.focus();
    return;
  }

  // Kõik korras — saada (kui võti olemas) või näita kinnitust
  if (submitBtn){ submitBtn.disabled = true; }
  if (submitLabel){ submitLabel.textContent = 'Saadan…'; }

  const finish = () => {
    if (submitBtn){ submitBtn.disabled = false; }
    if (submitLabel){ submitLabel.textContent = 'Meie pere tahab kaasa tulla'; }
    if (form) form.reset();
    showDone();
  };

  if (WEB3FORMS_KEY && WEB3FORMS_KEY !== 'WEB3FORMS_KEY_HERE'){
    try {
      const data = new FormData(form);
      data.append('access_key', WEB3FORMS_KEY);
      const childName = (document.getElementById('tp-child-name')?.value || '').trim();
      data.append('subject', childName ? `Timpsu testpere — ${childName}` : 'Timpsu — uus testpere');
      data.append('from_name', 'Timpsu testpere vorm');
      // Kui vastad hello@timpsu.ee-st, läheb vastus otse lapsevanemale
      const parentEmail = (document.getElementById('tp-email')?.value || '').trim();
      if (parentEmail) data.append('replyto', parentEmail);
      const res = await fetch('https://api.web3forms.com/submit', { method:'POST', body:data });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.success){ finish(); }
      else { throw new Error('send-failed'); }
    } catch (err){
      if (submitBtn){ submitBtn.disabled = false; }
      if (submitLabel){ submitLabel.textContent = 'Meie pere tahab kaasa tulla'; }
      if (errorBox){
        errorBox.textContent = 'Saatmine ei õnnestunud. Palun proovi hetke pärast uuesti.';
        errorBox.hidden = false;
      }
    }
  } else {
    // Demo-režiim: näita kohe soojat kinnitust
    window.setTimeout(finish, 400);
  }
});

/* --- Vana kerimisloogika, nüüd null-turvaline --- */
const topbar = document.querySelector('.topbar');
const hero = document.querySelector('.hero');
function updateTopbar(){
  if (!topbar) return;
  const threshold = (hero ? hero.offsetHeight : 600) - 90;
  topbar.classList.toggle('scrolled', window.scrollY > threshold);
}
if (topbar){
  window.addEventListener('scroll', updateTopbar, { passive: true });
  window.addEventListener('resize', updateTopbar);
  updateTopbar();
}
