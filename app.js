// Application State Manager
const AppState = {
  user: null, // Logged in user info
  shops: [],
  disbursements: [],
  activeTab: 'dashboard',
  theme: 'light',
  filters: {
    search: '',
    shop: '',
    status: '',
    startDate: '',
    endDate: ''
  },
  pagination: {
    currentPage: 1,
    pageSize: 10
  },
  charts: {
    monthly: null,
    shop: null
  }
};

// --- DOM ELEMENTS ---
const elements = {
  // Authentication Screens
  loginContainer: document.getElementById('login-container'),
  appContainer: document.getElementById('app-container'),
  formLogin: document.getElementById('form-login'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  btnLogout: document.getElementById('btn-logout'),
  userRoleBadge: document.getElementById('user-role-badge'),
  userDisplayName: document.getElementById('user-display-name'),
  menuAdminBtn: document.getElementById('menu-admin-btn'),
  
  // App Shell & Navigation
  themeToggleBtn: document.getElementById('theme-toggle'),
  themeText: document.getElementById('theme-text'),
  pageTitle: document.getElementById('page-title'),
  pageSubtitle: document.getElementById('page-subtitle'),
  todayDateText: document.getElementById('header-today-date'),
  menuItems: document.querySelectorAll('.menu-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Dashboard
  statTotalDisbursed: document.getElementById('stat-total-disbursed'),
  statTotalPaid: document.getElementById('stat-total-paid'),
  statPaidCount: document.getElementById('stat-paid-count'),
  statTotalPending: document.getElementById('stat-total-pending'),
  statPendingCount: document.getElementById('stat-pending-count'),
  statTotalShops: document.getElementById('stat-total-shops'),
  recentDisbursementsTbody: document.getElementById('recent-disbursements-tbody'),
  
  // Disbursements
  filterSearch: document.getElementById('filter-search'),
  filterShop: document.getElementById('filter-shop'),
  filterStatus: document.getElementById('filter-status'),
  filterStartDate: document.getElementById('filter-start-date'),
  filterEndDate: document.getElementById('filter-end-date'),
  btnClearFilters: document.getElementById('btn-clear-filters'),
  btnAddDisbursement: document.getElementById('btn-add-disbursement'),
  btnExportCsv: document.getElementById('btn-export-csv'),
  filteredRecordsCount: document.getElementById('filtered-records-count'),
  disbursementsTbody: document.getElementById('disbursements-tbody'),
  paginationContainer: document.getElementById('pagination'),
  
  // Shops
  btnAddShop: document.getElementById('btn-add-shop'),
  shopsListContainer: document.getElementById('shops-list-container'),
  
  // Backup & Restore
  btnExportBackup: document.getElementById('btn-export-backup'),
  importFileInput: document.getElementById('import-file-input'),
  btnTriggerImport: document.getElementById('btn-trigger-import'),
  importFilename: document.getElementById('import-filename'),
  
  // Admin Panel (Users Management)
  btnAddUser: document.getElementById('btn-add-user'),
  adminUsersTbody: document.getElementById('admin-users-tbody'),
  
  // Modals - Disbursement
  modalDisbursement: document.getElementById('modal-disbursement'),
  modalDisbursementTitle: document.getElementById('modal-disbursement-title'),
  modalDisbursementClose: document.getElementById('modal-disbursement-close'),
  btnCancelDisbursementModal: document.getElementById('btn-cancel-disbursement-modal'),
  formDisbursement: document.getElementById('form-disbursement'),
  dId: document.getElementById('disbursement-id'),
  dDate: document.getElementById('d-date'),
  dRef: document.getElementById('d-ref'),
  dShop: document.getElementById('d-shop'),
  dDetails: document.getElementById('d-details'),
  dSubtotal: document.getElementById('d-subtotal'),
  dVatType: document.getElementById('d-vat-type'),
  dWhtRate: document.getElementById('d-wht-rate'),
  dPaymentMethod: document.getElementById('d-payment-method'),
  dStatus: document.getElementById('d-status'),
  budgetWarningBanner: document.getElementById('budget-warning-banner'),
  warnRemainingBudget: document.getElementById('warn-remaining-budget'),
  
  // Calculations Preview
  calcSubtotal: document.getElementById('calc-subtotal'),
  calcVat: document.getElementById('calc-vat'),
  calcWht: document.getElementById('calc-wht'),
  calcNet: document.getElementById('calc-net'),
  
  // Modals - Shop
  modalShop: document.getElementById('modal-shop'),
  modalShopTitle: document.getElementById('modal-shop-title'),
  modalShopClose: document.getElementById('modal-shop-close'),
  btnCancelShopModal: document.getElementById('btn-cancel-shop-modal'),
  formShop: document.getElementById('form-shop'),
  sId: document.getElementById('shop-id'),
  sName: document.getElementById('s-name'),
  sBudget: document.getElementById('s-budget'),
  sTaxId: document.getElementById('s-tax-id'),
  sBankName: document.getElementById('s-bank-name'),
  sBankAccount: document.getElementById('s-bank-account'),
  sPhone: document.getElementById('s-phone'),
  sEmail: document.getElementById('s-email'),
  sAddress: document.getElementById('s-address'),

  // Modals - User
  modalUser: document.getElementById('modal-user'),
  modalUserTitle: document.getElementById('modal-user-title'),
  modalUserClose: document.getElementById('modal-user-close'),
  btnCancelUserModal: document.getElementById('btn-cancel-user-modal'),
  formUser: document.getElementById('form-user'),
  uUsername: document.getElementById('u-username'),
  uDisplayName: document.getElementById('u-displayname'),
  uPassword: document.getElementById('u-password'),
  uPasswordContainer: document.getElementById('u-password-container'),
  uRole: document.getElementById('u-role'),

  // Modals - Reset Password
  modalResetPassword: document.getElementById('modal-reset-password'),
  modalResetClose: document.getElementById('modal-reset-close'),
  btnCancelResetModal: document.getElementById('btn-cancel-reset-modal'),
  formResetPassword: document.getElementById('form-reset-password'),
  resetUserId: document.getElementById('reset-user-id'),
  resetUserName: document.getElementById('reset-user-name'),
  resetNewPassword: document.getElementById('reset-new-password'),

  // Modals - Shop History
  modalShopHistory: document.getElementById('modal-shop-history'),
  modalHistoryClose: document.getElementById('modal-history-close'),
  btnCloseHistoryModal: document.getElementById('btn-close-history-modal'),
  historyShopName: document.getElementById('history-shop-name'),
  historyTotalBudget: document.getElementById('history-total-budget'),
  historyTotalDisbursed: document.getElementById('history-total-disbursed'),
  historyRemainingBudget: document.getElementById('history-remaining-budget'),
  historyProgressBar: document.getElementById('history-progress-bar'),
  historyTbody: document.getElementById('history-tbody'),
  
  toastContainer: document.getElementById('toast-container')
};

// --- INITIALIZE APPLICATION ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.protocol === 'file:') {
    window.location.href = 'http://localhost:3000';
    return;
  }
  initDateDisplay();
  checkAuthSession();
  setupEventListeners();
  loadSavedTheme();
});

