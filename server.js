import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-before-deploy';
const JWT_EXPIRATION_MS = 86400000;

const HOSPITALS = [
  'Colombo General Hospital',
  'Sri Jayewardenepura General Hospital',
  'National Hospital of Sri Lanka',
  'Kandy Teaching Hospital',
  'Ruhuna University Teaching Hospital',
  'Jaffna Teaching Hospital',
  'Anuradhapura Teaching Hospital',
  'Batticaloa Teaching Hospital',
  'Negombo General Hospital',
  'Matara General Hospital',
];

const BLOOD_GROUP_KEYS = {
  'A+': 'aPositive',
  A_positive: 'aPositive',
  'A-': 'aNegative',
  A_negative: 'aNegative',
  'B+': 'bPositive',
  B_positive: 'bPositive',
  'B-': 'bNegative',
  B_negative: 'bNegative',
  'AB+': 'abPositive',
  AB_positive: 'abPositive',
  'AB-': 'abNegative',
  AB_negative: 'abNegative',
  'O+': 'oPositive',
  O_positive: 'oPositive',
  'O-': 'oNegative',
  O_negative: 'oNegative',
};

// In-memory store with realistic clinical seed data
let nextDonorId = 9;
let nextRequestId = 6;
let nextInboxId = 4;
let nextHistoryId = 6;
let nextActivityId = 7;

const donors = [
  {
    id: 1,
    name: 'Kavinda Perera',
    fatherName: 'Nimal Perera',
    gender: 'male',
    dateOfBirth: '1994-04-12',
    bloodGroup: 'O+',
    bodyWeight: '72',
    email: 'kavinda.perera@example.lk',
    province: 'Western',
    district: 'Colombo',
    address: '42 Ward Place, Colombo 07',
    contactNumber: '0774128930',
    lastBloodDonatedDate: '2026-06-18',
    newDonor: false,
    active: true,
    available: true,
  },
  {
    id: 2,
    name: 'Nirosha Sivalingam',
    fatherName: 'Sivalingam Raj',
    gender: 'female',
    dateOfBirth: '1997-09-23',
    bloodGroup: 'A+',
    bodyWeight: '58',
    email: 'nirosha.s@example.lk',
    province: 'Northern',
    district: 'Jaffna',
    address: '18 Hospital Road, Jaffna',
    contactNumber: '0768831245',
    lastBloodDonatedDate: '2026-07-04',
    newDonor: false,
    active: true,
    available: true,
  },
  {
    id: 3,
    name: 'Tharindu Bandara',
    fatherName: 'Senaka Bandara',
    gender: 'male',
    dateOfBirth: '1991-11-05',
    bloodGroup: 'O-',
    bodyWeight: '76',
    email: 'tharindu.b@example.lk',
    province: 'Central',
    district: 'Kandy',
    address: '105 Peradeniya Road, Kandy',
    contactNumber: '0715490211',
    lastBloodDonatedDate: '2026-05-20',
    newDonor: false,
    active: true,
    available: true,
  },
  {
    id: 4,
    name: 'Fathima Rizna',
    fatherName: 'Mohamed Rizwan',
    gender: 'female',
    dateOfBirth: '1999-02-14',
    bloodGroup: 'B+',
    bodyWeight: '56',
    email: 'fathima.rizna@example.lk',
    province: 'Eastern',
    district: 'Batticaloa',
    address: '29 Trinco Road, Batticaloa',
    contactNumber: '0759023318',
    lastBloodDonatedDate: null,
    newDonor: true,
    active: true,
    available: true,
  },
  {
    id: 5,
    name: 'Dilshan Wickramasinghe',
    fatherName: 'Anura Wickramasinghe',
    gender: 'male',
    dateOfBirth: '1989-08-30',
    bloodGroup: 'AB+',
    bodyWeight: '80',
    email: 'dilshan.w@example.lk',
    province: 'Southern',
    district: 'Galle',
    address: '64 Wakwella Road, Galle',
    contactNumber: '0772194408',
    lastBloodDonatedDate: '2026-09-29',
    newDonor: false,
    active: true,
    available: false,
  },
  {
    id: 6,
    name: 'Harini Jayawardena',
    fatherName: 'Ruwan Jayawardena',
    gender: 'female',
    dateOfBirth: '1996-12-08',
    bloodGroup: 'A-',
    bodyWeight: '59',
    email: 'harini.j@example.lk',
    province: 'NorthWestern',
    district: 'Kurunegala',
    address: '14 Colombo Road, Kurunegala',
    contactNumber: '0703349812',
    lastBloodDonatedDate: '2026-04-11',
    newDonor: false,
    active: true,
    available: true,
  },
  {
    id: 7,
    name: 'Suresh Karunanayake',
    fatherName: 'Lalith Karunanayake',
    gender: 'male',
    dateOfBirth: '2000-01-19',
    bloodGroup: 'B-',
    bodyWeight: '68',
    email: 'suresh.k@example.lk',
    province: 'Western',
    district: 'Gampaha',
    address: '88 Negombo Road, Gampaha',
    contactNumber: '0761182934',
    lastBloodDonatedDate: null,
    newDonor: true,
    active: false,
    available: true,
  },
  {
    id: 8,
    name: 'Malithi De Silva',
    fatherName: 'Upali De Silva',
    gender: 'female',
    dateOfBirth: '1995-07-27',
    bloodGroup: 'AB-',
    bodyWeight: '55',
    email: 'malithi.ds@example.lk',
    province: 'Southern',
    district: 'Matara',
    address: '31 Beach Road, Matara',
    contactNumber: '0718842209',
    lastBloodDonatedDate: null,
    newDonor: true,
    active: false,
    available: true,
  },
];

