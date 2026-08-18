/* ==========================================================================
   NETFLIX DYNAMIC AUTHENTICATION & MEMBERSHIP SYSTEM (js/auth.js)
   Full dynamic user signup, login, forgot password, history, and plans in localStorage.
   ========================================================================== */

const STORAGE_KEY_USERS = 'netflix_users';
const STORAGE_KEY_CURRENT_USER = 'netflix_current_user';
const STORAGE_KEY_PROFILES = 'netflix_profiles';
const STORAGE_KEY_ACTIVE_PROFILE = 'netflix_active_profile';

// Membership Plans Definition
const MEMBERSHIP_PLANS = [
  { id: 'mobile', name: 'Mobile', price: '₹149/mo', resolution: '480p', quality: 'Fair', devices: 'Phone, Tablet' },
  { id: 'basic', name: 'Basic', price: '₹199/mo', resolution: '720p', quality: 'Good', devices: 'TV, Computer, Phone, Tablet' },
  { id: 'standard', name: 'Standard', price: '₹499/mo', resolution: '1080p', quality: 'Great', devices: 'TV, Computer, Phone, Tablet (2 screens)' },
  { id: 'premium', name: 'Premium', price: '₹649/mo', resolution: '4K + HDR', quality: 'Best', devices: 'TV, Computer, Phone, Tablet (4 screens)' }
];

// Initialize Registered Users Array in localStorage
function getUsers() {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);

  if (!stored) {
    // No users until someone actually signs up.
    const initialUsers = [];

    localStorage.setItem(
      STORAGE_KEY_USERS,
      JSON.stringify(initialUsers)
    );

    return initialUsers;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Unable to read registered users:', error);

    localStorage.setItem(
      STORAGE_KEY_USERS,
      JSON.stringify([])
    );

    return [];
  }
}
// ============================================================
// GET STARTED EMAIL CHECK
// Only registered users can enter browse.html
// ============================================================

function checkRegisteredEmail(email) {

  if (!email) {
    return {
      success: false,
      message: 'Please enter your email address.'
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const users = getUsers();

  const existingUser = users.find(
    user =>
      user.email &&
      user.email.trim().toLowerCase() === normalizedEmail
  );

  if (!existingUser) {
    return {
      success: false,
      message: 'No account found with this email. Please sign up first.'
    };
  }

  // Store the user temporarily so browse.html knows
  // which account is entering the site.
  localStorage.setItem(
    STORAGE_KEY_CURRENT_USER,
    JSON.stringify(existingUser)
  );

  return {
    success: true,
    user: existingUser
  };
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Current Logged-in User
function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  return stored ? JSON.parse(stored) : null;
}

function loginUser(email, password, rememberMe = true) {
  if (!email || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }
  
  const users = getUsers();
  const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!foundUser) {
    return { success: false, message: 'Invalid email or password. Please try again or create an account.' };
  }

  // Update session
  foundUser.lastLogin = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(foundUser));
  return { success: true, user: foundUser };
}

function signupUser(name, email, password) {
  if (!name || !email || !password) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please sign in.' };
  }

  const newUser = {
    name: name,
    email: email,
    password: password,
    plan: 'standard', // Default plan until user selects on plan.html
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));

  // Initialize profiles for new user
  const userProfiles = [
    { id: 'p1', name: name, avatar: 'assets/images/logo.jpg', isKids: false },
    { id: 'p2', name: 'Kids', avatar: 'assets/images/logo2.png', isKids: true },
    { id: 'p3', name: 'Guest', avatar: 'assets/images/spiderman.jfif', isKids: false }
  ];
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(userProfiles));
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, JSON.stringify(userProfiles[0]));

  return { success: true, user: newUser };
}

function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    return { success: false, message: 'Email and new password are required.' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return { success: false, message: 'No account found with this email address.' };
  }

  users[userIndex].password = newPassword;
  saveUsers(users);

  // If current user, update current session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
    currentUser.password = newPassword;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
  }

  return { success: true, message: 'Password updated successfully! You can now sign in.' };
}

function setUserPlan(planId) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.plan = planId;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));

    const users = getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (idx !== -1) {
      users[idx].plan = planId;
      saveUsers(users);
    }
  }
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  window.location.href = 'index.html';
}

function getProfiles() {
  const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
  if (!stored) {
    const currentUser = getCurrentUser();
    const userName = currentUser ? currentUser.name : 'Vinay';
    const defaultProfs = [
      { id: 'p1', name: userName, avatar: 'assets/images/logo.jpg', isKids: false },
      { id: 'p2', name: 'Kids', avatar: 'assets/images/logo2.png', isKids: true },
      { id: 'p3', name: 'Guest', avatar: 'assets/images/spiderman.jfif', isKids: false }
    ];
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(defaultProfs));
    return defaultProfs;
  }
  return JSON.parse(stored);
}

function getActiveProfile() {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
  if (!stored) {
    const profs = getProfiles();
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, JSON.stringify(profs[0]));
    return profs[0];
  }
  return JSON.parse(stored);
}

function setActiveProfile(profileId) {
  const profs = getProfiles();
  const found = profs.find(p => p.id === profileId);
  if (found) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, JSON.stringify(found));
    return found;
  }
  return null;
}
