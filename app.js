// =============================================================
// app.js — ระบบทะเบียนคุมการเบิกจ่ายเงินร้านค้า
// Version 3.0.1 — Firebase + Role-based Access Control
// =============================================================

// Helper: check if current user is admin
function isAdmin() { return AppState.user && AppState.user.role === 'admin'; }

// --- Firebase Instances ---
let auth, db, secondaryApp;

// --- Application State ---
const AppState = {
  user: null,
  shops: [],
  disbursements: [],
  activeTab: 'dashboard',
  theme: 'light',
  filters: { search: '', shop: '', status: '', startDate: '', endDate: '' },
  pagination: { currentPage: 1, pageSize: 10 },
  charts: { monthly: null, shop: null }
};

// --- DOM ELEMENTS ---
const elements = {
  loginContainer:           document.getElementById('login-container'),
  appContainer:             document.getElementById('app-container'),
  formLogin:                document.getElementById('form-login'),
  loginEmail:               document.getElementById('login-email'),
  loginPassword:            document.getElementById('login-password'),
  loginErrorMsg:            document.getElementById('login-error-msg'),
  btnLogout:                document.getElementById('btn-logout'),
  userRoleBadge:            document.getElementById('user-role-badge'),
  userDisplayName:          document.getElementById('user-display-name'),
  menuAdminBtn:             document.getElementById('menu-admin-btn'),
  themeToggleBtn:           document.getElementById('theme-toggle'),
  themeText:                document.getElementById('theme-text'),
  pageTitle:                document.getElementById('page-title'),
  pageSubtitle:             document.getElementById('page-subtitle'),
  todayDateText:            document.getElementById('header-today-date'),
  menuItems:                document.querySelectorAll('.menu-item'),
  tabContents:              document.querySelectorAll('.tab-content'),
  statTotalDisbursed:       document.getElementById('stat-total-disbursed'),
  statTotalPaid:            document.getElementById('stat-total-paid'),
  statPaidCount:            document.getElementById('stat-paid-count'),
  statTotalPending:         document.getElementById('stat-total-pending'),
  statPendingCount:         document.getElementById('stat-pending-count'),
  statTotalShops:           document.getElementById('stat-total-shops'),
  recentDisbursementsTbody: document.getElementById('recent-disbursements-tbody'),
  filterSearch:             document.getElementById('filter-search'),
  filterShop:               document.getElementById('filter-shop'),
  filterStatus:             document.getElementById('filter-status'),
  filterStartDate:          document.getElementById('filter-start-date'),
  filterEndDate:            document.getElementById('filter-end-date'),
  btnClearFilters:          document.getElementById('btn-clear-filters'),
  btnAddDisbursement:       document.getElementById('btn-add-disbursement'),
  btnExportCsv:             document.getElementById('btn-export-csv'),
  filteredRecordsCount:     document.getElementById('filtered-records-count'),
  disbursementsTbody:       document.getElementById('disbursements-tbody'),
  paginationContainer:      document.getElementById('pagination'),
  btnAddShop:               document.getElementById('btn-add-shop'),
  shopsListContainer:       document.getElementById('shops-list-container'),
  btnExportBackup:          document.getElementById('btn-export-backup'),
  importFileInput:          document.getElementById('import-file-input'),
  btnTriggerImport:         document.getElementById('btn-trigger-import'),
  importFilename:           document.getElementById('import-filename'),
  btnAddUser:               document.getElementById('btn-add-user'),
  adminUsersTbody:          document.getElementById('admin-users-tbody'),
  modalDisbursement:        document.getElementById('modal-disbursement'),
  modalDisbursementTitle:   document.getElementById('modal-disbursement-title'),
  modalDisbursementClose:   document.getElementById('modal-disbursement-close'),
  btnCancelDisbursementModal: document.getElementById('btn-cancel-disbursement-modal'),
  formDisbursement:         document.getElementById('form-disbursement'),
  dId:                      document.getElementById('disbursement-id'),
  dDate:                    document.getElementById('d-date'),
  dRef:                     document.getElementById('d-ref'),
  dShop:                    document.getElementById('d-shop'),
  dDetails:                 document.getElementById('d-details'),
  dSubtotal:                document.getElementById('d-subtotal'),
  dVatType:                 document.getElementById('d-vat-type'),
  dWhtRate:                 document.getElementById('d-wht-rate'),
  dPaymentMethod:           document.getElementById('d-payment-method'),
  dStatus:                  document.getElementById('d-status'),
  budgetWarningBanner:      document.getElementById('budget-warning-banner'),
  warnRemainingBudget:      document.getElementById('warn-remaining-budget'),
  calcSubtotal:             document.getElementById('calc-subtotal'),
  calcVat:                  document.getElementById('calc-vat'),
  calcWht:                  document.getElementById('calc-wht'),
  calcNet:                  document.getElementById('calc-net'),
  modalShop:                document.getElementById('modal-shop'),
  modalShopTitle:           document.getElementById('modal-shop-title'),
  modalShopClose:           document.getElementById('modal-shop-close'),
  btnCancelShopModal:       document.getElementById('btn-cancel-shop-modal'),
  formShop:                 document.getElementById('form-shop'),
  sId:                      document.getElementById('shop-id'),
  sName:                    document.getElementById('s-name'),
  sBudget:                  document.getElementById('s-budget'),
  sTaxId:                   document.getElementById('s-tax-id'),
  sBankName:                document.getElementById('s-bank-name'),
  sBankAccount:             document.getElementById('s-bank-account'),
  sPhone:                   document.getElementById('s-phone'),
  sEmail:                   document.getElementById('s-email'),
  sAddress:                 document.getElementById('s-address'),
  modalUser:                document.getElementById('modal-user'),
  modalUserTitle:           document.getElementById('modal-user-title'),
  modalUserClose:           document.getElementById('modal-user-close'),
  btnCancelUserModal:       document.getElementById('btn-cancel-user-modal'),
  formUser:                 document.getElementById('form-user'),
  uEmail:                   document.getElementById('u-email'),
  uDisplayName:             document.getElementById('u-displayname'),
  uPassword:                document.getElementById('u-password'),
  uPasswordContainer:       document.getElementById('u-password-container'),
  uRole:                    document.getElementById('u-role'),
  // (u-role options updated in admin.html)
  modalResetPassword:       document.getElementById('modal-reset-password'),
  modalResetClose:          document.getElementById('modal-reset-close'),
  btnCancelResetModal:      document.getElementById('btn-cancel-reset-modal'),
  formResetPassword:        document.getElementById('form-reset-password'),
  resetUserId:              document.getElementById('reset-user-id'),
  resetUserEmailHidden:     document.getElementById('reset-user-email-hidden'),
  resetUserName:            document.getElementById('reset-user-name'),
  modalShopHistory:         document.getElementById('modal-shop-history'),
  modalHistoryClose:        document.getElementById('modal-history-close'),
  btnCloseHistoryModal:     document.getElementById('btn-close-history-modal'),
  historyShopName:          document.getElementById('history-shop-name'),
  historyTotalBudget:       document.getElementById('history-total-budget'),
  historyTotalDisbursed:    document.getElementById('history-total-disbursed'),
  historyRemainingBudget:   document.getElementById('history-remaining-budget'),
  historyProgressBar:       document.getElementById('history-progress-bar'),
  historyTbody:             document.getElementById('history-tbody'),
  toastContainer:           document.getElementById('toast-container')
};

