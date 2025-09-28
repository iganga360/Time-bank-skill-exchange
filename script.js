/* Time Bank MVP client JS
   - Stores users in localStorage under "tb_users"
   - Stores session in "tb_session"
   - Matching: mutual interest (wantToLearn ∩ canTeach)
*/
(() => {
  // Helpers
  const $ = id => document.getElementById(id);
  const q = sel => document.querySelector(sel);

  const toast = (t) => {
    const el = $('toast');
    el.textContent = t;
    el.classList.remove('hidden');
    setTimeout(()=> el.classList.add('hidden'), 3000);
  };

  // Persistent storage helpers
  const loadUsers = () => JSON.parse(localStorage.getItem('tb_users') || '[]');
  const saveUsers = (u) => localStorage.setItem('tb_users', JSON.stringify(u));
  const getSession = () => JSON.parse(localStorage.getItem('tb_session') || 'null');
  const setSession = (s) => localStorage.setItem('tb_session', JSON.stringify(s));
  const clearSession = () => localStorage.removeItem('tb_session');

  // sample starter users (only if none exist)
  if (!localStorage.getItem('tb_users')) {
    const sample = [
      {id: genId(), name:'Asha Rao', username:'asharao', email:'asha@example.com', mobile:'', avatar:'', password:'asha123', canTeach:['sewing','knitting'], wantToLearn:['excel'], other:'Available weekends'},
      {id: genId(), name:'Ravi Kumar', username:'ravik', email:'ravi@example.com', mobile:'', avatar:'', password:'ravi123', canTeach:['excel','word'], wantToLearn:['guitar'], other:''},
      {id: genId(), name:'Sneha', username:'sneha360', email:'sneha@example.com', mobile:'', avatar:'', password:'sneha123', canTeach:['guitar'], wantToLearn:['knitting'], other:''}
    ];
    saveUsers(sample);
  }

  // UI elements
  const modalBackdrop = $('modalBackdrop');
  const authModal = $('authModal');
  const profileModal = $('profileModal');
  const chatModal = $('chatModal');

  // theme
  const app = document.getElementById('app');
  const themeToggle = $('themeToggle');
  const applyTheme = (t) => {
    if (t === 'dark') app.classList.remove('light');
    else app.classList.add('light');
    localStorage.setItem('tb_theme', t);
  };
  themeToggle.addEventListener('click', ()=> {
    const now = localStorage.getItem('tb_theme') === 'dark' ? 'light' : 'dark';
    applyTheme(now);
  });
  applyTheme(localStorage.getItem('tb_theme') || 'light');

  // open/close modal helpers
  function openModal(mod) {
    modalBackdrop.style.opacity = '1';
    modalBackdrop.style.pointerEvents = 'auto';
    mod.classList.add('show'); mod.setAttribute('aria-hidden','false');
  }
  function closeModal(mod) {
    modalBackdrop.style.opacity = '0';
    modalBackdrop.style.pointerEvents = 'none';
    mod.classList.remove('show'); mod.setAttribute('aria-hidden','true');
  }
  modalBackdrop.addEventListener('click', ()=> {
    [authModal, profileModal, chatModal].forEach(m=> closeModal(m));
  });

  // header/login actions
  $('btnLogin').addEventListener('click', ()=> openModal(authModal));
  $('ctaSignup').addEventListener('click', ()=> {
    openModal(authModal); switchAuthTab('signup');
  });
  $('ctaExplore').addEventListener('click', ()=> {
    document.getElementById('membersSection').scrollIntoView({behavior:'smooth'});
  });

  // auth modal tabs
  const tabs = Array.from(authModal.querySelectorAll('.tab'));
  tabs.forEach(t => t.addEventListener('click', e => {
    tabs.forEach(x=> x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    switchAuthTab(e.currentTarget.dataset.tab);
  }));
  function switchAuthTab(which){
    authModal.querySelectorAll('.tab-panel').forEach(p=>p.classList.add('hidden'));
    if (which === 'login') { $('tabLogin').classList.remove('hidden'); }
    else $('tabSignup').classList.remove('hidden');
  }
  $('closeAuth').addEventListener('click', ()=> closeModal(authModal));

  // small helper: generate id
  function genId(){ return 'u'+Math.random().toString(36).slice(2,9); }

  // avatar preview
  $('signupAvatar').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ()=> {
      $('avatarPreview').style.backgroundImage = `url(${reader.result})`;
      $('avatarPreview').textContent = '';
      $('avatarPreview').dataset.img = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // signup
  $('btnDoSignup').addEventListener('click', ()=> {
    const name = $('signupName').value.trim();
    const username = $('signupUsername').value.trim();
    const email = $('signupEmail').value.trim();
    const mobile = $('signupMobile').value.trim();
    const password = $('signupPassword').value;
    const want = $('signupWantToLearn').value.split(',').map(s=>s.trim()).filter(Boolean);
    const teach = $('signupCanTeach').value.split(',').map(s=>s.trim()).filter(Boolean);
    const other = $('signupOther').value.trim();
    const avatar = $('avatarPreview').dataset.img || '';

    if (!name || !username || !email || !password) return toast('Please fill required fields.');
    const users = loadUsers();
    if (users.find(u => u.username === username || u.email === email)) {
      return toast('Username or email already exists.');
    }
    const user = { id: genId(), name, username, email, mobile, password, avatar, canTeach: teach, wantToLearn: want, other };
    users.push(user); saveUsers(users); setSession({id:user.id}); closeModal(authModal);
    toast('Profile created — welcome!');
    clearSignupForm();
    renderMembers();
    showProfileFor(user.id);
  });

  function clearSignupForm(){
    ['signupName','signupUsername','signupEmail','signupMobile','signupPassword','signupWantToLearn','signupCanTeach','signupOther'].forEach(id=> $(id).value='');
    $('avatarPreview').style.backgroundImage=''; $('avatarPreview').dataset.img='';
  }

  // login
  $('btnDoLogin').addEventListener('click', ()=> {
    const idf = $('loginIdentifier').value.trim();
    const pw = $('loginPassword').value;
    if (!idf || !pw) return toast('Please enter credentials.');
    const users = loadUsers();
    const u = users.find(x => x.email === idf || x.username === idf);
    if (!u || u.password !== pw) return toast('Invalid credentials.');
    setSession({id:u.id}); closeModal(authModal); toast(`Welcome back, ${u.name.split(' ')[0]}!`);
    renderMembers(); showProfileFor(u.id);
  });

  // logout
  $('btnLogout').addEventListener('click', ()=> {
    clearSession(); closeModal(profileModal); toast('Logged out'); renderMembers();
  });

  // show profile
  $('btnEditProfile').addEventListener('click', ()=> {
    const s = getSession(); if (!s) return toast('No user.');
    const users = loadUsers(); const u = users.find(x=>x.id===s.id);
    if (!u) return toast('User missing.'); // show edit by simple prompt for demo
    const newName = prompt('Edit name', u.name) || u.name;
    u.name = newName;
    saveUsers(users);
    showProfileFor(u.id);
    toast('Profile updated (demo).');
  });

  $('closeProfile').addEventListener('click', ()=> closeModal(profileModal));

  // show profile card for user id
  function showProfileFor(uid){
    const users = loadUsers(); const u = users.find(x=>x.id===uid);
    if(!u) return;
    const pc = $('profileCard');
    pc.innerHTML = `
      <div class="avatar" style="background-image: url('${u.avatar}'); background-size:cover; background-position:center;">
        ${u.avatar ? '' : (u.name[0]||'?')}
      </div>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between"><strong>${u.name}</strong><small class="muted">@${u.username}</small></div>
        <div class="meta">${u.email} • ${u.mobile || '—'}</div>
        <div style="margin-top:8px"><strong>Can teach:</strong> ${(u.canTeach||[]).join(', ') || '—'}</div>
        <div><strong>Wants to learn:</strong> ${(u.wantToLearn||[]).join(', ') || '—'}</div>
        <div class="muted small" style="margin-top:6px">${u.other || ''}</div>
      </div>
    `;
    openModal(profileModal);
  }

  // Refresh members list
  $('btnRefresh').addEventListener('click', ()=> renderMembers());
  $('ctaExplore').addEventListener('click', ()=> renderMembers());

  // render members
  function renderMembers(){
    const list = $('memberList'); list.innerHTML = '';
    const users = loadUsers();
    const session = getSession();
    const currUser = users.find(u => session && u.id === session.id);
    const qSkill = ($('searchSkill').value || '').toLowerCase().trim();
    const mode = $('filterMode').value;

    const cards = users.map(u => {
      const mutual = isMutual(currUser, u);
      return {u, mutual};
    }).filter(x => {
      if (!qSkill) return true;
      const allSkills = [...(x.u.canTeach||[]),(...(x.u.wantToLearn||[]))].join(' ').toLowerCase();
      return allSkills.includes(qSkill);
    }).filter(x => {
      if (mode === 'mutual') return x.mutual;
      return true;
    });

    if (cards.length === 0) {
      list.innerHTML = '<div class="muted">No members found — create a profile or try a different skill.</div>';
      return;
    }

    cards.forEach(c => {
      const el = document.createElement('div');
      el.className = 'member' + (c.mutual ? ' mutual' : '');
      el.innerHTML = `
        <div class="avatar" style="background-image: url('${c.u.avatar}'); background-size:cover; background-position:center;">
          ${c.u.avatar ? '' : (c.u.name[0] || '?')}
        </div>
        <div class="minfo">
          <h4>${c.u.name} <small class="muted">@${c.u.username}</small></h4>
          <div class="badges"><div class="badge">Teaches: ${(c.u.canTeach||[]).slice(0,3).join(', ') || '—'}</div><div class="badge">Wants: ${(c.u.wantToLearn||[]).slice(0,3).join(', ') || '—'}</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn small view" data-id="${c.u.id}">View</button>
          <button class="btn small connect" data-id="${c.u.id}">${c.mutual ? 'Connect' : 'Request'}</button>
        </div>
      `;
      list.appendChild(el);
    });

    // attach handlers
    list.querySelectorAll('.view').forEach(b => b.addEventListener('click', (e)=>{
      showProfileFor(e.currentTarget.dataset.id);
    }));
    list.querySelectorAll('.connect').forEach(b => b.addEventListener('click', (e)=>{
      const targetId = e.currentTarget.dataset.id;
      handleConnect(targetId);
    }));
  }

  // check mutual match: currUser wants X and other canTeach X AND other wants Y and currUser canTeach Y
  function isMutual(curr, other){
    if (!curr || !other) return false;
    const want = (curr.wantToLearn||[]).map(s=>s.toLowerCase());
    const otherCan = (other.canTeach||[]).map(s=>s.toLowerCase());
    const otherWant = (other.wantToLearn||[]).map(s=>s.toLowerCase());
    const currCan = (curr.canTeach||[]).map(s=>s.toLowerCase());
    const a = want.some(w => otherCan.includes(w));
    const b = otherWant.some(w => currCan.includes(w));
    return a && b;
  }

  function handleConnect(targetId){
    const session = getSession(); if (!session) { openModal(authModal); return toast('Please login to connect.'); }
    const users = loadUsers(); const curr = users.find(u=>u.id===session.id); const other = users.find(u=>u.id===targetId);
    if (!curr || !other) return toast('User missing.');
    if (isMutual(curr, other)) {
      // open chat modal simulation
      $('chatWith').textContent = `Connect: ${other.name} (@${other.username})`;
      $('chatBox').innerHTML = `<div class="muted small">You are matched! Start a demo conversation.</div>`;
      openModal(chatModal);
    } else {
      // For demo, add a simple request recorded to other.other text
      other.other = (other.other || '') + `\nRequest from ${curr.username} to learn ${curr.wantToLearn.join(', ')}`;
      saveUsers(users);
      toast('Request sent (demo). If they accept you will be matched.');
      renderMembers();
    }
  }

  // Chat demo send
  $('sendChat').addEventListener('click', ()=> {
    const msg = $('chatInput').value.trim(); if (!msg) return;
    const box = $('chatBox');
    const p = document.createElement('div'); p.textContent = `You: ${msg}`; p.style.margin='6px 0';
    box.appendChild(p); $('chatInput').value='';
  });

  $('closeChat').addEventListener('click', ()=> closeModal(chatModal));

  // small: swap to signup link
  $('swapToSignup').addEventListener('click', (e)=> { e.preventDefault(); tabs.forEach(x=>x.classList.remove('active')); tabs.find(t=>t.dataset.tab==='signup').classList.add('active'); switchAuthTab('signup'); });

  // on load
  window.addEventListener('load', ()=>{
    $('thisYear').textContent = new Date().getFullYear();
    renderMembers();
    const session = getSession();
    if (session) {
      // show profile small button
      // attach header quick profile open
      const profileBtn = document.createElement('button');
      profileBtn.className='btn small ghost';
      profileBtn.textContent='My Profile';
      profileBtn.addEventListener('click', ()=> showProfileFor(session.id));
      $('btnLogin').replaceWith(profileBtn);
      const newBtn = document.createElement('button');
      newBtn.className='btn small';
      newBtn.textContent='Logout';
      newBtn.addEventListener('click', ()=> { clearSession(); location.reload(); });
      document.querySelector('.header-controls').appendChild(newBtn);
    }
  });

})();