function initDateDisplay() {
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  elements.todayDateText.innerText = today.toLocaleDateString('th-TH', dateOptions);
}

function loadSavedTheme() {
  const localTheme = localStorage.getItem('disbursement_register_theme') || 'light';
  applyTheme(localTheme);
}

// --- API FETCH CLIENT UTILITIES ---
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });

    if (response.status === 401) {
      // Session expired, kick out to login
      AppState.user = null;
      elements.appContainer.style.display = 'none';
      elements.loginContainer.style.display = 'flex';
      showToast('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง', 'warning');
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
    return data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      showToast(error.message, 'danger');
    }
    throw error;
  }
}

// --- SESSION & USER ROLES CONTROL ---
async function checkAuthSession() {
  try {
    const data = await apiFetch('/api/auth/session');
    if (data.loggedIn) {
      AppState.user = data.user;
      setupUserEnvironment();
    } else {
      // Show login screen
      AppState.user = null;
      elements.appContainer.style.display = 'none';
      elements.loginContainer.style.display = 'flex';
    }
  } catch (e) {
    console.error('Session check failed:', e);
  }
}

function setupUserEnvironment() {
  elements.loginContainer.style.display = 'none';
  elements.appContainer.style.display = 'flex';
  
  // Render user profile
  elements.userDisplayName.innerText = AppState.user.displayName;
  elements.userRoleBadge.innerText = AppState.user.role === 'admin' ? 'สิทธิ์: ผู้ดูแลระบบ (Admin)' : 'สิทธิ์: เจ้าหน้าที่';

  // Toggle Admin Tab visibility
  if (AppState.user.role === 'admin') {
    elements.menuAdminBtn.style.display = 'flex';
  } else {
    elements.menuAdminBtn.style.display = 'none';
    if (AppState.activeTab === 'admin') {
      switchTab('dashboard');
    }
  }

  // Load database lists from backend server
  loadBackendData();
}

async function loadBackendData() {
  try {
    AppState.shops = await apiFetch('/api/shops');
    AppState.disbursements = await apiFetch('/api/disbursements');
    
    // Refresh active view
    switchTab(AppState.activeTab);
  } catch (err) {
    console.error('Failed to load database lists:', err);
  }
}

// --- LOGIN/LOGOUT ACTIONS ---
async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = elements.loginUsername.value;
  const password = elements.loginPassword.value;

  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.success) {
      AppState.user = data.user;
      elements.formLogin.reset();
      showToast(`ยินดีต้อนรับคุณ ${data.user.displayName}`, 'success');
      setupUserEnvironment();
    }
  } catch (err) {
    console.error('Login failed:', err);
  }
}

async function handleLogoutClick() {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    try {
      const data = await apiFetch('/api/auth/logout', { method: 'POST' });
      if (data.success) {
        AppState.user = null;
        elements.appContainer.style.display = 'none';
        elements.loginContainer.style.display = 'flex';
        showToast('ออกจากระบบสำเร็จแล้ว', 'success');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }
}

// --- THEME MANAGEMENT ---
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  AppState.theme = theme;
  localStorage.setItem('disbursement_register_theme', theme);
  
  if (theme === 'dark') {
    elements.themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> <span id="theme-text">โหมดสว่าง (Light Mode)</span>';
  } else {
    elements.themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> <span id="theme-text">โหมดมืด (Dark Mode)</span>';
  }
  updateCharts();
}