const bloodRequests = [
  {
    id: 1,
    patientName: 'Rohan Wijesinghe',
    gender: 'male',
    bloodGroupType: 'O-',
    units: '3',
    hospitalAddress: 'National Hospital of Sri Lanka',
    doctorName: 'Dr. K. Senanayake',
    requiredDate: '2026-11-17',
    email: 'emergency.ward@nhsl.lk',
    contactNumber: '0112691111',
    reason: 'Emergency trauma surgery in ICU Ward 4',
    urgency: 'urgent',
    status: 'Pending',
    createdAt: '2026-11-16T08:15:00Z',
  },
  {
    id: 2,
    patientName: 'Anjali Ratnayake',
    gender: 'female',
    bloodGroupType: 'A+',
    units: '2',
    hospitalAddress: 'Jaffna Teaching Hospital',
    doctorName: 'Dr. P. Mahendran',
    requiredDate: '2026-11-18',
    email: 'hematology@jth.lk',
    contactNumber: '0212222261',
    reason: 'Post-operative hemoglobin recovery',
    urgency: 'urgent',
    status: 'In Progress',
    createdAt: '2026-11-16T06:40:00Z',
  },
  {
    id: 3,
    patientName: 'Mohamed Ashraff',
    gender: 'male',
    bloodGroupType: 'B+',
    units: '2',
    hospitalAddress: 'Kandy Teaching Hospital',
    doctorName: 'Dr. R. Dissanayake',
    requiredDate: '2026-11-20',
    email: 'cardiac@kandyhospital.lk',
    contactNumber: '0812233337',
    reason: 'Scheduled cardiac valve replacement procedure',
    urgency: 'normal',
    status: 'Pending',
    createdAt: '2026-11-15T14:20:00Z',
  },
  {
    id: 4,
    patientName: 'Chamari Abeysekera',
    gender: 'female',
    bloodGroupType: 'O+',
    units: '4',
    hospitalAddress: 'Colombo General Hospital',
    doctorName: 'Dr. S. Gunasekara',
    requiredDate: '2026-11-19',
    email: 'oncology@cgh.lk',
    contactNumber: '0112694455',
    reason: 'Thalassemia regular transfusion support',
    urgency: 'normal',
    status: 'In Progress',
    createdAt: '2026-11-15T09:10:00Z',
  },
  {
    id: 5,
    patientName: 'Nadeesha Fernando',
    gender: 'female',
    bloodGroupType: 'AB+',
    units: '1',
    hospitalAddress: 'Sri Jayewardenepura General Hospital',
    doctorName: 'Dr. H. Wickrama',
    requiredDate: '2026-11-14',
    email: 'maternity@sjgh.lk',
    contactNumber: '0112778610',
    reason: 'Maternity unit surgical standby',
    urgency: 'normal',
    status: 'Fulfilled',
    createdAt: '2026-11-13T11:30:00Z',
  },
];

