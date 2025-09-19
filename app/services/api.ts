const API_BASE = "http://localhost:1977/api/transactions"; // adjust if needed

export async function signup(username: string, email: string, password: string) {
  const res = await fetch("http://localhost:1977/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Signup failed");
  }
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch("http://localhost:1977/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json(); // { token, message }
}

function getToken() {
  return localStorage.getItem("token");
}

// Upload FE (Host) file
export async function uploadHostFile(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 include JWT
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Host file upload failed");
  }
  return res.json();
}

// Upload Issuer file
export async function uploadIssuerFile(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("issuerFile", file);

  const res = await fetch(`${API_BASE}/upload/issuer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 include JWT
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Issuer file upload failed");
  }
  return res.json();
}

// Upload Acquirer file
export async function uploadAcquirerFile(file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("acquirerFile", file);

  const res = await fetch(`${API_BASE}/upload/acquirer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 include JWT
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Acquirer file upload failed");
  }
  return res.json();
}