// =============================================================
// --- FIREBASE INITIALIZATION ---
// =============================================================
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db   = firebase.firestore();

    // Secondary app instance — used for creating new users without logging out admin
    try {
      secondaryApp = firebase.initializeApp(firebaseConfig, 'secondary');
    } catch (e) {
      secondaryApp = firebase.app('secondary');
    }
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    showLoginError('ไม่สามารถเชื่อมต่อ Firebase ได้ กรุณาตรวจสอบ firebase-config.js');
    return false;
  }
}

// =============================================================
// --- INITIALIZE APPLICATION ---
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
  initDateDisplay();
  loadSavedTheme();
  setupEventListeners();

  const ok = initFirebase();
  if (!ok) return;

  // Watch auth state changes (replaces checkAuthSession)
  auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get role & displayName from Firestore
        const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
        if (userDoc.exists && userDoc.data().disabled) {
          // Account disabled — force sign out
          await auth.signOut();
          showLoginScreen();
          showLoginError('บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
          return;
        }
        const userData = userDoc.exists ? userDoc.data() : {};
        const role = userData.role || 'admin';

        // ── ผู้บริหาร (viewer) ต้องใช้หน้า index.html ──
        if (role === 'viewer') {
          await auth.signOut();
          showLoginScreen();
          showLoginError('บัญชีนี้เป็นสิทธิ์ผู้บริหาร (View Only) กรุณาเข้าใช้งานผ่านหน้าหลัก (index.html)');
          // Redirect after 2 seconds
          setTimeout(() => { window.location.href = 'index.html'; }, 2000);
          return;
        }

        // ── ถ้าไม่มี Firestore doc → สร้าง users document อัตโนมัติ ──
        if (!userDoc.exists) {
          await db.collection('users').doc(firebaseUser.uid).set({
            email:       firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            role:        'admin',
            disabled:    false,
            createdAt:   firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('Auto-created users document for:', firebaseUser.email);
        }

        AppState.user = {
          id:          firebaseUser.uid,
          email:       firebaseUser.email,
          role:        role,
          displayName: userData.displayName || firebaseUser.displayName || firebaseUser.email
        };
        setupUserEnvironment();
      } catch (e) {
        console.error('Auth state error:', e);
        showLoginScreen();
      }
    } else {
      AppState.user = null;
      showLoginScreen();
    }
  });
});

function showLoginScreen() {
  elements.appContainer.style.display = 'none';
  elements.loginContainer.style.display = 'flex';
}

function initDateDisplay() {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (elements.todayDateText) {
    elements.todayDateText.innerText = new Date().toLocaleDateString('th-TH', dateOptions);
  }
}

function loadSavedTheme() {
  const saved = localStorage.getItem('disbursement_register_theme') || 'light';
  applyTheme(saved);
}

function showLoginError(msg) {
  if (!elements.loginErrorMsg) return;
  elements.loginErrorMsg.textContent = msg;
  elements.loginErrorMsg.style.display = msg ? 'block' : 'none';
}

// =============================================================
// --- FIREBASE ERROR MESSAGES (Thai) ---
// =============================================================
function getFirebaseErrorMessage(code) {
  const msgs = {
    'auth/invalid-email':            'รูปแบบอีเมลไม่ถูกต้อง',
    'auth/user-disabled':            'บัญชีผู้ใช้นี้ถูกปิดใช้งาน',
    'auth/user-not-found':           'ไม่พบอีเมลนี้ในระบบ',
    'auth/wrong-password':           'รหัสผ่านไม่ถูกต้อง',
    'auth/invalid-credential':       'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'auth/too-many-requests':        'ล็อกอินผิดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
    'auth/network-request-failed':   'ไม่สามารถเชื่อมต่ออินเตอร์เน็ตได้',
    'auth/email-already-in-use':     'อีเมลนี้มีในระบบแล้ว',
    'auth/weak-password':            'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'auth/operation-not-allowed':    'การดำเนินการนี้ไม่ได้รับอนุญาต',
    'auth/popup-closed-by-user':     'ปิดหน้าต่างล็อกอินก่อนเสร็จสิ้น'
  };
  return msgs[code] || `เกิดข้อผิดพลาด (${code})`;
}

// =============================================================
// --- SESSION & USER ENVIRONMENT ---
// =============================================================
function setupUserEnvironment() {
  elements.loginContainer.style.display = 'none';
  elements.appContainer.style.display   = 'flex';

  elements.userDisplayName.innerText = AppState.user.displayName;
  elements.userRoleBadge.innerText   = isAdmin()
    ? 'สิทธิ์: ผู้ดูแลระบบ (Admin) — เจ้าหน้าที่'
    : 'สิทธิ์: เจ้าหน้าที่ (ดูข้อมูลอย่างเดียว)';

  if (isAdmin()) {
    elements.menuAdminBtn.style.display = 'flex';
  } else {
    elements.menuAdminBtn.style.display = 'none';
    if (AppState.activeTab === 'admin') switchTab('dashboard');
  }

  // Hide/show edit controls based on role
  applyRoleBasedUI();
  loadBackendData();
}

function applyRoleBasedUI() {
  const admin = isAdmin();
  // Disbursements: hide add button and export for non-admin
  if (elements.btnAddDisbursement) elements.btnAddDisbursement.style.display = admin ? '' : 'none';
  // Shops: hide add button for non-admin
  if (elements.btnAddShop) elements.btnAddShop.style.display = admin ? '' : 'none';
  // Backup: show restore button only for admin
  const importWrapper = document.querySelector('.file-upload-wrapper');
  if (importWrapper) importWrapper.style.display = admin ? '' : 'none';
  const importFilename = document.getElementById('import-filename');
  if (importFilename && !admin) importFilename.style.display = 'none';
  // Show read-only banner for non-admin
  let banner = document.getElementById('readonly-banner');
  if (!admin) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'readonly-banner';
      banner.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);color:#A5B4FC;padding:10px 16px;border-radius:10px;font-size:0.82rem;z-index:9999;display:flex;align-items:center;gap:8px;backdrop-filter:blur(8px);';
      banner.innerHTML = '<i class="fa-solid fa-eye"></i> โหมดดูข้อมูลอย่างเดียว (View Only)';
      document.body.appendChild(banner);
    }
  } else if (banner) {
    banner.remove();
  }
}

