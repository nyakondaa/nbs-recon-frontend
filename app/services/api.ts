import { tr } from 'date-fns/locale'
import Cookies from 'js-cookie'


const BASE_URL = 'http://localhost:1977'
const AUTH_API_BASE = `${BASE_URL}/api/auth`
const TRANSACTION_API_BASE = `${BASE_URL}/api/transactions`

let isRefreshing = false
let failedQueue: {
  resolve: (value: any) => void
  reject: (reason?: any) => void
}[] = []

const processQueue = (
  error: any | null = null,
  token: string | null = null
) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  failedQueue = []
}


const THREE_HOURS = 3 / 24
async function refreshToken(): Promise<string> {
  try {
    const res = await fetch(`${AUTH_API_BASE}/refresh`, {
      method: 'POST',
      credentials: 'include', 
    })

    if (!res.ok) {
      logout()
      throw new Error('Refresh failed. Must log in again.')
    }

    const data = await res.json()
    const newAccessToken = data.access_token
    Cookies.set('auth_token', newAccessToken, {
      expires: THREE_HOURS,
      secure: true,
      sameSite: 'Lax',
      path: '/',
    })
    return newAccessToken
  } catch (err) {
    logout()
    throw err
  }
}

async function getAuthToken(): Promise<string | null> {
  const token = Cookies.get('auth_token')
  if (token) return token
  return refreshToken()
}

export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  let token = await getAuthToken()
  let headers = { ...options.headers }

  if (token) headers.Authorization = `Bearer ${token}`

  let response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    console.warn('[apiClient] 401 Unauthorized, attempting token refresh...')

    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async (newToken) => {
            try {
              const retryRes = await fetch(url, {
                ...options,
                headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
              })
              if (!retryRes.ok) throw new Error(`Retry failed: ${retryRes.status}`)
              resolve(await retryRes.json())
            } catch (err) {
              reject(err)
            }
          },
          reject,
        })
      })
    }

    isRefreshing = true
    try {
      const newToken = await refreshToken()
      processQueue(null, newToken)

      // Retry the original request
      response = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
      })

      if (!response.ok) throw new Error(`Retry failed: ${response.status}`)
      return response.json()
    } catch (err) {
      processQueue(err)
      throw err
    } finally {
      isRefreshing = false
    }
  }

  if (!response.ok) {
  const text = await response.text()
  let msg = `API call failed with status ${response.status}`
  try {
    const json = JSON.parse(text)
    msg += `: ${json.error || json.message || 'Unknown error'}`
  } catch {
    msg += `: ${text || 'Unknown error'}`
  }
  throw new Error(msg)
}


const contentType = response.headers.get("content-type") || ""
if (response.status === 204 || !contentType.includes("application/json")) {
  return null as T
}


const text = await response.text()
if (!text) return null as T
return JSON.parse(text)

}

export async function login(
  username: string,
  password: string
): Promise<{ access_token: string; token_type: string; username: string }> {
  const res = await fetch(`${AUTH_API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || 'Login failed')
  }

  const data = await res.json()
  Cookies.set('auth_token', data.access_token, {
    expires: THREE_HOURS,
    secure: false,
    sameSite: 'Lax',
    path: '/',
  })

  return data
}

export async function logout() {
  try {
    await fetch(`${AUTH_API_BASE}/logout`, { method: 'POST', credentials: 'include' })
  } catch {}
  Cookies.remove('auth_token', { path: '/' })
}




// Upload FE (Host) file
export async function uploadHostFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

 
  const res = await apiClient(`${TRANSACTION_API_BASE}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
   
  })

  
  return res
}