const inboxMessages = [
  {
    id: 1,
    fullName: 'Dr. Priyantha Jayaweera',
    phoneNumber: '0112691120',
    email: 'p.jayaweera@nhsl.lk',
    hospital: 'National Hospital of Sri Lanka',
    message: 'Requesting urgent cross-match confirmation for 3 units of O- negative packed red cells for Surgical ICU.',
    createdAt: '2026-11-16T07:50:00Z',
  },
  {
    id: 2,
    fullName: 'Kajendran Nadarajah',
    phoneNumber: '0776543210',
    email: 'kajendran@example.lk',
    hospital: 'Jaffna Teaching Hospital',
    message: 'We are organizing a university blood donation camp next Friday for 45 student volunteers. Please coordinate mobile unit support.',
    createdAt: '2026-11-15T16:15:00Z',
  },
  {
    id: 3,
    fullName: 'Nurse Kumari Wijeratne',
    phoneNumber: '0812224490',
    email: 'kumari.w@kandyhospital.lk',
    hospital: 'Kandy Teaching Hospital',
    message: 'Weekly AB- inventory audit completed; please flag AB- and B- for donor outreach.',
    createdAt: '2026-11-14T11:05:00Z',
  },
];

const INITIAL_STOCK_MATRIX = [
  [26, 7, 19, 5, 11, 2, 34, 4],
  [18, 6, 14, 4, 9, 3, 28, 5],
  [32, 9, 24, 6, 13, 3, 41, 3],
  [21, 5, 16, 4, 8, 2, 29, 6],
  [15, 4, 12, 3, 7, 1, 22, 4],
  [19, 6, 15, 5, 9, 2, 25, 5],
  [12, 3, 11, 2, 6, 1, 18, 3],
  [11, 3, 10, 3, 5, 1, 16, 2],
  [14, 4, 13, 3, 6, 2, 21, 4],
  [10, 2, 9, 2, 4, 1, 15, 2],
];

const bloodStocks = HOSPITALS.map((hospitalName, index) => {
  const [aPositive, aNegative, bPositive, bNegative, abPositive, abNegative, oPositive, oNegative] =
    INITIAL_STOCK_MATRIX[index];
  return {
    id: index + 1,
    hospitalName,
    aPositive,
    aNegative,
    bPositive,
    bNegative,
    abPositive,
    abNegative,
    oPositive,
    oNegative,
  };
});

const stockHistory = [
  {
    id: 1,
    hospitalName: 'National Hospital of Sri Lanka',
    bloodGroup: 'O+',
    action: 'increase',
    units: 6,
    timestamp: '2026-11-16T08:45:00Z',
    performedBy: 'Dr. Kavitha Ratnasiri',
  },
  {
    id: 2,
    hospitalName: 'Jaffna Teaching Hospital',
    bloodGroup: 'A+',
    action: 'decrease',
    units: 2,
    timestamp: '2026-11-16T07:20:00Z',
    performedBy: 'Dr. Kavitha Ratnasiri',
  },
  {
    id: 3,
    hospitalName: 'Colombo General Hospital',
    bloodGroup: 'B+',
    action: 'increase',
    units: 4,
    timestamp: '2026-11-15T17:10:00Z',
    performedBy: 'Admin',
  },
  {
    id: 4,
    hospitalName: 'Kandy Teaching Hospital',
    bloodGroup: 'O-',
    action: 'decrease',
    units: 1,
    timestamp: '2026-11-15T13:30:00Z',
    performedBy: 'Admin',
  },
  {
    id: 5,
    hospitalName: 'Sri Jayewardenepura General Hospital',
    bloodGroup: 'AB+',
    action: 'decrease',
    units: 1,
    timestamp: '2026-11-14T15:05:00Z',
    performedBy: 'Dr. Kavitha Ratnasiri',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'request',
    title: 'Urgent O- request logged',
    detail: 'National Hospital of Sri Lanka · 3 units required by Dr. K. Senanayake',
    timestamp: '2026-11-16T08:15:00Z',
  },
  {
    id: 2,
    type: 'stock',
    title: 'Stock replenished (+6 units O+)',
    detail: 'National Hospital of Sri Lanka blood bank cold storage updated',
    timestamp: '2026-11-16T08:45:00Z',
  },
  {
    id: 3,
    type: 'donor',
    title: 'New donor pending review',
    detail: 'Malithi De Silva (AB-, Matara) submitted registration for screening',
    timestamp: '2026-11-15T18:20:00Z',
  },
  {
    id: 4,
    type: 'inbox',
    title: 'Campus blood drive inquiry',
    detail: 'Jaffna Teaching Hospital · 45 volunteers scheduled for Friday',
    timestamp: '2026-11-15T16:15:00Z',
  },
  {
    id: 5,
    type: 'request',
    title: 'Request fulfilled for Maternity Unit',
    detail: 'Nadeesha Fernando (AB+, 1 unit) · Sri Jayewardenepura General Hospital',
    timestamp: '2026-11-14T15:05:00Z',
  },
  {
    id: 6,
    type: 'donor',
    title: 'Donor verified and activated',
    detail: 'Harini Jayawardena (A-, Kurunegala) added to active donor registry',
    timestamp: '2026-11-14T10:00:00Z',
  },
];