async function loadBackendData() {
  try {
    showLoadingState(true);
    await Promise.all([loadShops(), loadDisbursements()]);
    switchTab(AppState.activeTab);
    showLoadingState(false);
  } catch (err) {
    console.error('loadBackendData error:', err);
    showToast('ไม่สามารถโหลดข้อมูลจาก Firestore ได้', 'danger');
    showLoadingState(false);
  }
}

function showLoadingState(loading) {
  // Simple visual feedback
  if (elements.statTotalDisbursed && loading) {
    elements.statTotalDisbursed.innerText = 'กำลังโหลด...';
  }
}

// =============================================================
// --- LOGIN / LOGOUT ---
// =============================================================
async function handleLoginSubmit(e) {
  e.preventDefault();
  const email    = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  showLoginError('');
  const btn = elements.formLogin.querySelector('button[type="submit"]');
  btn.disabled    = true;
  btn.innerHTML   = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังเข้าสู่ระบบ...';

  try {
    await auth.signInWithEmailAndPassword(email, password);
    elements.formLogin.reset();
    // onAuthStateChanged will handle navigation
  } catch (err) {
    showLoginError(getFirebaseErrorMessage(err.code));
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ';
  }
}

async function handleLogoutClick() {
  if (!confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) return;
  try {
    await auth.signOut();
    showToast('ออกจากระบบสำเร็จแล้ว', 'success');
  } catch (err) {
    showToast('ไม่สามารถออกจากระบบได้', 'danger');
  }
}

// =============================================================
// --- FIRESTORE: SHOPS ---
// =============================================================
async function loadShops() {
  const snap = await db.collection('shops').orderBy('name').get();
  AppState.shops = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function firestoreAddShop(shopData) {
  const ref = await db.collection('shops').add(shopData);
  return { id: ref.id, ...shopData };
}

async function firestoreUpdateShop(id, fields) {
  await db.collection('shops').doc(id).update(fields);
  return { id, ...fields };
}

async function firestoreDeleteShop(id) {
  await db.collection('shops').doc(id).delete();
}

// =============================================================
// --- FIRESTORE: DISBURSEMENTS ---
// =============================================================
async function loadDisbursements() {
  const snap = await db.collection('disbursements').orderBy('date', 'desc').get();
  AppState.disbursements = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function firestoreAddDisbursement(record) {
  const ref = await db.collection('disbursements').add(record);
  return { id: ref.id, ...record };
}

async function firestoreUpdateDisbursement(id, fields) {
  await db.collection('disbursements').doc(id).update(fields);
}

async function firestoreDeleteDisbursement(id) {
  await db.collection('disbursements').doc(id).delete();
}

// =============================================================
// --- FIRESTORE: USERS (ADMIN PANEL) ---
// =============================================================
async function firestoreGetUsers() {
  const snap = await db.collection('users').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function firestoreAddUser(email, password, displayName, role) {
  const secondaryAuth = secondaryApp.auth();
  const cred = await secondaryAuth.createUserWithEmailAndPassword(email, password);
  const uid  = cred.user.uid;
  await secondaryAuth.signOut();

  const userData = {
    email,
    displayName,
    role,
    disabled:  false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  await db.collection('users').doc(uid).set(userData);
  return { id: uid, ...userData };
}

async function firestoreDisableUser(userId) {
  await db.collection('users').doc(userId).update({ disabled: true });
}

async function firestoreSendPasswordReset(email) {
  await auth.sendPasswordResetEmail(email);
}

// =============================================================
// --- THEME ---
// =============================================================
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  AppState.theme = theme;
  localStorage.setItem('disbursement_register_theme', theme);
  if (theme === 'dark') {
    elements.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span id="theme-text">โหมดสว่าง (Light Mode)</span>';
  } else {
    elements.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span id="theme-text">โหมดมืด (Dark Mode)</span>';
  }
}

function handleThemeToggle() {
  applyTheme(AppState.theme === 'light' ? 'dark' : 'light');
}

// =============================================================
// --- TAB NAVIGATION ---
// =============================================================
function switchTab(tabName) {
  AppState.activeTab = tabName;
  elements.tabContents.forEach(tc => tc.classList.remove('active'));
  elements.menuItems.forEach(mi => mi.classList.remove('active'));

  const targetSection = document.getElementById(`tab-${tabName}`);
  if (targetSection) targetSection.classList.add('active');

  const activeMenu = document.querySelector(`.menu-item[data-tab="${tabName}"]`);
  if (activeMenu) activeMenu.classList.add('active');

  const tabInfo = {
    dashboard:     { title: 'แผงควบคุม (Dashboard)', subtitle: 'สรุปภาพรวมและสถิติการเบิกจ่ายเงินให้กับร้านค้าต่าง ๆ' },
    disbursements: { title: 'ทะเบียนคุมเบิกจ่าย', subtitle: 'ดูและจัดการรายการเบิกจ่ายเงินทั้งหมด กรองตามเงื่อนไขต่าง ๆ ได้' },
    shops:         { title: 'จัดการร้านค้า', subtitle: 'ขึ้นทะเบียนและจัดการข้อมูลร้านค้าคู่ค้าทั้งหมดในระบบ' },
    backup:        { title: 'สำรองและกู้คืนข้อมูล', subtitle: 'ดาวน์โหลดสำรองข้อมูลหรือนำเข้าข้อมูลที่เคยบันทึกไว้' },
    admin:         { title: 'จัดการระบบ (Admin)', subtitle: 'จัดการผู้ใช้งานและสิทธิ์การเข้าถึงระบบ (เฉพาะแอดมินเท่านั้น)' }
  };
  const info = tabInfo[tabName] || { title: tabName, subtitle: '' };
  if (elements.pageTitle)    elements.pageTitle.innerText    = info.title;
  if (elements.pageSubtitle) elements.pageSubtitle.innerText = info.subtitle;

  // Render specific tab content
  if (tabName === 'dashboard')     renderDashboard();
  if (tabName === 'disbursements') renderDisbursementsTab();
  if (tabName === 'shops')         renderShopsTab();
  if (tabName === 'admin')         renderAdminTab();
}

// =============================================================
// --- DASHBOARD ---
// =============================================================
function renderDashboard() {
  const d = AppState.disbursements;
  const paid    = d.filter(r => r.status === 'Paid');
  const pending = d.filter(r => r.status === 'Pending');
  const total   = d.reduce((s, r) => s + (r.netAmount || 0), 0);
  const paidSum = paid.reduce((s, r) => s + (r.netAmount || 0), 0);
  const pendSum = pending.reduce((s, r) => s + (r.netAmount || 0), 0);

  if (elements.statTotalDisbursed) elements.statTotalDisbursed.innerText = formatCurrency(total);
  if (elements.statTotalPaid)      elements.statTotalPaid.innerText      = formatCurrency(paidSum);
  if (elements.statPaidCount)      elements.statPaidCount.innerText      = `${paid.length} รายการ`;
  if (elements.statTotalPending)   elements.statTotalPending.innerText   = formatCurrency(pendSum);
  if (elements.statPendingCount)   elements.statPendingCount.innerText   = `${pending.length} รายการ`;
  if (elements.statTotalShops)     elements.statTotalShops.innerText     = AppState.shops.length;

  renderRecentTable();
  renderCharts();
}

function renderRecentTable() {
  const recent = [...AppState.disbursements]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  const tbody = elements.recentDisbursementsTbody;
  if (!tbody) return;

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">ไม่มีข้อมูลการเบิกจ่าย</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(r => {
    const shop = AppState.shops.find(s => s.id === r.shopId);
    return `<tr>
      <td>${formatDate(r.date)}</td>
      <td><code>${r.ref}</code></td>
      <td>${shop ? shop.name : '<span class="text-muted">ไม่พบร้านค้า</span>'}</td>
      <td>${r.details}</td>
      <td class="text-right">${formatCurrency(r.netAmount)}</td>
      <td>${r.paymentMethod}</td>
      <td>${getStatusBadge(r.status)}</td>
    </tr>`;
  }).join('');
}

function renderCharts() {
  renderMonthlyChart();
  renderShopChart();
}

function renderMonthlyChart() {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;
  if (AppState.charts.monthly) { AppState.charts.monthly.destroy(); }

  const monthlyData = {};
  AppState.disbursements.forEach(r => {
    if (!r.date) return;
    const key = r.date.substring(0, 7);
    monthlyData[key] = (monthlyData[key] || 0) + (r.netAmount || 0);
  });

  const sortedKeys   = Object.keys(monthlyData).sort();
  const last6        = sortedKeys.slice(-6);
  const labels       = last6.map(k => {
    const [y, m] = k.split('-');
    const d = new Date(parseInt(y), parseInt(m) - 1, 1);
    return d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
  });
  const values = last6.map(k => monthlyData[k]);

  AppState.charts.monthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'ยอดเบิกจ่ายสุทธิ (บาท)',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.75)',
        borderColor:     'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => '฿' + v.toLocaleString('th-TH') } } }
    }
  });
}

