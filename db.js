const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'database.json');

// Password hashing utility using built-in crypto (no native compiler dependencies)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Default mock database structure
const initialData = {
  users: [
    {
      id: 'usr_admin',
      username: 'admin',
      passwordHash: hashPassword('admin1234'), // Default admin password
      role: 'admin',
      displayName: 'ผู้ดูแลระบบ (Admin)'
    },
    {
      id: 'usr_staff',
      username: 'staff',
      passwordHash: hashPassword('staff1234'), // Default staff password
      role: 'user',
      displayName: 'เจ้าหน้าที่บัญชี'
    }
  ],
  shops: [
    {
      id: 'shop_mock_1',
      name: 'ร้านค้า มั่งมีก่อสร้าง จำกัด',
      taxId: '0105561023456',
      bankName: 'ธนาคารกสิกรไทย',
      bankAccount: '123-2-88899-0',
      phone: '02-555-1234',
      email: 'sales@mangmeebuild.co.th',
      address: '99/1 ถ.รามอินทรา แขวงอนุสาวรีย์ เขตบางเขน กรุงเทพฯ 10220',
      totalBudget: 150000.00
    },
    {
      id: 'shop_mock_2',
      name: 'บริษัท ทวีผลเครื่องพิมพ์ จำกัด',
      taxId: '0105559876543',
      bankName: 'ธนาคารไทยพาณิชย์',
      bankAccount: '045-3-01928-1',
      phone: '081-888-2930',
      email: 'taweephol.print@gmail.com',
      address: '22 ซอยลาดพร้าว 15 แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900',
      totalBudget: 40000.00
    },
    {
      id: 'shop_mock_3',
      name: 'สำนักงาน เจริญกิจบริการ (คุณพรเทพ)',
      taxId: '3101402345678',
      bankName: 'ธนาคารกรุงเทพ',
      bankAccount: '240-0-12345-6',
      phone: '090-123-4567',
      email: 'pornthep.c@outlook.com',
      address: '8 ซอยสุขุมวิท 49 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      totalBudget: 20000.00
    }
  ],
  disbursements: [
    {
      id: 'db_mock_1',
      date: getOffsetDate(1),
      ref: 'PV-6906001',
      shopId: 'shop_mock_1',
      details: 'จัดซื้อสีทาภายนอก และแปรงทาสี โครงการปรับปรุงสำนักงาน',
      subtotal: 15500,
      vatType: 'exclude',
      vatAmount: 1085,
      whtRate: 0,
      whtAmount: 0,
      netAmount: 16585,
      paymentMethod: 'โอนเงินผ่านธนาคาร',
      status: 'Paid'
    },
    {
      id: 'db_mock_2',
      date: getOffsetDate(3),
      ref: 'PV-6906002',
      shopId: 'shop_mock_2',
      details: 'พิมพ์โบชัวร์แนะนำผลิตภัณฑ์ใหม่ ขนาด A4 จำนวน 2,000 แผ่น',
      subtotal: 8000,
      vatType: 'include',
      vatAmount: 523.36,
      whtRate: 3,
      whtAmount: 224.3,
      netAmount: 7775.7,
      paymentMethod: 'โอนเงินผ่านธนาคาร',
      status: 'Paid'
    },
    {
      id: 'db_mock_3',
      date: getOffsetDate(8),
      ref: 'PV-6906003',
      shopId: 'shop_mock_3',
      details: 'ว่าจ้างล้างเครื่องปรับอากาศชั้น 1-3 สำนักงานใหญ่',
      subtotal: 4500,
      vatType: 'none',
      vatAmount: 0,
      whtRate: 3,
      whtAmount: 135,
      netAmount: 4365,
      paymentMethod: 'เงินสด',
      status: 'Pending'
    }
  ]
};

function getOffsetDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().substring(0, 10);
}

// Thread-safe read/write queue for JSON file
class Database {
  constructor() {
    this.writeQueue = Promise.resolve();
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      this.saveSync(initialData);
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, resetting to defaults:', e);
      this.saveSync(initialData);
      return initialData;
    }
  }

  saveSync(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  async save(data) {
    // Queue writes to prevent corruption from concurrent requests
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        const tempPath = DB_PATH + '.tmp';
        await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
        await fs.promises.rename(tempPath, DB_PATH);
      } catch (err) {
        console.error('Failed to write database file asynchronously:', err);
      }
    });
    return this.writeQueue;
  }
}

const dbInstance = new Database();

module.exports = {
  hashPassword,
  
  // User Operations
  getUsers: () => dbInstance.read().users,
  addUser: async (user) => {
    const data = dbInstance.read();
    user.passwordHash = hashPassword(user.password || '123456');
    delete user.password;
    data.users.push(user);
    await dbInstance.save(data);
    return user;
  },
  deleteUser: async (id) => {
    const data = dbInstance.read();
    data.users = data.users.filter(u => u.id !== id);
    await dbInstance.save(data);
  },
  updateUserPassword: async (id, newPassword) => {
    const data = dbInstance.read();
    const user = data.users.find(u => u.id === id);
    if (user) {
      user.passwordHash = hashPassword(newPassword);
      await dbInstance.save(data);
      return true;
    }
    return false;
  },

  // Shop Operations
  getShops: () => dbInstance.read().shops,
  addShop: async (shop) => {
    const data = dbInstance.read();
    data.shops.push(shop);
    await dbInstance.save(data);
    return shop;
  },
  updateShop: async (id, updatedFields) => {
    const data = dbInstance.read();
    const idx = data.shops.findIndex(s => s.id === id);
    if (idx !== -1) {
      data.shops[idx] = { ...data.shops[idx], ...updatedFields };
      await dbInstance.save(data);
      return data.shops[idx];
    }
    return null;
  },
  deleteShop: async (id) => {
    const data = dbInstance.read();
    data.shops = data.shops.filter(s => s.id !== id);
    await dbInstance.save(data);
  },

  // Disbursement Operations
  getDisbursements: () => dbInstance.read().disbursements,
  addDisbursement: async (record) => {
    const data = dbInstance.read();
    data.disbursements.push(record);
    await dbInstance.save(data);
    return record;
  },
  updateDisbursement: async (id, updatedFields) => {
    const data = dbInstance.read();
    const idx = data.disbursements.findIndex(d => d.id === id);
    if (idx !== -1) {
      data.disbursements[idx] = { ...data.disbursements[idx], ...updatedFields };
      await dbInstance.save(data);
      return data.disbursements[idx];
    }
    return null;
  },
  deleteDisbursement: async (id) => {
    const data = dbInstance.read();
    data.disbursements = data.disbursements.filter(d => d.id !== id);
    await dbInstance.save(data);
  },
  
  // Database Backup/Restore Integration
  restoreDatabase: async (newData) => {
    // Keep users intact so the restore doesn't lock current admins out of their active sessions,
    // or optionally restore users as well if included.
    const currentData = dbInstance.read();
    const restoredData = {
      users: newData.users || currentData.users,
      shops: newData.shops || [],
      disbursements: newData.disbursements || []
    };
    await dbInstance.save(restoredData);
  }
};
