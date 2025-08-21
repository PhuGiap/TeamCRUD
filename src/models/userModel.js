// src/models/userModel.js

// Helper format date
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

class User {
  constructor({ id, name, email, role, created_at }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.created_at = formatDate(created_at);
  }
}

// “Database” in-memory
User.data = [];
User.autoIncrementId = 1;

User.getAll = async function () {
  return User.data.map(u => new User(u));
};

User.getById = async function (id) {
  const user = User.data.find(u => u.id === id);
  return user ? new User(user) : null;
};

User.getByEmail = async function (email) {
  const user = User.data.find(u => u.email === email);
  return user ? new User(user) : null;
};

User.create = async function ({ name, email, password, role }) {
  // Validation
  if (!name || !email || !password || !role) {
    throw new Error('All fields are required');
  }
  // Check unique email
  if (User.data.some(u => u.email === email)) {
    throw new Error('Email already exists');
  }

  const newUser = {
    id: User.autoIncrementId++,
    name,
    email,
    role,
    created_at: new Date()
  };
  User.data.push(newUser);
  return new User(newUser);
};

User.update = async function (id, { name, email, password, role }) {
  const index = User.data.findIndex(u => u.id === id);
  if (index === -1) return null;

  const existingEmail = User.data.find(u => u.email === email && u.id !== id);
  if (existingEmail) throw new Error('Email already exists');

  User.data[index] = {
    ...User.data[index],
    name: name ?? User.data[index].name,
    email: email ?? User.data[index].email,
    role: role ?? User.data[index].role,
    created_at: User.data[index].created_at
  };
  return new User(User.data[index]);
};

User.delete = async function (id) {
  const index = User.data.findIndex(u => u.id === id);
  if (index === -1) return null;
  const deleted = User.data.splice(index, 1)[0];
  return new User(deleted);
};

module.exports = User;