let fulfilledRequestsOffset = 142;
let successfulDonationsBaseline = 318;

const monthlyDonations = [
  { month: 'Jun', donations: 44, requests: 38 },
  { month: 'Jul', donations: 52, requests: 45 },
  { month: 'Aug', donations: 49, requests: 41 },
  { month: 'Sep', donations: 61, requests: 53 },
  { month: 'Oct', donations: 58, requests: 50 },
  { month: 'Nov', donations: 54, requests: 47 },
];

let coordinatorProfile = {
  fullName: 'Dr. Kavitha Ratnasiri',
  username: ADMIN_USERNAME,
  role: 'Chief Blood Bank Coordinator',
  hospital: 'National Hospital of Sri Lanka',
  email: 'thushakarant@gmail.com',
  phone: '+94 76 297 1306',
  location: 'Hospital Road, Jaffna / Colombo Network',
  bloodGroup: 'O+',
  donorId: 'BS-CRD-0104',
  eligibleToDonate: true,
  lastDonatedDate: '2026-07-12',
  notifyUrgentRequests: true,
  notifyLowStock: true,
  notifyNewDonors: true,
  personalDonations: [
    { id: 1, date: '2026-07-12', center: 'Jaffna Teaching Hospital', component: 'Whole Blood', units: '450 ml', status: 'Completed' },
    { id: 2, date: '2026-03-04', center: 'National Hospital of Sri Lanka', component: 'Whole Blood', units: '450 ml', status: 'Completed' },
    { id: 3, date: '2025-10-19', center: 'Colombo General Hospital', component: 'Platelets', units: '300 ml', status: 'Completed' },
  ],
};

function addActivity(type, title, detail) {
  recentActivities.unshift({
    id: nextActivityId++,
    type,
    title,
    detail,
    timestamp: new Date().toISOString(),
  });
  if (recentActivities.length > 25) recentActivities.pop();
}

function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function signToken(username) {
  const now = Date.now();
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: username,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + JWT_EXPIRATION_MS) / 1000),
    })
  );
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.sub || (decoded.exp && decoded.exp * 1000 < Date.now())) {
      return null;
    }
    return decoded.sub;
  } catch {
    return null;
  }
}

