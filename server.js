require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false
  })
);

// Serve static UI from /public
app.use(express.static(path.join(__dirname, 'public')));

// ----- In-memory data (NOT for real banking, just demo) -----
const users = [
  {
    id: 1,
    username: 'alice',
    password: 'password123', // plain text only for demo
    name: 'Alice Doe'
  },
  {
    id: 2,
    username: 'bob',
    password: 'password123',
    name: 'Bob Smith'
  }
];

let accounts = [
  // each: { id, userId, type, balance }
  { id: 1001, userId: 1, type: 'CHECKING', balance: 1000 },
  { id: 1002, userId: 1, type: 'SAVINGS', balance: 5000 },
  { id: 2001, userId: 2, type: 'CHECKING', balance: 750 }
];

let transfers = []; // each: { id, fromAccountId, toAccountId, amount, timestamp }

// ----- Helper auth middleware -----
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

function currentUser(req) {
  return users.find(u => u.id === req.session.userId) || null;
}

// ----- Routes -----
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Auth: login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    u => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.userId = user.id;
  res.json({
    id: user.id,
    username: user.username,
    name: user.name
  });
});

// Auth: logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// Get current user
app.get('/api/me', requireAuth, (req, res) => {
  const user = currentUser(req);
  res.json({
    id: user.id,
    username: user.username,
    name: user.name
  });
});

// List accounts for current user
app.get('/api/accounts', requireAuth, (req, res) => {
  const user = currentUser(req);
  const userAccounts = accounts.filter(a => a.userId === user.id);
  res.json(userAccounts);
});

// Transfer between accounts
app.post('/api/transfer', requireAuth, (req, res) => {
  const user = currentUser(req);
  const { fromAccountId, toAccountId, amount } = req.body;

  const amt = Number(amount);
  if (!fromAccountId || !toAccountId || !amt || amt <= 0) {
    return res.status(400).json({ error: 'Invalid transfer data' });
  }

  const from = accounts.find(
    a => a.id === Number(fromAccountId) && a.userId === user.id
  );
  const to = accounts.find(a => a.id === Number(toAccountId));

  if (!from) {
    return res
      .status(400)
      .json({ error: 'From account not found or not owned by user' });
  }
  if (!to) {
    return res.status(400).json({ error: 'To account not found' });
  }
  if (from.balance < amt) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  from.balance -= amt;
  to.balance += amt;

  const transfer = {
    id: transfers.length + 1,
    fromAccountId: from.id,
    toAccountId: to.id,
    amount: amt,
    timestamp: new Date().toISOString()
  };
  transfers.push(transfer);

  res.json({
    status: 'SUCCESS',
    transfer
  });
});

// Transfer history for current user
app.get('/api/transfers', requireAuth, (req, res) => {
  const user = currentUser(req);
  const userAccountIds = accounts
    .filter(a => a.userId === user.id)
    .map(a => a.id);

  const myTransfers = transfers.filter(
    t =>
      userAccountIds.includes(t.fromAccountId) ||
      userAccountIds.includes(t.toAccountId)
  );

  res.json(myTransfers);
});


// ----- Start server -----
app.listen(PORT, () => {
  console.log(`Banking app listening on http://localhost:${PORT}`);
});