function renderShopChart() {
  const ctx = document.getElementById('shopChart');
  if (!ctx) return;
  if (AppState.charts.shop) { AppState.charts.shop.destroy(); }

  const shopTotals = {};
  AppState.disbursements.forEach(r => {
    if (!r.shopId) return;
    shopTotals[r.shopId] = (shopTotals[r.shopId] || 0) + (r.netAmount || 0);
  });

  const sorted = Object.entries(shopTotals)
    .sort((a, b) => b[1] - a[1]).slice(0, 6);

  const labels = sorted.map(([id]) => {
    const shop = AppState.shops.find(s => s.id === id);
    return shop ? shop.name.substring(0, 20) : id;
  });
  const values = sorted.map(([, v]) => v);
  const palette = ['#6366F1','#22D3EE','#10B981','#F59E0B','#EF4444','#8B5CF6'];

  AppState.charts.shop = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: palette, borderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => ` ${formatCurrency(ctx.raw)}` } }
      }
    }
  });
}

// =============================================================
// --- DISBURSEMENTS TAB ---
// =============================================================
function renderDisbursementsTab() {
  populateShopFilterDropdown();
  renderDisbursementsTable();
}

function getFilteredDisbursements() {
  const { search, shop, status, startDate, endDate } = AppState.filters;
  return AppState.disbursements.filter(r => {
    const shopObj  = AppState.shops.find(s => s.id === r.shopId);
    const shopName = shopObj ? shopObj.name.toLowerCase() : '';
    const q        = search.toLowerCase();
    if (search && !r.ref.toLowerCase().includes(q) && !r.details.toLowerCase().includes(q) && !shopName.includes(q)) return false;
    if (shop   && r.shopId !== shop)   return false;
    if (status && r.status !== status) return false;
    if (startDate && r.date < startDate) return false;
    if (endDate   && r.date > endDate)   return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderDisbursementsTable() {
  const filtered  = getFilteredDisbursements();
  const { currentPage, pageSize } = AppState.pagination;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page       = Math.min(currentPage, totalPages);
  AppState.pagination.currentPage = page;

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (elements.filteredRecordsCount) {
    elements.filteredRecordsCount.innerText = `${filtered.length} รายการ`;
  }

  const tbody = elements.disbursementsTbody;
  if (!tbody) return;

  if (pageData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="11" class="text-center text-muted py-4">ไม่พบรายการตามเงื่อนไขที่กำหนด</td></tr>';
  } else {
    tbody.innerHTML = pageData.map(r => {
      const shop = AppState.shops.find(s => s.id === r.shopId);
      const actionCell = isAdmin()
        ? `<td class="text-center">
            <button class="btn btn-sm btn-secondary" onclick="openEditDisbursementModal('${r.id}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-sm btn-danger" onclick="handleDeleteDisbursement('${r.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
          </td>`
        : `<td class="text-center"><span class="text-muted" style="font-size:0.78rem;"><i class="fa-solid fa-eye"></i> ดูอย่างเดียว</span></td>`;
      return `<tr>
        <td>${formatDate(r.date)}</td>
        <td><code>${r.ref}</code></td>
        <td>${shop ? shop.name : '<span class="text-muted">N/A</span>'}</td>
        <td>${r.details}</td>
        <td class="text-right">${formatCurrency(r.subtotal)}</td>
        <td class="text-right">${r.vatType === 'none' ? '-' : formatCurrency(r.vatAmount)}</td>
        <td class="text-right">${r.whtRate > 0 ? `(${formatCurrency(r.whtAmount)})` : '-'}</td>
        <td class="text-right font-weight-bold">${formatCurrency(r.netAmount)}</td>
        <td>${r.paymentMethod}</td>
        <td>${getStatusBadge(r.status)}</td>
        ${actionCell}
      </tr>`;
    }).join('');
  }

  renderPagination(filtered.length, page, pageSize);
}

function renderPagination(total, currentPage, pageSize) {
  const container = elements.paginationContainer;
  if (!container) return;
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && (i > 2 && i < currentPage - 1)) { if (i === 3) html += `<span class="page-ellipsis">…</span>`; continue; }
    if (totalPages > 7 && (i > currentPage + 1 && i < totalPages - 1)) { if (i === currentPage + 2) html += `<span class="page-ellipsis">…</span>`; continue; }
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>`;
  container.innerHTML = html;
}

function changePage(page) {
  AppState.pagination.currentPage = page;
  renderDisbursementsTable();
}

function populateShopFilterDropdown() {
  if (!elements.filterShop) return;
  const current = elements.filterShop.value;
  elements.filterShop.innerHTML = '<option value="">ทั้งหมด</option>' +
    AppState.shops.map(s => `<option value="${s.id}" ${current === s.id ? 'selected' : ''}>${s.name}</option>`).join('');
}

// =============================================================
// --- DISBURSEMENT MODAL ---
// =============================================================
function openAddDisbursementModal() {
  elements.modalDisbursementTitle.innerText = 'เพิ่มรายการเบิกจ่ายเงิน';
  elements.formDisbursement.reset();
  elements.dId.value = '';
  elements.dDate.value = new Date().toISOString().substring(0, 10);
  if (elements.budgetWarningBanner) elements.budgetWarningBanner.style.display = 'none';

  // Populate shop dropdown in modal
  elements.dShop.innerHTML = '<option value="">-- เลือกร้านค้า --</option>' +
    AppState.shops.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

  updateDisbursementCalculation();
  elements.modalDisbursement.classList.add('active');
}

function openEditDisbursementModal(id) {
  const r = AppState.disbursements.find(d => d.id === id);
  if (!r) return;

  elements.modalDisbursementTitle.innerText = 'แก้ไขรายการเบิกจ่าย';
  elements.dId.value          = r.id;
  elements.dDate.value        = r.date;
  elements.dRef.value         = r.ref;
  elements.dDetails.value     = r.details;
  elements.dSubtotal.value    = r.subtotal;
  elements.dVatType.value     = r.vatType;
  elements.dWhtRate.value     = r.whtRate;
  elements.dPaymentMethod.value = r.paymentMethod;
  elements.dStatus.value      = r.status;

  elements.dShop.innerHTML = '<option value="">-- เลือกร้านค้า --</option>' +
    AppState.shops.map(s => `<option value="${s.id}" ${s.id === r.shopId ? 'selected' : ''}>${s.name}</option>`).join('');

  if (elements.budgetWarningBanner) elements.budgetWarningBanner.style.display = 'none';
  updateDisbursementCalculation();
  elements.modalDisbursement.classList.add('active');
}

function updateDisbursementCalculation() {
  const subtotal = parseFloat(elements.dSubtotal?.value) || 0;
  const vatType  = elements.dVatType?.value || 'none';
  const whtRate  = parseInt(elements.dWhtRate?.value) || 0;

  let vatAmount = 0;
  if (vatType === 'exclude') vatAmount = subtotal * 0.07;
  if (vatType === 'include') vatAmount = subtotal - (subtotal / 1.07);

  const whtBase  = vatType === 'exclude' ? subtotal : (vatType === 'include' ? subtotal / 1.07 : subtotal);
  const whtAmount = whtBase * (whtRate / 100);
  const net       = subtotal + (vatType === 'exclude' ? vatAmount : 0) - whtAmount;

  if (elements.calcSubtotal) elements.calcSubtotal.innerText = formatCurrency(subtotal);
  if (elements.calcVat)      elements.calcVat.innerText      = vatType === 'none' ? '฿0.00' : formatCurrency(vatAmount);
  if (elements.calcWht)      elements.calcWht.innerText      = whtRate > 0 ? `(${formatCurrency(whtAmount)})` : '฿0.00';
  if (elements.calcNet)      elements.calcNet.innerText      = formatCurrency(net);

  // Budget warning
  const shopId = elements.dShop?.value;
  if (shopId) {
    const shop = AppState.shops.find(s => s.id === shopId);
    const currentId = elements.dId.value;
    const totalUsed = AppState.disbursements
      .filter(d => d.shopId === shopId && d.id !== currentId && d.status !== 'Cancelled')
      .reduce((s, d) => s + (d.netAmount || 0), 0);
    const remaining = (shop?.totalBudget || 0) - totalUsed;

    if (elements.budgetWarningBanner && elements.warnRemainingBudget) {
      if (net > remaining) {
        elements.warnRemainingBudget.innerText = formatCurrency(remaining);
        elements.budgetWarningBanner.style.display = 'flex';
      } else {
        elements.budgetWarningBanner.style.display = 'none';
      }
    }
  }
}

async function handleDisbursementFormSubmit(e) {
  e.preventDefault();
  const subtotal  = parseFloat(elements.dSubtotal.value) || 0;
  const vatType   = elements.dVatType.value;
  const whtRate   = parseInt(elements.dWhtRate.value) || 0;
  let vatAmount   = 0;
  if (vatType === 'exclude') vatAmount = parseFloat((subtotal * 0.07).toFixed(2));
  if (vatType === 'include') vatAmount = parseFloat((subtotal - subtotal / 1.07).toFixed(2));
  const whtBase   = vatType === 'exclude' ? subtotal : (vatType === 'include' ? subtotal / 1.07 : subtotal);
  const whtAmount = parseFloat((whtBase * whtRate / 100).toFixed(2));
  const netAmount = parseFloat((subtotal + (vatType === 'exclude' ? vatAmount : 0) - whtAmount).toFixed(2));

  const record = {
    date:          elements.dDate.value,
    ref:           elements.dRef.value.trim(),
    shopId:        elements.dShop.value,
    details:       elements.dDetails.value.trim(),
    subtotal, vatType, vatAmount, whtRate, whtAmount, netAmount,
    paymentMethod: elements.dPaymentMethod.value,
    status:        elements.dStatus.value
  };

  try {
    const editId = elements.dId.value;
    if (editId) {
      await firestoreUpdateDisbursement(editId, record);
      const idx = AppState.disbursements.findIndex(d => d.id === editId);
      if (idx !== -1) AppState.disbursements[idx] = { id: editId, ...record };
      showToast('แก้ไขรายการเบิกจ่ายสำเร็จ', 'success');
    } else {
      const added = await firestoreAddDisbursement(record);
      AppState.disbursements.unshift(added);
      showToast('เพิ่มรายการเบิกจ่ายสำเร็จ', 'success');
    }
    closeModal(elements.modalDisbursement);
    renderDisbursementsTable();
    renderDashboard();
  } catch (err) {
    console.error(err);
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'danger');
  }
}

async function handleDeleteDisbursement(id) {
  if (!confirm('ยืนยันการลบรายการนี้ใช่หรือไม่?')) return;
  try {
    await firestoreDeleteDisbursement(id);
    AppState.disbursements = AppState.disbursements.filter(d => d.id !== id);
    showToast('ลบรายการสำเร็จ', 'success');
    renderDisbursementsTable();
    renderDashboard();
  } catch (err) {
    showToast('ไม่สามารถลบได้: ' + err.message, 'danger');
  }
}

// =============================================================
// --- SHOPS TAB ---
// =============================================================
function renderShopsTab() {
  const container = elements.shopsListContainer;
  if (!container) return;

  if (AppState.shops.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-store-slash fa-3x text-muted mb-3"></i><p class="text-muted">ยังไม่มีร้านค้าในระบบ กดปุ่ม "เพิ่มทะเบียนร้านค้าใหม่" เพื่อเริ่มต้น</p></div>`;
    return;
  }

  container.innerHTML = AppState.shops.map(shop => {
    const totalUsed = AppState.disbursements
      .filter(d => d.shopId === shop.id && d.status !== 'Cancelled')
      .reduce((s, d) => s + (d.netAmount || 0), 0);
    const budget    = shop.totalBudget || 0;
    const remaining = budget - totalUsed;
    const pct       = budget > 0 ? Math.min(100, (totalUsed / budget) * 100) : 0;
    const barColor  = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--primary)';

    const shopActionBtns = isAdmin()
      ? `<button class="btn btn-sm btn-secondary" onclick="openShopHistoryModal('${shop.id}')" title="ประวัติ"><i class="fa-solid fa-clock-rotate-left"></i></button>
         <button class="btn btn-sm btn-secondary" onclick="openEditShopModal('${shop.id}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
         <button class="btn btn-sm btn-danger" onclick="handleDeleteShop('${shop.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>`
      : `<button class="btn btn-sm btn-secondary" onclick="openShopHistoryModal('${shop.id}')" title="ประวัติการเบิกจ่าย"><i class="fa-solid fa-clock-rotate-left"></i> ดูประวัติ</button>`;

    return `
    <div class="shop-card">
      <div class="shop-card-header">
        <div class="shop-name-area">
          <i class="fa-solid fa-store text-primary"></i>
          <h3>${shop.name}</h3>
        </div>
        <div class="shop-actions">
          ${shopActionBtns}
        </div>
      </div>
      <div class="shop-card-body">
        ${shop.taxId ? `<p><i class="fa-solid fa-id-card text-muted"></i> เลขผู้เสียภาษี: <strong>${shop.taxId}</strong></p>` : ''}
        ${shop.bankName ? `<p><i class="fa-solid fa-building-columns text-muted"></i> ${shop.bankName} - ${shop.bankAccount || '-'}</p>` : ''}
        ${shop.phone ? `<p><i class="fa-solid fa-phone text-muted"></i> ${shop.phone}</p>` : ''}
        ${shop.address ? `<p><i class="fa-solid fa-location-dot text-muted"></i> ${shop.address}</p>` : ''}
      </div>
      <div class="shop-card-footer">
        <div class="budget-info">
          <div class="budget-row">
            <span>งบประมาณ: <strong>${formatCurrency(budget)}</strong></span>
            <span>ใช้ไป: <strong class="text-danger">${formatCurrency(totalUsed)}</strong></span>
            <span>คงเหลือ: <strong class="${remaining < 0 ? 'text-danger' : 'text-success'}">${formatCurrency(remaining)}</strong></span>
          </div>
          <div class="budget-progress-bar" style="background:var(--bg-app); height:8px; border-radius:var(--radius-full); overflow:hidden; margin-top:8px;">
            <div style="width:${pct}%; height:100%; background:${barColor}; transition:width 0.4s ease; border-radius:var(--radius-full);"></div>
          </div>
          <small class="text-muted">${pct.toFixed(1)}% ของงบประมาณทั้งหมด</small>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddShopModal() {
  elements.modalShopTitle.innerText = 'ขึ้นทะเบียนร้านค้าใหม่';
  elements.formShop.reset();
  elements.sId.value = '';
  elements.modalShop.classList.add('active');
}

function openEditShopModal(id) {
  const shop = AppState.shops.find(s => s.id === id);
  if (!shop) return;
  elements.modalShopTitle.innerText = 'แก้ไขข้อมูลร้านค้า';
  elements.sId.value          = shop.id;
  elements.sName.value        = shop.name;
  elements.sBudget.value      = shop.totalBudget;
  elements.sTaxId.value       = shop.taxId       || '';
  elements.sBankName.value    = shop.bankName    || '';
  elements.sBankAccount.value = shop.bankAccount || '';
  elements.sPhone.value       = shop.phone       || '';
  elements.sEmail.value       = shop.email       || '';
  elements.sAddress.value     = shop.address     || '';
  elements.modalShop.classList.add('active');
}

async function handleShopFormSubmit(e) {
  e.preventDefault();
  const shopData = {
    name:        elements.sName.value.trim(),
    totalBudget: parseFloat(elements.sBudget.value) || 0,
    taxId:       elements.sTaxId.value.trim(),
    bankName:    elements.sBankName.value,
    bankAccount: elements.sBankAccount.value.trim(),
    phone:       elements.sPhone.value.trim(),
    email:       elements.sEmail.value.trim(),
    address:     elements.sAddress.value.trim()
  };

  try {
    const editId = elements.sId.value;
    if (editId) {
      await firestoreUpdateShop(editId, shopData);
      const idx = AppState.shops.findIndex(s => s.id === editId);
      if (idx !== -1) AppState.shops[idx] = { id: editId, ...shopData };
      showToast('อัพเดทข้อมูลร้านค้าสำเร็จ', 'success');
    } else {
      const added = await firestoreAddShop(shopData);
      AppState.shops.push(added);
      AppState.shops.sort((a, b) => a.name.localeCompare(b.name, 'th'));
      showToast('เพิ่มร้านค้าสำเร็จ', 'success');
    }
    closeModal(elements.modalShop);
    renderShopsTab();
    populateShopFilterDropdown();
  } catch (err) {
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'danger');
  }
}

async function handleDeleteShop(id) {
  const referenced = AppState.disbursements.some(d => d.shopId === id);
  if (referenced) {
    showToast('ไม่สามารถลบร้านค้านี้ได้ เนื่องจากมีประวัติการเบิกจ่ายผูกไว้', 'warning');
    return;
  }
  if (!confirm('ยืนยันการลบร้านค้านี้ใช่หรือไม่?')) return;
  try {
    await firestoreDeleteShop(id);
    AppState.shops = AppState.shops.filter(s => s.id !== id);
    showToast('ลบร้านค้าสำเร็จ', 'success');
    renderShopsTab();
  } catch (err) {
    showToast('ไม่สามารถลบได้: ' + err.message, 'danger');
  }
}

// --- Shop History Modal ---
function openShopHistoryModal(shopId) {
  const shop = AppState.shops.find(s => s.id === shopId);
  if (!shop) return;

  const shopDisbursements = AppState.disbursements
    .filter(d => d.shopId === shopId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalUsed  = shopDisbursements
    .filter(d => d.status !== 'Cancelled')
    .reduce((s, d) => s + (d.netAmount || 0), 0);
  const budget     = shop.totalBudget || 0;
  const remaining  = budget - totalUsed;
  const pct        = budget > 0 ? Math.min(100, (totalUsed / budget) * 100) : 0;

  elements.historyShopName.innerText      = `ประวัติการเบิกจ่าย: ${shop.name}`;
  elements.historyTotalBudget.innerText   = formatCurrency(budget);
  elements.historyTotalDisbursed.innerText = formatCurrency(totalUsed);
  elements.historyRemainingBudget.innerText = formatCurrency(remaining);
  elements.historyProgressBar.style.width = `${pct}%`;
  elements.historyProgressBar.style.backgroundColor = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--primary)';

  if (shopDisbursements.length === 0) {
    elements.historyTbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">ไม่มีประวัติการเบิกจ่ายของร้านค้านี้</td></tr>';
  } else {
    elements.historyTbody.innerHTML = shopDisbursements.map(r => `<tr>
      <td>${formatDate(r.date)}</td>
      <td><code>${r.ref}</code></td>
      <td>${r.details}</td>
      <td class="text-right">${formatCurrency(r.subtotal)}</td>
      <td class="text-right font-weight-bold">${formatCurrency(r.netAmount)}</td>
      <td>${getStatusBadge(r.status)}</td>
    </tr>`).join('');
  }

  elements.modalShopHistory.classList.add('active');
}

// =============================================================
// --- ADMIN TAB (USER MANAGEMENT) ---
// =============================================================
async function renderAdminTab() {
  if (!AppState.user || AppState.user.role !== 'admin') return;
  const tbody = elements.adminUsersTbody;
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">กำลังโหลด...</td></tr>';

  try {
    const users = await firestoreGetUsers();
    const active = users.filter(u => !u.disabled);
    if (active.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">ไม่มีผู้ใช้งาน</td></tr>';
      return;
    }
    tbody.innerHTML = active.map(u => `
      <tr>
        <td><code>${u.email || '-'}</code></td>
        <td>${u.displayName || '-'}</td>
        <td>${u.role === 'admin' ? '<span class="badge badge-danger">Admin</span>' : '<span class="badge badge-info">พนักงาน</span>'}</td>
        <td class="text-center">
          ${u.id !== AppState.user.id ? `
          <button class="btn btn-sm btn-secondary" onclick="openResetPasswordModal('${u.id}', '${u.email}', '${(u.displayName||'').replace(/'/g,"\\'")}')">
            <i class="fa-solid fa-key"></i> รีเซ็ตรหัสผ่าน
          </button>
          <button class="btn btn-sm btn-danger" onclick="handleDeleteUser('${u.id}', '${(u.displayName||'').replace(/'/g,"\\'")}')">
            <i class="fa-solid fa-user-slash"></i> ปิดใช้งาน
          </button>` : '<span class="text-muted">(บัญชีของคุณ)</span>'}
        </td>
      </tr>`).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-3">เกิดข้อผิดพลาด: ${err.message}</td></tr>`;
  }
}

function openAddUserModal() {
  elements.modalUserTitle.innerText = 'เพิ่มผู้ใช้งานใหม่';
  elements.formUser.reset();
  elements.uPasswordContainer.style.display = 'block';
  elements.uPassword.required = true;
  elements.modalUser.classList.add('active');
}

async function handleUserFormSubmit(e) {
  e.preventDefault();
  const email       = elements.uEmail.value.trim();
  const displayName = elements.uDisplayName.value.trim();
  const password    = elements.uPassword.value;
  const role        = elements.uRole.value;

  if (!email || !displayName || !password) {
    showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
    return;
  }

  const btn = elements.formUser.querySelector('button[type="submit"]');
  btn.disabled  = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> กำลังสร้าง...';

  try {
    await firestoreAddUser(email, password, displayName, role);
    showToast(`เพิ่มผู้ใช้งาน "${displayName}" สำเร็จ`, 'success');
    closeModal(elements.modalUser);
    renderAdminTab();
  } catch (err) {
    showToast('เกิดข้อผิดพลาด: ' + getFirebaseErrorMessage(err.code), 'danger');
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกสมาชิก';
  }
}

function openResetPasswordModal(userId, email, displayName) {
  elements.resetUserId.value          = userId;
  elements.resetUserEmailHidden.value = email;
  elements.resetUserName.innerText    = `${displayName} (${email})`;
  elements.modalResetPassword.classList.add('active');
}

async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  const email = elements.resetUserEmailHidden.value;
  if (!email) { showToast('ไม่พบอีเมลของผู้ใช้', 'danger'); return; }

  try {
    await firestoreSendPasswordReset(email);
    showToast(`ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง ${email} สำเร็จแล้ว`, 'success');
    closeModal(elements.modalResetPassword);
  } catch (err) {
    showToast('ไม่สามารถส่งอีเมลได้: ' + getFirebaseErrorMessage(err.code), 'danger');
  }
}