function isBlank(value) {
  return typeof value !== 'string' || value.trim().length === 0;
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function requireFields(body, fields) {
  for (const field of fields) {
    if (isBlank(body?.[field])) {
      return `${field} is required`;
    }
  }
  return null;
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const username = verifyToken(header.slice(7));
  if (!username || username !== ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.adminUser = username;
  return next();
}

function filterActiveDonors(query) {
  const active = donors.filter((d) => d.active);
  if (isBlank(query)) {
    return active;
  }
  const q = query.trim().toLowerCase();
  return active.filter((d) =>
    [d.name, d.fatherName, d.gender, d.bloodGroup, d.province, d.district]
      .map((v) => String(v || '').toLowerCase())
      .some((v) => v.includes(q))
  );
}

function computeStockByGroup() {
  const totals = {
    'O+': 0,
    'O-': 0,
    'A+': 0,
    'A-': 0,
    'B+': 0,
    'B-': 0,
    'AB+': 0,
    'AB-': 0,
  };
  for (const s of bloodStocks) {
    totals['O+'] += s.oPositive;
    totals['O-'] += s.oNegative;
    totals['A+'] += s.aPositive;
    totals['A-'] += s.aNegative;
    totals['B+'] += s.bPositive;
    totals['B-'] += s.bNegative;
    totals['AB+'] += s.abPositive;
    totals['AB-'] += s.abNegative;
  }
  return Object.entries(totals).map(([bloodGroup, units]) => ({
    bloodGroup,
    units,
    status: units < 25 ? 'Critical' : units < 50 ? 'Low Stock' : 'Optimal',
  }));
}

const app = express();
app.use(express.json());

// Public overview endpoint for Home page metrics & recent anonymized requests
app.get('/api/public/overview', (_req, res) => {
  const stockByGroup = computeStockByGroup();
  const availableUnits = stockByGroup.reduce((sum, g) => sum + g.units, 0);
  const fulfilledCount = bloodRequests.filter((r) => r.status === 'Fulfilled').length;

  return res.json({
    totalDonors: donors.length,
    activeDonors: donors.filter((d) => d.active).length,
    availableUnits,
    successfulDonations: successfulDonationsBaseline + donors.filter((d) => d.active).length,
    requestsFulfilled: fulfilledRequestsOffset + fulfilledCount,
    stockByGroup,
    recentRequests: bloodRequests
      .filter((r) => r.status !== 'Fulfilled')
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        bloodGroupType: r.bloodGroupType,
        units: r.units,
        hospitalAddress: r.hospitalAddress,
        requiredDate: r.requiredDate,
        urgency: r.urgency || 'normal',
        status: r.status || 'Pending',
        reason: r.reason,
      })),
  });
});

// Public hospitals list
app.get('/api/public/hospitals', (_req, res) => {
  return res.json(
    HOSPITALS.map((hospitalName, idx) => ({
      id: idx + 1,
      hospitalName,
      address: `${hospitalName}, Sri Lanka`,
      contactNumber: '0762971306',
    }))
  );
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const missing = requireFields(req.body, ['username', 'password']);
  if (missing) return res.status(400).json({ message: missing });

  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Username or password do not match' });
  }
  return res.json({ token: signToken(username), username, role: 'SUPERADMIN', hospitalName: '' });
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  return res.json({ token, username: req.adminUser, role: 'SUPERADMIN', hospitalName: '' });
});

// Notifications endpoints
app.get('/api/notifications', requireAdmin, (_req, res) => {
  const lowStockGroups = computeStockByGroup().filter((g) => g.status !== 'Optimal');
  const urgentRequests = bloodRequests.filter((r) => r.urgency === 'urgent' && r.status !== 'Fulfilled');
  const list = [
    ...urgentRequests.map((r) => ({
      id: r.id,
      title: `Urgent ${r.bloodGroupType} request (${r.units} units)`,
      detail: `${r.hospitalAddress} · Required ${r.requiredDate || 'ASAP'}`,
      severity: 'critical',
      active: true,
      seen: false,
      link: `/dashboard/requests/${r.id}`,
    })),
    ...lowStockGroups.map((g, i) => ({
      id: 100 + i,
      title: `${g.bloodGroup} network stock is ${g.status.toLowerCase()}`,
      detail: `${g.units} total units remaining across 10 hospitals`,
      severity: g.status === 'Critical' ? 'critical' : 'warning',
      active: true,
      seen: false,
      link: '/dashboard/stock',
    })),
  ];
  return res.json(list);
});

app.get('/api/notifications/unseen-count', requireAdmin, (_req, res) => {
  return res.json({ count: 0 });
});

app.put('/api/notifications/:id/seen', requireAdmin, (req, res) => {
  return res.json({ id: Number(req.params.id), seen: true, seenAt: new Date().toISOString(), active: true });
});

