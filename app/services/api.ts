import Cookies from "js-cookie";

const API_BASE = "http://localhost:1977/api/transactions"; 

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
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json(); // { token, message }
}

function getToken() {
  return  Cookies.get("auth_token") || "";
}

// Upload FE (Host) file
export async function uploadHostFile(file: File) {
  try{
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 include JWT
    },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Host file upload failed");
  }
  return res.json();
}  catch (err){
    console.log(err);
      throw new Error(`Host file upload failed: ${err.message}`);
  }
}

// Upload Issuer file
export async function uploadIssuerFile(file: File) {
  try{
     const token = getToken();
  const formData = new FormData();
  formData.append("issuerFile", file);

  const res = await fetch(`${API_BASE}/upload/issuer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, // 🔑 include JWT
    },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Issuer file upload failed");
  }
  return res.json();

  }catch (err){
    console.log(err);
      throw new Error(`Issuer file upload failed: ${err.message}`);
  }
 
}

// Upload Acquirer file
export async function uploadAcquirerFile(file: File) {
  try{
    const token = getToken();
  const formData = new FormData();
  formData.append("acquirerFile", file);

  const res = await fetch(`${API_BASE}/upload/acquirer`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`, //  include JWT
    },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Acquirer file upload failed");
  }
  return res.json();
  }catch(err){
    console.log(err);
    throw new Error(`Acquirer file upload failed: ${err.message}`);
  }
}

export interface ReconSummary {
  totalTransactions: number;
  matched: number;
  unmatched: number;

}


export interface ReconcileResponse {
  message: string;
  status: "success" | "error";
  summary?: ReconSummary;
}

export async function reconcile() : Promise<ReconcileResponse> {
 try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/reconcile`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // 🔑 include JWT
      },
      credentials: "include",
    });

    const data: ReconcileResponse = await res.json();

    console.log("Reconcile response data:", data);

    if (!res.ok) {
      // Handle server-side error
      throw new Error(data.message || "Failed to reconcile transactions");
    }

    return data;
  } catch (error: any) {
    // Handle network or other errors
    return {
      message: error.message || "Unknown error",
      status: "error",
    };
  }
}

// Download reconciled transactions CSV
export async function downloadCSV() {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/download`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      // Try to read JSON error message
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Failed to download CSV");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transaction-reconciliation.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("CSV download error:", error);
    throw new Error(error.message || "Unknown error during CSV download");
  }
}

// Add this to api.ts

export interface FETransaction {
  terminalId: string;
  rrn: string;
  amount: number;
  financialRequestReceived: boolean;
  authorisedOnZS: boolean;
  reversalProcessed: boolean;
  postingDate: string; // ISO date string

}

export interface ViewReconciledResponse {
  status: "success" | "error";
  matched?: FETransaction[];
  unmatched?: FETransaction[];
  autoReversals?: FETransaction[];
  message?: string;
}

export async function viewReconciled(): Promise<ViewReconciledResponse> {
  try {
    const token = getToken();
    const res = await fetch(`${API_BASE}/view`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      credentials: "include",
    });

    // 💡 Always parse the JSON data, regardless of the status code.
    const data: ViewReconciledResponse = await res.json(); 
    console.log(`here is the data from view reconciled:`, data);
  

    // ✅ Now, check for the 'ok' status to handle success or error.
    if (!res.ok) {
      // If the response is not OK (e.g., 400 Bad Request),
      // the 'data' variable will contain the error message from the backend.
      throw new Error(data.message || "Failed to fetch reconciled transactions");
    }

    // ✅ If the response is OK, return the parsed data.
    return {
      ...data,
      matched: data.matched ?? [],
      unmatched: data.unmatched ?? [],
      autoReversals: data.autoReversals ?? [],
    };
  } catch (error: any) {
    return {
      status: "error",
      message: error.message || "Unknown error fetching reconciled transactions",
      matched: [],
      unmatched: [],
      autoReversals: [],
    };
  }
}