function toggleTheme() {
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// --- TAB ROUTING ---
function switchTab(tabId) {
  // Prevent non-admin users from accessing the admin panel tab
  if (tabId === 'admin' && AppState.user.role !== 'admin') {
    switchTab('dashboard');
    return;
  }

  AppState.activeTab = tabId;
  
  elements.menuItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  elements.tabContents.forEach(section => {
    if (section.id === `tab-${tabId}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  const titles = {
    dashboard: { main: 'แผงควบคุม (Dashboard)', sub: 'สรุปภาพรวมและข้อมูลสถิติการเบิกจ่ายเงินให้กับร้านค้าต่าง ๆ' },
    disbursements: { main: 'ทะเบียนคุมการเบิกจ่ายเงิน', sub: 'ตารางบันทึกและตรวจสอบรายการเบิกจ่ายเงินแก่ร้านค้าทั้งหมด' },
    shops: { main: 'จัดการข้อมูลร้านค้าและวงเงินงบประมาณ', sub: 'รายชื่อ งบประมาณที่ได้รับ และประวัติเบิกเงินรายร้านค้า' },
    backup: { main: 'สำรองและกู้คืนข้อมูล', sub: 'จัดการจัดเก็บสำเนาข้อมูลของคุณเพื่อความปลอดภัยสูงสุง' },
    admin: { main: 'ผู้ดูแลระบบ (Admin Panel)', sub: 'บริหารจัดการผู้ใช้งานในระบบ กำหนดระดับสิทธิ์ทีมงานบัญชี' }
  };

  elements.pageTitle.innerText = titles[tabId].main;
  elements.pageSubtitle.innerText = titles[tabId].sub;

  // Refresh active tab views
  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'disbursements') {
    populateShopDropdowns();
    renderDisbursementsTable();
  } else if (tabId === 'shops') {
    renderShopsGrid();
  } else if (tabId === 'admin') {
    renderAdminUsersTable();
  }
}

// --- POPULATE dropdown LISTS ---
function populateShopDropdowns() {
  const shopOptionsHTML = '<option value="">-- เลือกร้านค้า --</option>' +
    AppState.shops.map(shop => `<option value="${shop.id}">${shop.name}</option>`).join('');
  elements.dShop.innerHTML = shopOptionsHTML;

  const filterShopOptionsHTML = '<option value="">ทั้งหมด</option>' +
    AppState.shops.map(shop => `<option value="${shop.id}">${shop.name}</option>`).join('');
  elements.filterShop.innerHTML = filterShopOptionsHTML;
  elements.filterShop.value = AppState.filters.shop;
}

// --- TAX & PAYMENT CALCULATIONS ---
function calculateDisbursement(subtotal, vatType, whtRate) {
  let sub = parseFloat(subtotal) || 0;
  let vatRate = 0.07;
  let vat = 0;
  let baseSubtotal = sub;
  let wht = 0;
  let net = 0;

  if (vatType === 'include') {
    baseSubtotal = sub / (1 + vatRate);
    vat = sub - baseSubtotal;
  } else if (vatType === 'exclude') {
    baseSubtotal = sub;
    vat = sub * vatRate;
  } else {
    baseSubtotal = sub;
    vat = 0;
  }

  wht = baseSubtotal * (parseFloat(whtRate) / 100);

  if (vatType === 'exclude') {
    net = sub + vat - wht;
  } else {
    net = sub - wht;
  }

  return {
    subtotal: sub,
    baseSubtotal: Math.round(baseSubtotal * 100) / 100,
    vatAmount: Math.round(vat * 100) / 100,
    whtAmount: Math.round(wht * 100) / 100,
    netAmount: Math.round(net * 100) / 100
  };
}

function updateCalculationsPreview() {
  const subtotal = parseFloat(elements.dSubtotal.value) || 0;
  const vatType = elements.dVatType.value;
  const whtRate = parseInt(elements.dWhtRate.value) || 0;

  const calcs = calculateDisbursement(subtotal, vatType, whtRate);

  elements.calcSubtotal.innerText = formatCurrency(calcs.subtotal);
  elements.calcVat.innerText = formatCurrency(calcs.vatAmount);
  elements.calcWht.innerText = formatCurrency(calcs.whtAmount);
  elements.calcNet.innerText = formatCurrency(calcs.netAmount);

  // Check budget limits for selected shop
  checkBudgetWarning(calcs.netAmount);
}

function checkBudgetWarning(netAmount) {
  const shopId = elements.dShop.value;
  if (!shopId) {
    elements.budgetWarningBanner.style.display = 'none';
    return;
  }

  const shop = AppState.shops.find(s => s.id === shopId);
  if (!shop) return;

  // Calculate other paid/pending disbursements for this shop (excluding current editing disbursement)
  const currentEditingId = elements.dId.value;
  const totalOtherDisbursed = AppState.disbursements
    .filter(item => item.shopId === shopId && item.id !== currentEditingId && item.status !== 'Cancelled')
    .reduce((sum, item) => sum + item.netAmount, 0);

  const remainingBudget = shop.totalBudget - totalOtherDisbursed;

  if (netAmount > remainingBudget) {
    elements.warnRemainingBudget.innerText = formatCurrency(remainingBudget);
    elements.budgetWarningBanner.style.display = 'flex';
  } else {
    elements.budgetWarningBanner.style.display = 'none';
  }
}

// Currency formatting
function formatCurrency(amount) {
  return '฿' + (parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Thai Date Format
function formatThaiDate(dateString) {
  if (!dateString) return '-';
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const day = parseInt(parts[2]);
  const month = months[parseInt(parts[1]) - 1];
  const year = parseInt(parts[0]) + 543;
  return `${day} ${month} ${year}`;
}

// --- DASHBOARD RENDER ---
function renderDashboard() {
  let totalDisbursed = 0;
  let totalPaid = 0;
  let paidCount = 0;
  let totalPending = 0;
  let pendingCount = 0;

  AppState.disbursements.forEach(item => {
    if (item.status !== 'Cancelled') {
      totalDisbursed += item.netAmount;
      if (item.status === 'Paid') {
        totalPaid += item.netAmount;
        paidCount++;
      } else if (item.status === 'Pending') {
        totalPending += item.netAmount;
        pendingCount++;
      }
    }
  });

  elements.statTotalDisbursed.innerText = formatCurrency(totalDisbursed);
  elements.statTotalPaid.innerText = formatCurrency(totalPaid);
  elements.statPaidCount.innerText = `${paidCount} รายการ`;
  elements.statTotalPending.innerText = formatCurrency(totalPending);
  elements.statPendingCount.innerText = `${pendingCount} รายการ`;
  elements.statTotalShops.innerText = AppState.shops.length;

  const sorted = [...AppState.disbursements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);

  let recentHTML = '';
  if (recent.length === 0) {
    recentHTML = `<tr><td colspan="7" class="text-center text-muted py-4">ไม่มีข้อมูลการเบิกจ่าย</td></tr>`;
  } else {
    recentHTML = recent.map(item => {
      const shop = AppState.shops.find(s => s.id === item.shopId);
      const shopName = shop ? shop.name : 'ไม่พบชื่อร้านค้า';
      const statusBadge = getStatusBadge(item.status);
      return `
        <tr>
          <td>${formatThaiDate(item.date)}</td>
          <td><strong>${item.ref}</strong></td>
          <td>${shopName}</td>
          <td>${item.details}</td>
          <td class="text-right"><strong>${(item.netAmount).toLocaleString('th-TH', {minimumFractionDigits:2})}</strong></td>
          <td>${item.paymentMethod}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }
  elements.recentDisbursementsTbody.innerHTML = recentHTML;
  updateCharts();
}

function getStatusBadge(status) {
  if (status === 'Paid') return '<span class="badge badge-success">จ่ายเงินแล้ว</span>';
  if (status === 'Pending') return '<span class="badge badge-warning">รอดำเนินการ</span>';
  return '<span class="badge badge-danger">ยกเลิก</span>';
}

// --- CHARTS SYSTEM ---
function updateCharts() {
  const isDark = AppState.theme === 'dark';
  const textColor = isDark ? '#f3f4f6' : '#1e293b';
  const gridColor = isDark ? '#374151' : '#e2e8f0';

  // 1. Monthly Chart
  const monthlyCanvas = document.getElementById('monthlyChart');
  if (monthlyCanvas) {
    const monthlyData = {};
    const thMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      monthlyData[`${currentYear}-${String(i+1).padStart(2, '0')}`] = 0;
    }

    AppState.disbursements.forEach(item => {
      if (item.status !== 'Cancelled') {
        const monthKey = item.date.substring(0, 7);
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += item.netAmount;
        } else {
          monthlyData[monthKey] = item.netAmount;
        }
      }
    });

    const labels = [];
    const values = [];
    Object.keys(monthlyData).sort().forEach(key => {
      const parts = key.split('-');
      const monthIndex = parseInt(parts[1]) - 1;
      const thYear = parseInt(parts[0]) + 543;
      labels.push(`${thMonths[monthIndex]} ${String(thYear).substring(2)}`);
      values.push(monthlyData[key]);
    });

    if (AppState.charts.monthly) {
      AppState.charts.monthly.destroy();
    }

    AppState.charts.monthly = new Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'ยอดจ่ายสุทธิ (บาท)',
          data: values,
          backgroundColor: isDark ? '#6366f1' : '#4f46e5',
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `ยอดจ่าย: ฿${context.parsed.y.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Sarabun' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'Inter' },
              callback: function(value) {
                return value >= 1000 ? (value/1000) + 'k' : value;
              }
            }
          }
        }
      }
    });
  }

  // 2. Shop Chart
  const shopCanvas = document.getElementById('shopChart');
  if (shopCanvas) {
    const shopSummary = {};
    AppState.disbursements.forEach(item => {
      if (item.status !== 'Cancelled') {
        shopSummary[item.shopId] = (shopSummary[item.shopId] || 0) + item.netAmount;
      }
    });

    const shopList = Object.keys(shopSummary).map(id => {
      const s = AppState.shops.find(shop => shop.id === id);
      return {
        name: s ? s.name : 'ร้านค้าอื่น ๆ',
        amount: shopSummary[id]
      };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);

    const shopLabels = shopList.map(x => x.name);
    const shopValues = shopList.map(x => x.amount);

    if (AppState.charts.shop) {
      AppState.charts.shop.destroy();
    }

    const chartColors = ['#4f46e5', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

    AppState.charts.shop = new Chart(shopCanvas, {
      type: 'doughnut',
      data: {
        labels: shopLabels.length > 0 ? shopLabels : ['ไม่มีข้อมูล'],
        datasets: [{
          data: shopValues.length > 0 ? shopValues : [1],
          backgroundColor: shopValues.length > 0 ? chartColors : [gridColor],
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? '#1f2937' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { family: 'Sarabun', size: 11 },
              boxWidth: 12
            }
          },
          tooltip: {
            enabled: shopValues.length > 0,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                const val = context.raw;
                const percentage = Math.round((val / total) * 100);
                return `${context.label}: ฿${val.toLocaleString('th-TH', {minimumFractionDigits: 2})} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// --- DISBURSEMENTS LIST RENDER ---
function renderDisbursementsTable() {
  const filtered = AppState.disbursements.filter(item => {
    const shop = AppState.shops.find(s => s.id === item.shopId);
    const shopName = shop ? shop.name.toLowerCase() : '';
    const details = item.details.toLowerCase();
    const ref = item.ref.toLowerCase();
    const q = AppState.filters.search.toLowerCase();
    
    const matchesSearch = !q || ref.includes(q) || details.includes(q) || shopName.includes(q);
    const matchesShop = !AppState.filters.shop || item.shopId === AppState.filters.shop;
    const matchesStatus = !AppState.filters.status || item.status === AppState.filters.status;

    let matchesDate = true;
    if (AppState.filters.startDate) {
      matchesDate = matchesDate && item.date >= AppState.filters.startDate;
    }
    if (AppState.filters.endDate) {
      matchesDate = matchesDate && item.date <= AppState.filters.endDate;
    }

    return matchesSearch && matchesShop && matchesStatus && matchesDate;
  });

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  elements.filteredRecordsCount.innerText = `${filtered.length} รายการ`;

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / AppState.pagination.pageSize) || 1;
  
  if (AppState.pagination.currentPage > totalPages) {
    AppState.pagination.currentPage = totalPages;
  }
  
  const startIndex = (AppState.pagination.currentPage - 1) * AppState.pagination.pageSize;
  const paginatedItems = filtered.slice(startIndex, startIndex + AppState.pagination.pageSize);

  let tableHTML = '';
  if (paginatedItems.length === 0) {
    tableHTML = `<tr><td colspan="11" class="text-center text-muted py-4">ไม่พบข้อมูลการเบิกจ่ายตามเงื่อนไข</td></tr>`;
  } else {
    tableHTML = paginatedItems.map(item => {
      const shop = AppState.shops.find(s => s.id === item.shopId);
      const shopName = shop ? shop.name : 'ไม่พบร้านค้า';
      const statusBadge = getStatusBadge(item.status);
      
      const vatText = item.vatAmount > 0 ? `${item.vatAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}` : '-';
      const whtText = item.whtAmount > 0 ? `${item.whtAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})} (${item.whtRate}%)` : '-';
      
      return `
        <tr>
          <td>${formatThaiDate(item.date)}</td>
          <td><strong>${item.ref}</strong></td>
          <td>${shopName}</td>
          <td>${item.details}</td>
          <td class="text-right">${item.subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
          <td class="text-right text-success">${vatText}</td>
          <td class="text-right text-danger">${whtText}</td>
          <td class="text-right"><strong>${item.netAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</strong></td>
          <td>${item.paymentMethod}</td>
          <td>${statusBadge}</td>
          <td class="text-center">
            <div class="actions-cell">
              <button class="action-btn" title="แก้ไขรายการ" onclick="openEditDisbursementModal('${item.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="action-btn delete" title="ลบรายการ" onclick="deleteDisbursement('${item.id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
  elements.disbursementsTbody.innerHTML = tableHTML;
  renderPagination(totalPages, totalItems, startIndex, paginatedItems.length);
}

function renderPagination(totalPages, totalItems, startIndex, pageItemsCount) {
  if (totalItems === 0) {
    elements.paginationContainer.innerHTML = '';
    return;
  }

  const endIdx = startIndex + pageItemsCount;
  const infoHTML = `<div class="pagination-info">แสดงรายการที่ ${startIndex + 1} - ${endIdx} จากทั้งหมด ${totalItems} รายการ</div>`;

  let buttonsHTML = '<div class="pagination-buttons">';
  buttonsHTML += `
    <button class="page-btn" ${AppState.pagination.currentPage === 1 ? 'disabled' : ''} onclick="changePage(${AppState.pagination.currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  const maxButtons = 5;
  let startPage = Math.max(1, AppState.pagination.currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    buttonsHTML += `
      <button class="page-btn ${AppState.pagination.currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  buttonsHTML += `
    <button class="page-btn" ${AppState.pagination.currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${AppState.pagination.currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
  buttonsHTML += '</div>';

  elements.paginationContainer.innerHTML = infoHTML + buttonsHTML;
}

function changePage(page) {
  AppState.pagination.currentPage = page;
  renderDisbursementsTable();
}

// --- SHOPS LIST & BUDGET TRACKING RENDER ---
function renderShopsGrid() {
  let gridHTML = '';
  if (AppState.shops.length === 0) {
    gridHTML = `
      <div class="card text-center text-muted py-4 col-12" style="grid-column: span 3;">
        <i class="fa-solid fa-store-slash" style="font-size: 2.5rem; margin-bottom: 12px;"></i>
        <p>ยังไม่มีการขึ้นทะเบียนร้านค้าในระบบ กรุณากด "เพิ่มทะเบียนร้านค้าใหม่"</p>
      </div>
    `;
  } else {
    gridHTML = AppState.shops.map(shop => {
      // Calculate real-time budget balances (only for Paid & Pending status transactions)
      const shopDisbursements = AppState.disbursements.filter(item => item.shopId === shop.id && item.status !== 'Cancelled');
      const count = shopDisbursements.length;
      const totalDisbursed = shopDisbursements.reduce((sum, item) => sum + item.netAmount, 0);
      const remainingBudget = shop.totalBudget - totalDisbursed;
      const usagePercentage = Math.min(100, Math.round((totalDisbursed / shop.totalBudget) * 100)) || 0;

      // Classify progress bar colors
      let progressClass = 'safe';
      if (usagePercentage >= 100) {
        progressClass = 'danger';
      } else if (usagePercentage >= 80) {
        progressClass = 'warning';
      }

      return `
        <div class="shop-card">
          <div class="shop-card-header">
            <h3 class="shop-card-title">${shop.name}</h3>
            <div class="shop-card-actions">
              <button class="action-btn" title="แก้ไขข้อมูลร้าน" onclick="openEditShopModal('${shop.id}')">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="action-btn delete" title="ลบร้านค้า" onclick="deleteShop('${shop.id}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="shop-card-body">
            <!-- Budget Calculations Details -->
            <div class="shop-info-item">
              <i class="fa-solid fa-money-bill-wave text-success"></i>
              <div>
                <span class="text-muted d-block" style="font-size: 0.75rem;">งบประมาณรวม</span>
                <span class="shop-info-value" style="font-size: 0.95rem; font-weight: 700;">${formatCurrency(shop.totalBudget)}</span>
              </div>
            </div>
            <div class="shop-info-item">
              <i class="fa-solid fa-circle-minus text-danger"></i>
              <div>
                <span class="text-muted d-block" style="font-size: 0.75rem;">เบิกจ่ายแล้ว</span>
                <span class="shop-info-value" style="font-size: 0.95rem; font-weight: 600; color: var(--danger);">${formatCurrency(totalDisbursed)}</span>
              </div>
            </div>
            <div class="shop-info-item">
              <i class="fa-solid fa-circle-check text-success"></i>
              <div>
                <span class="text-muted d-block" style="font-size: 0.75rem;">คงเหลือใช้งาน</span>
                <span class="shop-info-value" style="font-size: 0.95rem; font-weight: 700; color: var(--success);">${formatCurrency(remainingBudget)}</span>
              </div>
            </div>
            
            <!-- Visual Budget Progress Bar -->
            <div class="store-budget-progress-container">
              <div class="store-budget-label-row">
                <span>การใช้เงินงบประมาณ</span>
                <span>${usagePercentage}%</span>
              </div>
              <div class="store-progress-bg">
                <div class="store-progress-fill ${progressClass}" style="width: ${usagePercentage}%;"></div>
              </div>
            </div>

            <div class="divider-y mt-2 mb-2" style="width: 100%; height: 1px; background-color: var(--border-color);"></div>
            
            <div class="shop-info-item">
              <i class="fa-solid fa-id-card"></i>
              <div>
                <span class="text-muted d-block" style="font-size: 0.75rem;">เลขผู้เสียภาษี</span>
                <span class="shop-info-value">${shop.taxId || 'ไม่ได้ระบุ'}</span>
              </div>
            </div>
            <div class="shop-info-item">
              <i class="fa-solid fa-building-columns"></i>
              <div>
                <span class="text-muted d-block" style="font-size: 0.75rem;">บัญชีธนาคาร</span>
                <span class="shop-info-value" style="font-size: 0.8rem;">${shop.bankName ? `${shop.bankName} ${shop.bankAccount}` : 'ไม่ได้ระบุ'}</span>
              </div>
            </div>

            <div class="divider-y mt-2 mb-2" style="width: 100%; height: 1px; background-color: var(--border-color);"></div>
            
            <div class="shop-info-item" style="justify-content: space-between; align-items: center;">
              <span class="text-muted" style="font-size: 0.8rem;">ทำรายการแล้ว: <strong>${count} ครั้ง</strong></span>
              <button class="btn btn-secondary btn-sm" onclick="openShopHistoryModal('${shop.id}')">
                <i class="fa-solid fa-receipt"></i> ดูประวัติเบิกจ่าย
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  elements.shopsListContainer.innerHTML = gridHTML;
}

// --- SHOP HISTORY MODAL ---
window.openShopHistoryModal = function(shopId) {
  const shop = AppState.shops.find(s => s.id === shopId);
  if (!shop) return;

  const shopDisbursements = AppState.disbursements.filter(item => item.shopId === shopId && item.status !== 'Cancelled');
  shopDisbursements.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalDisbursed = shopDisbursements.reduce((sum, item) => sum + item.netAmount, 0);
  const remainingBudget = shop.totalBudget - totalDisbursed;
  const usagePercentage = Math.min(100, Math.round((totalDisbursed / shop.totalBudget) * 100)) || 0;

  elements.historyShopName.innerText = `ประวัติการเบิกจ่าย: ${shop.name}`;
  elements.historyTotalBudget.innerText = formatCurrency(shop.totalBudget);
  elements.historyTotalDisbursed.innerText = formatCurrency(totalDisbursed);
  elements.historyRemainingBudget.innerText = formatCurrency(remainingBudget);
  
  elements.historyProgressBar.className = usagePercentage >= 100 ? 'progress-bar-fill bg-danger' : (usagePercentage >= 80 ? 'progress-bar-fill bg-warning' : 'progress-bar-fill');
  elements.historyProgressBar.style.width = `${usagePercentage}%`;
  
  // Apply bar color explicitly
  if (usagePercentage >= 100) {
    elements.historyProgressBar.style.backgroundColor = 'var(--danger)';
  } else if (usagePercentage >= 80) {
    elements.historyProgressBar.style.backgroundColor = 'var(--warning)';
  } else {
    elements.historyProgressBar.style.backgroundColor = 'var(--primary)';
  }

  // Populate history rows
  let historyHTML = '';
  if (shopDisbursements.length === 0) {
    historyHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่มีประวัติการเบิกจ่ายของร้านค้านี้ในระบบ</td></tr>`;
  } else {
    historyHTML = shopDisbursements.map(item => {
      const statusBadge = getStatusBadge(item.status);
      return `
        <tr>
          <td>${formatThaiDate(item.date)}</td>
          <td><strong>${item.ref}</strong></td>
          <td>${item.details}</td>
          <td class="text-right">${item.subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
          <td class="text-right"><strong>${item.netAmount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</strong></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }
  elements.historyTbody.innerHTML = historyHTML;
  openModal(elements.modalShopHistory);
};

// --- ADMIN PANEL USER MANAGEMENT RENDERING ---
async function renderAdminUsersTable() {
  try {
    const users = await apiFetch('/api/admin/users');
    let tbodyHTML = '';
    if (users.length === 0) {
      tbodyHTML = `<tr><td colspan="4" class="text-center text-muted py-4">ไม่พบข้อมูลผู้ใช้งาน</td></tr>`;
    } else {
      tbodyHTML = users.map(u => {
        const isSelf = u.id === AppState.user.id;
        const roleLabel = u.role === 'admin' ? '<span class="badge badge-danger">ผู้ดูแลระบบ (Admin)</span>' : '<span class="badge badge-info">เจ้าหน้าที่บัญชี</span>';
        
        return `
          <tr>
            <td><strong>${u.username}</strong> ${isSelf ? '<span class="text-muted">(บัญชีของคุณ)</span>' : ''}</td>
            <td>${u.displayName}</td>
            <td>${roleLabel}</td>
            <td class="text-center">
              <div class="actions-cell">
                <button class="btn btn-secondary btn-sm" title="เปลี่ยนรหัสผ่าน" onclick="openResetPasswordModal('${u.id}', '${u.username}')">
                  <i class="fa-solid fa-key"></i> เปลี่ยนรหัส
                </button>
                <button class="action-btn delete" title="ลบผู้ใช้" ${isSelf ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''} onclick="deleteUser('${u.id}', '${u.username}')">
                  <i class="fa-solid fa-user-minus"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
    elements.adminUsersTbody.innerHTML = tbodyHTML;
  } catch (err) {
    console.error('Failed to render users:', err);
  }
}

// --- MODALS ACTIONS ---
function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

// Shop Modals
function openAddShopModal() {
  elements.modalShopTitle.innerText = 'ขึ้นทะเบียนร้านค้าใหม่';
  elements.formShop.reset();
  elements.sId.value = '';
  openModal(elements.modalShop);
  elements.sName.focus();
}

window.openEditShopModal = function(shopId) {
  const shop = AppState.shops.find(s => s.id === shopId);
  if (!shop) return;

  elements.modalShopTitle.innerText = 'แก้ไขข้อมูลร้านค้า';
  elements.sId.value = shop.id;
  elements.sName.value = shop.name;
  elements.sBudget.value = shop.totalBudget;
  elements.sTaxId.value = shop.taxId || '';
  elements.sBankName.value = shop.bankName || '';
  elements.sBankAccount.value = shop.bankAccount || '';
  elements.sPhone.value = shop.phone || '';
  elements.sEmail.value = shop.email || '';
  elements.sAddress.value = shop.address || '';

  openModal(elements.modalShop);
};

// Disbursement Modals
function openAddDisbursementModal() {
  if (AppState.shops.length === 0) {
    showToast('กรุณาขึ้นทะเบียนร้านค้าอย่างน้อย 1 ร้าน ก่อนสร้างรายการเบิกจ่าย', 'warning');
    switchTab('shops');
    return;
  }
  
  elements.modalDisbursementTitle.innerText = 'เพิ่มรายการเบิกจ่ายเงิน';
  elements.formDisbursement.reset();
  elements.dId.value = '';
  elements.dDate.value = new Date().toISOString().substring(0, 10);
  elements.dStatus.value = 'Pending';
  elements.dVatType.value = 'none';
  elements.dWhtRate.value = '0';
  elements.dPaymentMethod.value = 'โอนเงินผ่านธนาคาร';

  populateShopDropdowns();
  updateCalculationsPreview();
  openModal(elements.modalDisbursement);
}

window.openEditDisbursementModal = function(id) {
  const item = AppState.disbursements.find(d => d.id === id);
  if (!item) return;

  elements.modalDisbursementTitle.innerText = 'แก้ไขรายการเบิกจ่ายเงิน';
  populateShopDropdowns();

  elements.dId.value = item.id;
  elements.dDate.value = item.date;
  elements.dRef.value = item.ref;
  elements.dShop.value = item.shopId;
  elements.dDetails.value = item.details;
  elements.dSubtotal.value = item.subtotal;
  elements.dVatType.value = item.vatType || 'none';
  elements.dWhtRate.value = String(item.whtRate || 0);
  elements.dPaymentMethod.value = item.paymentMethod;
  elements.dStatus.value = item.status;

  updateCalculationsPreview();
  openModal(elements.modalDisbursement);
};

// Admin User Modals
function openAddUserModal() {
  elements.modalUserTitle.innerText = 'เพิ่มผู้ใช้งานใหม่';
  elements.formUser.reset();
  elements.uPasswordContainer.style.display = 'block';
  elements.uPassword.setAttribute('required', 'required');
  elements.uUsername.removeAttribute('readonly');
  openModal(elements.modalUser);
  elements.uUsername.focus();
}

window.openResetPasswordModal = function(id, username) {
  elements.resetUserId.value = id;
  elements.resetUserName.innerText = username;
  elements.resetNewPassword.value = '';
  openModal(elements.modalResetPassword);
  elements.resetNewPassword.focus();
};

// --- BACKEND API SUBMISSIONS ---

// Create or Edit Shop
async function handleShopSubmit(e) {
  e.preventDefault();
  const id = elements.sId.value;
  const payload = {
    name: elements.sName.value.trim(),
    totalBudget: parseFloat(elements.sBudget.value) || 0,
    taxId: elements.sTaxId.value.trim(),
    bankName: elements.sBankName.value,
    bankAccount: elements.sBankAccount.value.trim(),
    phone: elements.sPhone.value.trim(),
    email: elements.sEmail.value.trim(),
    address: elements.sAddress.value.trim()
  };

  try {
    if (id) {
      // API PUT - Update
      const updated = await apiFetch(`/api/shops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const idx = AppState.shops.findIndex(s => s.id === id);
      if (idx !== -1) AppState.shops[idx] = updated;
      showToast('แก้ไขข้อมูลร้านค้าสำเร็จ', 'success');
    } else {
      // API POST - Create
      const created = await apiFetch('/api/shops', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      AppState.shops.push(created);
      showToast('ขึ้นทะเบียนร้านค้าใหม่สำเร็จ', 'success');
    }

    closeModal(elements.modalShop);
    renderShopsGrid();
  } catch (err) {
    console.error(err);
  }
}

// Create or Edit Disbursement
async function handleDisbursementSubmit(e) {
  e.preventDefault();
  const id = elements.dId.value;
  const subtotal = parseFloat(elements.dSubtotal.value) || 0;
  const vatType = elements.dVatType.value;
  const whtRate = parseInt(elements.dWhtRate.value) || 0;
  
  const calcs = calculateDisbursement(subtotal, vatType, whtRate);

  const payload = {
    date: elements.dDate.value,
    ref: elements.dRef.value.trim(),
    shopId: elements.dShop.value,
    details: elements.dDetails.value.trim(),
    subtotal: calcs.subtotal,
    vatType: vatType,
    vatAmount: calcs.vatAmount,
    whtRate: whtRate,
    whtAmount: calcs.whtAmount,
    netAmount: calcs.netAmount,
    paymentMethod: elements.dPaymentMethod.value,
    status: elements.dStatus.value
  };

  try {
    if (id) {
      // API PUT - Update
      const updated = await apiFetch(`/api/disbursements/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const idx = AppState.disbursements.findIndex(d => d.id === id);
      if (idx !== -1) AppState.disbursements[idx] = updated;
      showToast('แก้ไขข้อมูลการเบิกจ่ายสำเร็จ', 'success');
    } else {
      // API POST - Create
      const created = await apiFetch('/api/disbursements', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      AppState.disbursements.push(created);
      showToast('บันทึกข้อมูลเบิกจ่ายสำเร็จ', 'success');
    }

    closeModal(elements.modalDisbursement);
    if (AppState.activeTab === 'dashboard') {
      renderDashboard();
    } else {
      renderDisbursementsTable();
    }
  } catch (err) {
    console.error(err);
  }
}

// Create User (Admin Only)
async function handleUserSubmit(e) {
  e.preventDefault();
  const payload = {
    username: elements.uUsername.value.trim(),
    displayName: elements.uDisplayName.value.trim(),
    password: elements.uPassword.value,
    role: elements.uRole.value
  };

  try {
    await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    showToast('สร้างบัญชีผู้ใช้งานใหม่สำเร็จ', 'success');
    closeModal(elements.modalUser);
    renderAdminUsersTable();
  } catch (err) {
    console.error(err);
  }
}

// Reset Password (Admin Only)
async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  const id = elements.resetUserId.value;
  const password = elements.resetNewPassword.value;

  try {
    await apiFetch(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
    
    showToast('เปลี่ยนรหัสผ่านผู้ใช้สำเร็จ', 'success');
    closeModal(elements.modalResetPassword);
  } catch (err) {
    console.error(err);
  }
}

// Delete User
window.deleteUser = async function(id, username) {
  if (confirm(`คุณต้องการลบผู้ใช้งาน "${username}" ออกจากระบบหรือไม่?`)) {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      showToast('ลบผู้ใช้สำเร็จ', 'success');
      renderAdminUsersTable();
    } catch (err) {
      console.error(err);
    }
  }
};

// Delete Shop
window.deleteShop = async function(shopId) {
  const shop = AppState.shops.find(s => s.id === shopId);
  if (!shop) return;

  if (confirm(`คุณต้องการลบร้านค้า "${shop.name}" หรือไม่? ข้อมูลวงเงินทั้งหมดจะหายไป`)) {
    try {
      await apiFetch(`/api/shops/${shopId}`, { method: 'DELETE' });
      AppState.shops = AppState.shops.filter(s => s.id !== shopId);
      renderShopsGrid();
      showToast('ลบร้านค้าเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error(err);
    }
  }
};

// Delete Disbursement
window.deleteDisbursement = async function(id) {
  const item = AppState.disbursements.find(d => d.id === id);
  if (!item) return;

  if (confirm(`คุณต้องการลบรายการเบิกจ่ายเลขที่ "${item.ref}" หรือไม่?`)) {
    try {
      await apiFetch(`/api/disbursements/${id}`, { method: 'DELETE' });
      AppState.disbursements = AppState.disbursements.filter(d => d.id !== id);
      renderDisbursementsTable();
      showToast('ลบรายการเบิกจ่ายเรียบร้อยแล้ว', 'success');
    } catch (err) {
      console.error(err);
    }
  }
};

// --- DATA BACKUP & RESTORE ---

// Export CSV (Excel Friendly UTF-8 BOM)
function handleExportCsv() {
  if (AppState.disbursements.length === 0) {
    showToast('ไม่มีข้อมูลการเบิกจ่ายที่สามารถส่งออกได้', 'warning');
    return;
  }

  const headers = [
    'วันที่เบิกจ่าย', 'เลขที่เอกสาร', 'ร้านค้า', 'รายละเอียดการเบิกจ่าย',
    'จำนวนเงินก่อนภาษี', 'ประเภทภาษี', 'VAT (7%)', 'อัตราหัก ณ ที่จ่าย (%)',
    'ภาษีหัก ณ ที่จ่าย', 'ยอดจ่ายสุทธิ', 'ช่องทางการจ่ายเงิน', 'สถานะ'
  ];

  const rows = AppState.disbursements.map(item => {
    const shop = AppState.shops.find(s => s.id === item.shopId);
    const shopName = shop ? shop.name : 'ไม่พบร้านค้า';
    const vatTypeText = item.vatType === 'include' ? 'รวมในยอด (7%)' : (item.vatType === 'exclude' ? 'แยกต่างหาก (7%)' : 'ไม่มีภาษี');
    const statusText = item.status === 'Paid' ? 'จ่ายเงินแล้ว' : (item.status === 'Pending' ? 'รอดำเนินการ' : 'ยกเลิก');

    return [
      item.date,
      `"${item.ref.replace(/"/g, '""')}"`,
      `"${shopName.replace(/"/g, '""')}"`,
      `"${item.details.replace(/"/g, '""')}"`,
      item.subtotal,
      `"${vatTypeText}"`,
      item.vatAmount,
      item.whtRate,
      item.whtAmount,
      item.netAmount,
      `"${item.paymentMethod}"`,
      `"${statusText}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ทะเบียนคุมการเบิกจ่ายเงิน_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('ส่งออกไฟล์ Excel สำเร็จ', 'success');
}

// Download JSON Backup from Backend
async function handleExportBackup() {
  try {
    const data = await apiFetch('/api/backup/download');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_disbursement_register_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ', 'success');
  } catch (err) {
    console.error('Backup download failed:', err);
  }
}

// Restore JSON to Backend
function handleImportFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  elements.importFilename.innerText = file.name;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      if (!data.shops || !data.disbursements) {
        throw new Error('โครงสร้างไฟล์ไม่ถูกต้อง');
      }

      if (confirm('คุณต้องการนำเข้าไฟล์สำรองเพื่อเขียนทับข้อมูลร้านค้าและใบสำคัญจ่ายทั้งหมดในเซิร์ฟเวอร์หรือไม่?')) {
        const response = await apiFetch('/api/backup/restore', {
          method: 'POST',
          body: JSON.stringify({ shops: data.shops, disbursements: data.disbursements })
        });

        if (response.success) {
          showToast('กู้คืนข้อมูลสำรองขึ้นเซิร์ฟเวอร์สำเร็จ!', 'success');
          elements.importFileInput.value = '';
          elements.importFilename.innerText = 'ยังไม่ได้เลือกไฟล์';
          loadBackendData(); // reload lists
          switchTab('dashboard');
        }
      }
    } catch (err) {
      showToast('ไฟล์ชำรุด หรือไม่ใช่โครงสร้างข้อมูลที่ถูกต้องของระบบ', 'danger');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'primary') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
  if (type === 'warning') icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
  if (type === 'danger') icon = '<i class="fa-solid fa-circle-exclamation"></i>';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 4500);
}

// --- SETUP EVENT LISTENERS ---
function setupEventListeners() {
  // Login & Logout
  elements.formLogin.addEventListener('submit', handleLoginSubmit);
  elements.btnLogout.addEventListener('click', handleLogoutClick);

  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Sidebar Tabs
  elements.menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Disbursement Modals
  elements.btnAddDisbursement.addEventListener('click', openAddDisbursementModal);
  elements.modalDisbursementClose.addEventListener('click', () => closeModal(elements.modalDisbursement));
  elements.btnCancelDisbursementModal.addEventListener('click', () => closeModal(elements.modalDisbursement));
  elements.dSubtotal.addEventListener('input', updateCalculationsPreview);
  elements.dVatType.addEventListener('change', updateCalculationsPreview);
  elements.dWhtRate.addEventListener('change', updateCalculationsPreview);
  elements.dShop.addEventListener('change', updateCalculationsPreview);
  elements.formDisbursement.addEventListener('submit', handleDisbursementSubmit);

  // Shop Modals
  elements.btnAddShop.addEventListener('click', openAddShopModal);
  elements.modalShopClose.addEventListener('click', () => closeModal(elements.modalShop));
  elements.btnCancelShopModal.addEventListener('click', () => closeModal(elements.modalShop));
  elements.formShop.addEventListener('submit', handleShopSubmit);

  // Admin User Modals
  elements.btnAddUser.addEventListener('click', openAddUserModal);
  elements.modalUserClose.addEventListener('click', () => closeModal(elements.modalUser));
  elements.btnCancelUserModal.addEventListener('click', () => closeModal(elements.modalUser));
  elements.formUser.addEventListener('submit', handleUserSubmit);

  // Reset Password Modals
  elements.modalResetClose.addEventListener('click', () => closeModal(elements.modalResetPassword));
  elements.btnCancelResetModal.addEventListener('click', () => closeModal(elements.modalResetPassword));
  elements.formResetPassword.addEventListener('submit', handleResetPasswordSubmit);

  // Shop History Modal
  elements.modalHistoryClose.addEventListener('click', () => closeModal(elements.modalShopHistory));
  elements.btnCloseHistoryModal.addEventListener('click', () => closeModal(elements.modalShopHistory));

  // Filters Events
  elements.filterSearch.addEventListener('input', debounce(() => {
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  }, 300));
  
  elements.filterShop.addEventListener('change', () => {
    AppState.filters.shop = elements.filterShop.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  
  elements.filterStatus.addEventListener('change', () => {
    AppState.filters.status = elements.filterStatus.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  
  elements.filterStartDate.addEventListener('change', () => {
    AppState.filters.startDate = elements.filterStartDate.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });
  
  elements.filterEndDate.addEventListener('change', () => {
    AppState.filters.endDate = elements.filterEndDate.value;
    AppState.pagination.currentPage = 1;
    renderDisbursementsTable();
  });

  elements.btnClearFilters.addEventListener('click', () => {
    elements.filterSearch.value = '';
    elements.filterShop.value = '';
    elements.filterStatus.value = '';
    elements.filterStartDate.value = '';
    elements.filterEndDate.value = '';
    
    AppState.filters = { search: '', shop: '', status: '', startDate: '', endDate: '' };
    AppState.pagination.currentPage = 1;
    
    showToast('ล้างเงื่อนไขการค้นหาเรียบร้อย', 'primary');
    renderDisbursementsTable();
  });

  // Data Export/Restore Bindings
  elements.btnExportCsv.addEventListener('click', handleExportCsv);
  elements.btnExportBackup.addEventListener('click', handleExportBackup);
  elements.btnTriggerImport.addEventListener('click', () => elements.importFileInput.click());
  elements.importFileInput.addEventListener('change', handleImportFileSelect);
}

// Helper: Debounce for fast search inputs
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    AppState.filters.search = elements.filterSearch.value;
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