app.put('/api/notifications/seen', requireAdmin, (_req, res) => {
  return res.json({ message: 'All notifications marked seen' });
});

// Dashboard stats & analytics
app.get('/api/dashboard/stats', requireAdmin, (_req, res) => {
  const activeDonors = donors.filter((d) => d.active).length;
  const inactiveDonors = donors.filter((d) => !d.active).length;
  return res.json({
    activeDonors,
    inactiveDonors,
    inboxMessages: inboxMessages.length,
    bloodRequests: bloodRequests.length,
  });
});

app.get('/api/dashboard/analytics', requireAdmin, (_req, res) => {
  const stockByGroup = computeStockByGroup();
  const lowStockGroups = stockByGroup.filter((g) => g.status !== 'Optimal');
  const pendingDonorsCount = donors.filter((d) => !d.active).length;
  const urgentRequests = bloodRequests.filter((r) => r.urgency === 'urgent' && r.status !== 'Fulfilled');

  const notifications = [];
  for (const r of urgentRequests) {
    notifications.push({
      id: `req-${r.id}`,
      severity: 'critical',
      title: `Urgent ${r.bloodGroupType} request (${r.units} units)`,
      detail: `${r.hospitalAddress} · Required ${r.requiredDate || 'ASAP'}`,
      to: `/dashboard/requests/${r.id}`,
    });
  }
  for (const g of lowStockGroups) {
    notifications.push({
      id: `stock-${g.bloodGroup}`,
      severity: g.status === 'Critical' ? 'critical' : 'warning',
      title: `${g.bloodGroup} network stock is ${g.status.toLowerCase()}`,
      detail: `${g.units} total units remaining across 10 hospitals`,
      to: '/dashboard/stock',
    });
  }
  if (pendingDonorsCount > 0) {
    notifications.push({
      id: 'pending-donors',
      severity: 'warning',
      title: `${pendingDonorsCount} donor${pendingDonorsCount > 1 ? 's' : ''} awaiting verification`,
      detail: 'Review screening eligibility and activate donor profiles',
      to: '/dashboard/inactive-donors',
    });
  }

  return res.json({
    stockByGroup,
    totalUnits: stockByGroup.reduce((sum, g) => sum + g.units, 0),
    monthlyDonations,
    stockHistory: stockHistory.slice(0, 12),
    recentActivities: recentActivities.slice(0, 10),
    notifications,
    donationHistory: donors
      .filter((d) => d.active && d.lastBloodDonatedDate)
      .map((d) => ({
        id: d.id,
        donorName: d.name,
        bloodGroup: d.bloodGroup,
        district: d.district,
        date: d.lastBloodDonatedDate,
        status: 'Completed',
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date))),
  });
});

// Donors endpoints
app.post('/api/donors', (req, res) => {
  const missing = requireFields(req.body, [
    'name',
    'fatherName',
    'gender',
    'bloodGroup',
    'bodyWeight',
    'email',
    'province',
    'district',
    'address',
    'contactNumber',
  ]);
  if (missing) return res.status(400).json({ message: missing });
  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'email is invalid' });
  }

  const donor = {
    id: nextDonorId++,
    name: req.body.name.trim(),
    fatherName: req.body.fatherName.trim(),
    gender: req.body.gender.trim(),
    dateOfBirth: req.body.dateOfBirth || null,
    bloodGroup: req.body.bloodGroup.trim(),
    bodyWeight: String(req.body.bodyWeight).trim(),
    email: req.body.email.trim(),
    province: req.body.province.trim(),
    district: req.body.district.trim(),
    address: req.body.address.trim(),
    contactNumber: req.body.contactNumber.trim(),
    lastBloodDonatedDate: req.body.lastBloodDonatedDate || null,
    newDonor: Boolean(req.body.newDonor),
    active: false,
    available: true,
  };
  donors.push(donor);
  addActivity('donor', 'New donor registration', `${donor.name} (${donor.bloodGroup}, ${donor.district}) awaiting activation`);
  return res.json({ message: 'Registration successful' });
});

app.get('/api/donors/search', (req, res) => {
  return res.json(filterActiveDonors(req.query.q));
});

