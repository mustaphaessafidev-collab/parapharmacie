const API_URL = "/api/auth";
const TOKEN_KEY = "atlaspara_token";
const USER_KEY = "atlaspara_user";

async function postJson(path, body, fallbackMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Impossible de contacter le serveur. Vérifiez que l'API est démarrée."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export const register = (userData) =>
  postJson("/register", userData, "Erreur lors de l'inscription");

export const login = (credentials) =>
  postJson(
    "/login",
    {
      email: credentials.email,
      password: credentials.password,
    },
    "Erreur lors de la connexion"
  );

export const verifyEmail = (email, code) =>
  postJson(
    "/verify-email",
    { email, code },
    "Erreur de vérification"
  );

export const saveSession = ({ token, user }, remember) => {
  const persistent = remember ? localStorage : sessionStorage;
  const temporary = remember ? sessionStorage : localStorage;

  temporary.removeItem(TOKEN_KEY);
  temporary.removeItem(USER_KEY);
  persistent.setItem(TOKEN_KEY, token);
  persistent.setItem(USER_KEY, JSON.stringify(user));
};

export const getSession = () => {
  const token =
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const rawUser =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return null;
  }

  try {
    return { token, user: JSON.parse(rawUser) };
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};