async function handleDeleteUser(userId, displayName) {
  if (!confirm(`ยืนยันการปิดใช้งานบัญชี "${displayName}" ใช่หรือไม่?\n(ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก)`)) return;
  try {
    await firestoreDisableUser(userId);
    showToast(`ปิดใช้งานบัญชี "${displayName}" สำเร็จ`, 'success');
    renderAdminTab();
  } catch (err) {
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'danger');
  }
}

// =============================================================
// --- BACKUP & RESTORE ---
// =============================================================
async function handleExportBackup() {
  try {
    const data = {
      version:    '3.0.0-firebase',
      exportedAt: new Date().toISOString(),
      shops:         AppState.shops,
      disbursements: AppState.disbursements
    };
    const blob     = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `backup_${new Date().toISOString().replace(/[:.]/g,'-').substring(0,19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ', 'success');
  } catch (err) {
    showToast('เกิดข้อผิดพลาด: ' + err.message, 'danger');
  }
}

function handleImportTrigger() {
  if (AppState.user?.role !== 'admin') {
    showToast('เฉพาะแอดมินเท่านั้นที่สามารถกู้คืนข้อมูลได้', 'warning');
    return;
  }
  elements.importFileInput.click();
}

function handleImportFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (elements.importFilename) elements.importFilename.innerText = file.name;

  if (!confirm(`ยืนยันการนำเข้าไฟล์ "${file.name}"?\n⚠️ ข้อมูลร้านค้าและการเบิกจ่ายปัจจุบันทั้งหมดใน Firestore จะถูกเขียนทับ!`)) {
    e.target.value = '';
    if (elements.importFilename) elements.importFilename.innerText = 'ยังไม่ได้เลือกไฟล์';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!parsed.shops || !parsed.disbursements) throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');

      showToast('กำลังนำเข้าข้อมูล...', 'info');
      await restoreToFirestore(parsed.shops, parsed.disbursements);

      // Reload data
      await loadBackendData();
      showToast('กู้คืนข้อมูลสำรองสำเร็จ!', 'success');
    } catch (err) {
      showToast('นำเข้าไม่สำเร็จ: ' + err.message, 'danger');
    }
    e.target.value = '';
    if (elements.importFilename) elements.importFilename.innerText = 'ยังไม่ได้เลือกไฟล์';
  };
  reader.readAsText(file);
}

async function restoreToFirestore(shops, disbursements) {
  const batch = db.batch();

  // Delete existing shops & disbursements
  const [existShops, existDisb] = await Promise.all([
    db.collection('shops').get(),
    db.collection('disbursements').get()
  ]);
  existShops.docs.forEach(d => batch.delete(d.ref));
  existDisb.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();

  // Write new data
  const batch2 = db.batch();
  shops.forEach(s => {
    const { id, ...data } = s;
    batch2.set(db.collection('shops').doc(id), data);
  });
  disbursements.forEach(d => {
    const { id, ...data } = d;
    batch2.set(db.collection('disbursements').doc(id), data);
  });
  await batch2.commit();
}

// =============================================================
// --- CSV EXPORT ---
// =============================================================
function handleExportCsv() {
  const filtered = getFilteredDisbursements();
  if (filtered.length === 0) { showToast('ไม่มีข้อมูลสำหรับส่งออก', 'warning'); return; }

  const headers = ['วันที่','เลขที่เอกสาร','ร้านค้า','รายละเอียด','ยอดก่อนภาษี','VAT','หัก ณ ที่จ่าย','ยอดสุทธิ','ช่องทางการจ่าย','สถานะ'];
  const rows = filtered.map(r => {
    const shop = AppState.shops.find(s => s.id === r.shopId);
    return [
      r.date, r.ref, shop ? shop.name : '',
      `"${r.details.replace(/"/g, '""')}"`,
      r.subtotal, r.vatAmount, r.whtAmount, r.netAmount,
      r.paymentMethod, r.status
    ].join(',');
  });

  const csv  = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `disbursements_${new Date().toISOString().substring(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('ส่งออก CSV สำเร็จ', 'success');
}

// =============================================================
// --- MODAL UTILITIES ---
// =============================================================
function closeModal(modalEl) {
  if (modalEl) modalEl.classList.remove('active');
}

function closeAllModals() {
  document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
}

// =============================================================
// --- TOAST NOTIFICATIONS ---
// =============================================================
function showToast(message, type = 'info') {
  const container = elements.toastContainer;
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success:'fa-circle-check', danger:'fa-circle-xmark', warning:'fa-triangle-exclamation', info:'fa-circle-info' };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// =============================================================
// --- UTILITY FUNCTIONS ---
// =============================================================
function formatCurrency(v) {
  return '฿' + (parseFloat(v) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

function getStatusBadge(status) {
  const map = {
    'Paid':      '<span class="badge badge-success">จ่ายแล้ว</span>',
    'Pending':   '<span class="badge badge-warning">รอดำเนินการ</span>',
    'Cancelled': '<span class="badge badge-secondary">ยกเลิก</span>'
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

// =============================================================
// --- EVENT LISTENERS SETUP ---
// =============================================================
function setupEventListeners() {
  // Login
  elements.formLogin?.addEventListener('submit', handleLoginSubmit);
  elements.btnLogout?.addEventListener('click', handleLogoutClick);
  elements.themeToggleBtn?.addEventListener('click', handleThemeToggle);

  // Tab navigation
  elements.menuItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // Disbursement filters
  elements.filterSearch?.addEventListener('input', () => {
    AppState.filters.search = elements.filterSearch.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  elements.filterShop?.addEventListener('change', () => {
    AppState.filters.shop = elements.filterShop.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  elements.filterStatus?.addEventListener('change', () => {
    AppState.filters.status = elements.filterStatus.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  elements.filterStartDate?.addEventListener('change', () => {
    AppState.filters.startDate = elements.filterStartDate.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  elements.filterEndDate?.addEventListener('change', () => {
    AppState.filters.endDate = elements.filterEndDate.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  elements.btnClearFilters?.addEventListener('click', () => {
    AppState.filters = { search: '', shop: '', status: '', startDate: '', endDate: '' };
    AppState.pagination.currentPage = 1;
    elements.filterSearch.value    = '';
    elements.filterShop.value      = '';
    elements.filterStatus.value    = '';
    elements.filterStartDate.value = '';
    elements.filterEndDate.value   = '';
    renderDisbursementsTable();
  });

  // Disbursement modal
  elements.btnAddDisbursement?.addEventListener('click', openAddDisbursementModal);
  elements.modalDisbursementClose?.addEventListener('click', () => closeModal(elements.modalDisbursement));
  elements.btnCancelDisbursementModal?.addEventListener('click', () => closeModal(elements.modalDisbursement));
  elements.formDisbursement?.addEventListener('submit', handleDisbursementFormSubmit);
  elements.dSubtotal?.addEventListener('input', updateDisbursementCalculation);
  elements.dVatType?.addEventListener('change', updateDisbursementCalculation);
  elements.dWhtRate?.addEventListener('change', updateDisbursementCalculation);
  elements.dShop?.addEventListener('change', updateDisbursementCalculation);
  elements.btnExportCsv?.addEventListener('click', handleExportCsv);

  // Shop modal
  elements.btnAddShop?.addEventListener('click', openAddShopModal);
  elements.modalShopClose?.addEventListener('click', () => closeModal(elements.modalShop));
  elements.btnCancelShopModal?.addEventListener('click', () => closeModal(elements.modalShop));
  elements.formShop?.addEventListener('submit', handleShopFormSubmit);

  // Admin / User modal
  elements.btnAddUser?.addEventListener('click', openAddUserModal);
  elements.modalUserClose?.addEventListener('click', () => closeModal(elements.modalUser));
  elements.btnCancelUserModal?.addEventListener('click', () => closeModal(elements.modalUser));
  elements.formUser?.addEventListener('submit', handleUserFormSubmit);

  // Reset password modal
  elements.modalResetClose?.addEventListener('click', () => closeModal(elements.modalResetPassword));
  elements.btnCancelResetModal?.addEventListener('click', () => closeModal(elements.modalResetPassword));
  elements.formResetPassword?.addEventListener('submit', handleResetPasswordSubmit);

  // Shop History modal
  elements.modalHistoryClose?.addEventListener('click', () => closeModal(elements.modalShopHistory));
  elements.btnCloseHistoryModal?.addEventListener('click', () => closeModal(elements.modalShopHistory));

  // Backup & Restore
  elements.btnExportBackup?.addEventListener('click', handleExportBackup);
  elements.btnTriggerImport?.addEventListener('click', handleImportTrigger);
  elements.importFileInput?.addEventListener('change', handleImportFileSelect);

  // Close modal on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Keyboard ESC closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });
}