app.get('/api/donors/active', requireAdmin, (req, res) => {
  return res.json(filterActiveDonors(req.query.q));
});

app.get('/api/donors/inactive', requireAdmin, (_req, res) => {
  return res.json(donors.filter((d) => !d.active));
});

app.put('/api/donors/:id/activate', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const donor = donors.find((d) => d.id === id);
  if (!donor) return res.status(404).json({ message: 'Donor not found' });
  donor.active = true;
  donor.available = true;
  addActivity('donor', 'Donor activated', `${donor.name} (${donor.bloodGroup}, ${donor.district}) approved for active registry`);
  return res.json({ message: 'Donor activated' });
});

app.put('/api/donors/:id/availability', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const donor = donors.find((d) => d.id === id);
  if (!donor) return res.status(404).json({ message: 'Donor not found' });
  donor.available = typeof req.body?.available === 'boolean' ? req.body.available : !donor.available;
  return res.json({ message: `Donor marked ${donor.available ? 'available' : 'unavailable'}`, available: donor.available });
});

app.delete('/api/donors/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = donors.findIndex((d) => d.id === id);
  if (index === -1) return res.status(404).json({ message: 'Donor not found' });
  const [removed] = donors.splice(index, 1);
  addActivity('donor', 'Donor record removed', `${removed.name} (${removed.bloodGroup}) deleted from registry`);
  return res.json({ message: 'Donor deleted' });
});

// Blood requests endpoints
app.post('/api/requests', (req, res) => {
  const missing = requireFields(req.body, [
    'patientName',
    'gender',
    'bloodGroupType',
    'units',
    'hospitalAddress',
    'doctorName',
    'email',
    'contactNumber',
    'reason',
  ]);
  if (missing) return res.status(400).json({ message: missing });
  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'email is invalid' });
  }

  const created = {
    id: nextRequestId++,
    patientName: req.body.patientName.trim(),
    gender: req.body.gender.trim(),
    bloodGroupType: req.body.bloodGroupType.trim(),
    units: String(req.body.units).trim(),
    hospitalAddress: req.body.hospitalAddress.trim(),
    doctorName: req.body.doctorName.trim(),
    requiredDate: req.body.requiredDate || null,
    email: req.body.email.trim(),
    contactNumber: req.body.contactNumber.trim(),
    reason: req.body.reason.trim(),
    urgency: req.body.urgency === 'urgent' ? 'urgent' : 'normal',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  bloodRequests.unshift(created);
  addActivity(
    'request',
    `${created.urgency === 'urgent' ? 'Urgent' : 'New'} ${created.bloodGroupType} request`,
    `${created.patientName} · ${created.units} unit(s) at ${created.hospitalAddress}`
  );
  return res.json({ message: 'Request successful' });
});

app.get('/api/requests', requireAdmin, (_req, res) => {
  return res.json(bloodRequests);
});

app.get('/api/requests/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const item = bloodRequests.find((r) => r.id === id);
  if (!item) return res.status(404).json({ message: 'Request not found' });
  const matchingDonors = donors.filter(
    (d) => d.active && d.bloodGroup === item.bloodGroupType
  );
  return res.json({ ...item, matchingDonors });
});

app.put('/api/requests/:id/status', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const item = bloodRequests.find((r) => r.id === id);
  if (!item) return res.status(404).json({ message: 'Request not found' });
  const allowed = ['Pending', 'In Progress', 'Fulfilled'];
  const nextStatus = req.body?.status;
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  item.status = nextStatus;
  addActivity('request', `Request #${item.id} marked ${nextStatus}`, `${item.patientName} (${item.bloodGroupType}) · ${item.hospitalAddress}`);
  return res.json({ message: `Request status updated to ${nextStatus}`, request: item });
});

app.delete('/api/requests/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = bloodRequests.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ message: 'Request not found' });
  const [removed] = bloodRequests.splice(index, 1);
  if (removed.status === 'Fulfilled') {
    fulfilledRequestsOffset += 1;
  }
  addActivity('request', 'Blood request closed', `${removed.patientName} (${removed.bloodGroupType}) removed from queue`);
  return res.json({ message: 'Request deleted' });
});

