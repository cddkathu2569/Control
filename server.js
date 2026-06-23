const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Middleware
app.use(session({
  secret: 'disbursement_register_key_998811',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // Session valid for 4 hours
    httpOnly: true,
    secure: false, // Set to true if running on HTTPS (production)
    sameSite: 'lax'
  }
}));

// Logger Middleware (must be after session)
app.use((req, res, next) => {
  const username = req.session && req.session.user ? req.session.user.username : 'Guest';
  console.log(`[REQ] ${req.method} ${req.url} - Session: ${req.sessionID ? req.sessionID.substring(0, 8) : 'None'}... - User: ${username}`);
  next();
});

// Auth Middlewares
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง: เฉพาะแอดมินเท่านั้น' });
  }
}

// --- STATIC FRONTEND FILES ---
// Serve static client files (index.html, style.css, app.js)
app.use(express.static(path.join(__dirname)));

// --- AUTHENTICATION APIS ---

// Check Session Status
app.get('/api/auth/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Login Request
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`[AUTH] Login request received for user: "${username}"`);
  
  if (!username || !password) {
    console.log(`[AUTH] Login failed: Username or password missing`);
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }

  const users = db.getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());

  if (user) {
    const isCorrect = user.passwordHash === db.hashPassword(password);
    console.log(`[AUTH] User found. Password match: ${isCorrect}`);
    
    if (isCorrect) {
      // Write user info to session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName
      };
      console.log(`[AUTH] Login successful for user: "${username}" (Role: ${user.role})`);
      
      return req.session.save((err) => {
        if (err) {
          console.error('[AUTH] Failed to save session:', err);
          return res.status(500).json({ error: 'ไม่สามารถบันทึกข้อมูลเข้าสู่ระบบได้' });
        }
        return res.json({ success: true, user: req.session.user });
      });
    }
  } else {
    console.log(`[AUTH] Login failed: User "${username}" not found in database`);
  }

  res.status(401).json({ error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
});

// Logout Request
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'ไม่สามารถออกจากระบบได้' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// --- ADMIN CONTROL APIS (USER MANAGEMENT) ---

// Get Users List (Admin Only)
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const users = db.getUsers().map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    displayName: u.displayName
  }));
  res.json(users);
});

// Add New User (Admin Only)
app.post('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  const { username, password, displayName, role } = req.body;
  
  if (!username || !password || !displayName || !role) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลผู้ใช้ให้ครบถ้วน' });
  }

  const users = db.getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
    return res.status(400).json({ error: 'ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    username: username.toLowerCase().trim(),
    password: password,
    displayName: displayName.trim(),
    role: role
  };

  const addedUser = await db.addUser(newUser);
  res.json({
    id: addedUser.id,
    username: addedUser.username,
    displayName: addedUser.displayName,
    role: addedUser.role
  });
});

// Reset User Password (Admin Only)
app.put('/api/admin/users/:id/password', requireAuth, requireAdmin, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: 'กรุณาระบุรหัสผ่านใหม่' });
  }

  const success = await db.updateUserPassword(req.params.id, password);
  if (success) {
    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } else {
    res.status(404).json({ error: 'ไม่พบผู้ใช้ในระบบ' });
  }
});

// Delete User (Admin Only)
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  // Prevent admin from deleting themselves
  if (req.params.id === req.session.user.id) {
    return res.status(400).json({ error: 'ไม่สามารถลบบัญชีของคุณเองได้ขณะอยู่ในระบบ' });
  }

  await db.deleteUser(req.params.id);
  res.json({ success: true, message: 'ลบผู้ใช้สำเร็จ' });
});

// --- SHOP REST APIS ---

// Get all shops
app.get('/api/shops', requireAuth, (req, res) => {
  res.json(db.getShops());
});

// Create new shop
app.post('/api/shops', requireAuth, async (req, res) => {
  const { name, taxId, bankName, bankAccount, phone, email, address, totalBudget } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'กรุณาระบุชื่อร้านค้า' });
  }

  const newShop = {
    id: 'shop_' + Date.now(),
    name: name.trim(),
    taxId: taxId ? taxId.trim() : '',
    bankName: bankName || '',
    bankAccount: bankAccount ? bankAccount.trim() : '',
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    address: address ? address.trim() : '',
    totalBudget: parseFloat(totalBudget) || 0
  };

  const added = await db.addShop(newShop);
  res.json(added);
});