export async function uploadIssuerFile(file: File) {
  const formData = new FormData()
  formData.append('issuerFile', file)

  const res = await apiClient(`${TRANSACTION_API_BASE}/upload/issuer`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return res
}

export async function uploadAcquirerFile(file: File) {
  const formData = new FormData()
  formData.append('acquirerFile', file)

  const res = await apiClient(`${TRANSACTION_API_BASE}/upload/acquirer`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return res
}

export interface ReconSummary {
  totalTransactions: number
  matched: number
  unmatched: number
}

export interface ReconcileResponse {
  message: string
  status: 'success' | 'error'
  summary?: ReconSummary
}

// Reconcile function
export async function reconcile(): Promise<ReconcileResponse> {
  // apiClient handles the token and refresh logic
  const data: ReconcileResponse = await apiClient(
    `${TRANSACTION_API_BASE}/reconcile`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Needs Content-Type as no body is sent
      credentials: 'include',
    }
  )

  return data
}

export async function downloadCSV() {
  const token = getToken()
  // Check if token is available
  if (!token) {
    console.error('Cannot download CSV: No access token found.')
    throw new Error('User not authenticated for download.')
  }

  const res = await fetch(`${TRANSACTION_API_BASE}/download`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })

  if (res.status === 401) {
    console.error(
      'Download failed: Access token expired. Attempting client-side logout.'
    )
    // Force client-side cleanup
    logout()
  
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    const error = await res.json().catch(() => null)
    throw new Error(error?.message || 'Failed to download CSV')
  }

  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'transaction-reconciliation.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export interface FETransaction {
  terminalId: string
  rrn: string
  amount: number
  financialRequestReceived: boolean
  authorisedOnZS: boolean
  reversalProcessed: boolean
  postingDate: string 
}

export interface ViewReconciledResponse {
  status: 'success' | 'error'
  matched?: FETransaction[]
  unmatched?: FETransaction[]
  autoReversals?: FETransaction[]
  matchedTotal?: number
  unmatchedTotal?: number
  autoReversalsTotal?: number
  message?: string
}

export async function ReconcileAndSaveReport(userId: number) {
  try {
    const response = await apiClient(
      `${TRANSACTION_API_BASE}/reconcile/${userId}`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    return response;

  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Unknown error during reconciliation',
    };
  }
}


export async function viewReconciled(
 
  page: number = 0,
  size: number = 50
  
  
): Promise<ViewReconciledResponse> {
  try {
   
    const data: ViewReconciledResponse = await apiClient(
      `${TRANSACTION_API_BASE}/view?page=${page}&size=${size}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    )
    
    return data
  } catch (error: any) {
    return {
      status: 'error',
      message:
      error.message || 'Unknown error fetching reconciled transactions',
      matched: [],
      unmatched: [],
      autoReversals: [],
      matchedTotal: 0,
      unmatchedTotal: 0,
      autoReversalsTotal: 0,
    }
  }
}


export async function getReports() {

  try{

    const data =  await apiClient(
    `${BASE_URL}/api/reports`,
    {
      method: 'GET',
      credentials: 'include'
    }
  )

  return data
  }catch(err: any){

    return{
      status: 'error',
      message:
        err.message || 'Unknown error fetching reconciled transactions'
    }
  }
  
}

export async function downloadReport(reportId: number, reportName: string) {
  try {
    const token = await getAuthToken(); // your bearer token
    const response = await fetch(`${BASE_URL}/api/reports/${reportId}/download`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download report: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportName || `report-${reportId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading report:", error);
    alert("Failed to download report.");
  }
}




export interface User {
  id: number
  username: string
  email: string
  roleName: string
  password?: string 
}

export async function CreateUser(user: User) {
 
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(user),
  }

  const data = await apiClient(`${AUTH_API_BASE}/signup`, requestOptions)
  console.log('✅ Success! Response data:', data)
  return data
}

export async function fetchUsers() {

  const data = await apiClient(`${BASE_URL}/api/users`, {
    method: 'GET',
    credentials: 'include',
  })
  console.log('✅ Success! Fetched users:', data)
  
  return data
}

export async function fetchReportsAndUsers() {

  const data = await apiClient(`${BASE_URL}/api/users/reports`, {
    method: 'GET',
    credentials: 'include',
  })
  console.log('✅ Success! Fetched users:', data)
  
  return data
}

export interface UserResponseDTO {
  id: number
  username: string
  email: string
  roleName: string
}

export async function fetchUserById(id: number): Promise<UserResponseDTO> {
  return apiClient(`${BASE_URL}/api/users/${id}`, {
    method: 'GET',
    credentials: 'include',
  })
}

export async function updateUser(
  id: number,
  user: User
): Promise<UserResponseDTO> {
  return apiClient(`${BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(user),
  })
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient(`${BASE_URL}/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return
}

export async function getRoles() {
  try {
    return await apiClient(`${BASE_URL}/api/roles`, {
      method: 'GET',
      credentials: 'include',
    })
  } catch (err) {
    console.log('Error fetching roles:', err)
    return [] // return empty array on error
  }
}