// Inbox endpoints
app.post('/api/inbox', (req, res) => {
  const missing = requireFields(req.body, [
    'fullName',
    'phoneNumber',
    'email',
    'hospital',
    'message',
  ]);
  if (missing) return res.status(400).json({ message: missing });
  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'email is invalid' });
  }

  const msg = {
    id: nextInboxId++,
    fullName: req.body.fullName.trim(),
    phoneNumber: req.body.phoneNumber.trim(),
    email: req.body.email.trim(),
    hospital: req.body.hospital.trim(),
    message: req.body.message.trim(),
    createdAt: new Date().toISOString(),
  };
  inboxMessages.unshift(msg);
  addActivity('inbox', 'New message received', `${msg.fullName} regarding ${msg.hospital}`);
  return res.json({ message: 'Message sent successfully' });
});

app.get('/api/inbox', requireAdmin, (_req, res) => {
  return res.json(inboxMessages);
});

app.delete('/api/inbox/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const index = inboxMessages.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ message: 'Message not found' });
  inboxMessages.splice(index, 1);
  return res.json({ message: 'Message deleted' });
});

// Blood stock endpoints
app.get('/api/stock', requireAdmin, (_req, res) => {
  return res.json(bloodStocks);
});

app.put('/api/stock', requireAdmin, (req, res) => {
  const missing = requireFields(req.body, ['hospitalName', 'bloodGroup', 'action']);
  if (missing) return res.status(400).json({ message: missing });

  const units = Number(req.body.units);
  if (!Number.isInteger(units) || units < 1) {
    return res.status(400).json({ message: 'units must be at least 1' });
  }

  const stock = bloodStocks.find((s) => s.hospitalName === req.body.hospitalName);
  if (!stock) return res.status(404).json({ message: 'Hospital not found' });

  const key = BLOOD_GROUP_KEYS[req.body.bloodGroup];
  if (!key) return res.status(400).json({ message: 'Unknown blood group' });

  const isDecrease = String(req.body.action).toLowerCase() === 'decrease';
  const current = stock[key];
  stock[key] = isDecrease ? Math.max(0, current - units) : current + units;

  const entry = {
    id: nextHistoryId++,
    hospitalName: stock.hospitalName,
    bloodGroup: req.body.bloodGroup,
    action: isDecrease ? 'decrease' : 'increase',
    units,
    timestamp: new Date().toISOString(),
    performedBy: coordinatorProfile.fullName,
  };
  stockHistory.unshift(entry);
  addActivity(
    'stock',
    `Stock ${isDecrease ? 'dispatched' : 'replenished'} (${isDecrease ? '-' : '+'}${units} ${req.body.bloodGroup})`,
    stock.hospitalName
  );

  return res.json({ message: 'Stock updated successfully' });
});

// Coordinator Profile endpoints
app.get('/api/profile', requireAdmin, (_req, res) => {
  return res.json(coordinatorProfile);
});

app.put('/api/profile', requireAdmin, (req, res) => {
  const allowedFields = [
    'fullName',
    'role',
    'hospital',
    'email',
    'phone',
    'location',
    'bloodGroup',
    'eligibleToDonate',
    'lastDonatedDate',
    'notifyUrgentRequests',
    'notifyLowStock',
    'notifyNewDonors',
  ];
  for (const field of allowedFields) {
    if (req.body && field in req.body) {
      coordinatorProfile[field] = req.body[field];
    }
  }
  return res.json({ message: 'Profile updated successfully', profile: coordinatorProfile });
});

async function start() {
  const distDir = path.resolve(__dirname, 'frontend', 'dist');
  const aistudioAssetsDir = path.resolve(__dirname, 'public', 'assets', 'aistudio');
  if (fs.existsSync(aistudioAssetsDir)) {
    app.use('/assets/aistudio', express.static(aistudioAssetsDir));
  }

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: path.resolve(__dirname, 'frontend'),
      configFile: path.resolve(__dirname, 'frontend', 'vite.config.js'),
      server: {
        middlewareMode: true,
        host: HOST,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Blood Share server running at http://${HOST}:${PORT}`);
  });
}

start();