// Update shop
app.put('/api/shops/:id', requireAuth, async (req, res) => {
  const fields = req.body;
  if (fields.totalBudget !== undefined) {
    fields.totalBudget = parseFloat(fields.totalBudget) || 0;
  }
  
  const updated = await db.updateShop(req.params.id, fields);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'ไม่พบข้อมูลร้านค้าในระบบ' });
  }
});

// Delete shop
app.delete('/api/shops/:id', requireAuth, async (req, res) => {
  // Check if shop is referenced in disbursements
  const disbursements = db.getDisbursements();
  const referenced = disbursements.some(d => d.shopId === req.params.id);
  if (referenced) {
    return res.status(400).json({ error: 'ไม่สามารถลบร้านค้านี้ได้ เนื่องจากมีประวัติการเบิกจ่ายผูกไว้' });
  }

  await db.deleteShop(req.params.id);
  res.json({ success: true });
});

// --- DISBURSEMENT REST APIS ---

// Get all disbursements
app.get('/api/disbursements', requireAuth, (req, res) => {
  res.json(db.getDisbursements());
});

// Create new disbursement
app.post('/api/disbursements', requireAuth, async (req, res) => {
  const { date, ref, shopId, details, subtotal, vatType, vatAmount, whtRate, whtAmount, netAmount, paymentMethod, status } = req.body;
  
  if (!date || !ref || !shopId || !details || subtotal === undefined) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลการเบิกจ่ายให้ครบถ้วน' });
  }

  const newRecord = {
    id: 'db_' + Date.now(),
    date,
    ref: ref.trim(),
    shopId,
    details: details.trim(),
    subtotal: parseFloat(subtotal) || 0,
    vatType: vatType || 'none',
    vatAmount: parseFloat(vatAmount) || 0,
    whtRate: parseInt(whtRate) || 0,
    whtAmount: parseFloat(whtAmount) || 0,
    netAmount: parseFloat(netAmount) || 0,
    paymentMethod: paymentMethod || 'โอนเงินผ่านธนาคาร',
    status: status || 'Pending'
  };

  const added = await db.addDisbursement(newRecord);
  res.json(added);
});

// Update disbursement
app.put('/api/disbursements/:id', requireAuth, async (req, res) => {
  const fields = req.body;
  if (fields.subtotal !== undefined) fields.subtotal = parseFloat(fields.subtotal) || 0;
  if (fields.vatAmount !== undefined) fields.vatAmount = parseFloat(fields.vatAmount) || 0;
  if (fields.whtAmount !== undefined) fields.whtAmount = parseFloat(fields.whtAmount) || 0;
  if (fields.netAmount !== undefined) fields.netAmount = parseFloat(fields.netAmount) || 0;
  if (fields.whtRate !== undefined) fields.whtRate = parseInt(fields.whtRate) || 0;

  const updated = await db.updateDisbursement(req.params.id, fields);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'ไม่พบข้อมูลการเบิกจ่ายในระบบ' });
  }
});

// Delete disbursement
app.delete('/api/disbursements/:id', requireAuth, async (req, res) => {
  await db.deleteDisbursement(req.params.id);
  res.json({ success: true });
});

// --- DATA BACKUP & RESTORE APIS ---

// Get Backup JSON (Protected)
app.get('/api/backup/download', requireAuth, (req, res) => {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    shops: db.getShops(),
    disbursements: db.getDisbursements()
  };
  res.json(data);
});

// Restore Database from file (Protected, Admin Only)
app.post('/api/backup/restore', requireAuth, requireAdmin, async (req, res) => {
  const { shops, disbursements } = req.body;
  if (!shops || !disbursements) {
    return res.status(400).json({ error: 'โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง' });
  }

  await db.restoreDatabase({ shops, disbursements });
  res.json({ success: true, message: 'กู้คืนข้อมูลสำรองสำเร็จแล้ว!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`ระบบทะเบียนคุมการเบิกจ่ายเงินร้านค้า ทำงานแล้ว!`);
  console.log(`ลิงก์ใช้งานภายในเครื่อง: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
