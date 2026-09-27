

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_HINT =
  "At least 8 characters with uppercase, lowercase, a number and one of @ $ ! % * ? &";

// Each validator returns an error string, or "" if the value is valid.
export const validateUsername = (value) => {
  const username = value.trim();
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  return "";
};

export const validateEmail = (value) => {
  const email = value.trim();
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Password is required";
  if (!passwordRegex.test(value)) return PASSWORD_HINT;
  return "";
};

// Returns an object with only the fields that have errors.
export const validateRegister = ({ username, email, password }) => {
  const errors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
};

// Login only checks that the fields are filled in and the email looks valid.
// The strong password rule applies to Register only, and your backend's
// login doesn't enforce it either.
export const validateLogin = ({ email, password }) => {
  const errors = {
    email: validateEmail(email),
    password: password ? "" : "Password is required",
  };
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
};

export const MAX_BIO = 200;
const MAX_LOCATION = 100;
const MAX_WEBSITE = 200;

// "example.com" becomes "https://example.com". Empty stays empty.
export const normalizeWebsite = (value) => {
  const website = value.trim();
  if (!website) return "";
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

export const validateProfileEdit = ({ username, bio, website, location }) => {
  const errors = {
    username: validateUsername(username),
    bio: bio.trim().length > MAX_BIO ? `Bio cannot exceed ${MAX_BIO} characters` : "",
    location:
      location.trim().length > MAX_LOCATION
        ? `Location cannot exceed ${MAX_LOCATION} characters`
        : "",
    website: "",
  };

  const site = normalizeWebsite(website);
  if (site) {
    try {
      new URL(site);
      if (site.length > MAX_WEBSITE) errors.website = `Link cannot exceed ${MAX_WEBSITE} characters`;
    } catch {
      errors.website = "Enter a valid website link";
    }
  }

  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
};