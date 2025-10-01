import Cookies from 'js-cookie'

const API_BASE = 'http://localhost:1977/api/transactions'

export async function login(username: string, password: string) {
  const res = await fetch('http://localhost:1977/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Login failed')
  }
  return res.json() // { token, message }
}

function getToken() {
  return Cookies.get('auth_token') || ''
}

// Upload FE (Host) file
export async function uploadHostFile(file: File) {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // 🔑 include JWT
      },
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Host file upload failed')
    }
    return res.json()
  } catch (err) {
    console.log(err)
    throw new Error(`Host file upload failed: ${err.message}`)
  }
}

// Upload Issuer file
export async function uploadIssuerFile(file: File) {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append('issuerFile', file)

    const res = await fetch(`${API_BASE}/upload/issuer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, // 🔑 include JWT
      },
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Issuer file upload failed')
    }
    return res.json()
  } catch (err) {
    console.log(err)
    throw new Error(`Issuer file upload failed: ${err.message}`)
  }
}

// Upload Acquirer file
export async function uploadAcquirerFile(file: File) {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append('acquirerFile', file)

    const res = await fetch(`${API_BASE}/upload/acquirer`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`, //  include JWT
      },
      credentials: 'include',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Acquirer file upload failed')
    }
    return res.json()
  } catch (err) {
    console.log(err)
    throw new Error(`Acquirer file upload failed: ${err.message}`)
  }
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

export async function reconcile(): Promise<ReconcileResponse> {
  try {
    const token = getToken()
    const res = await fetch(`${API_BASE}/reconcile`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // 🔑 include JWT
      },
      credentials: 'include',
    })

    const data: ReconcileResponse = await res.json()

    console.log('Reconcile response data:', data)

    if (!res.ok) {
      // Handle server-side error
      throw new Error(data.message || 'Failed to reconcile transactions')
    }

    return data
  } catch (error: any) {
    // Handle network or other errors
    return {
      message: error.message || 'Unknown error',
      status: 'error',
    }
  }
}

// Download reconciled transactions CSV
export async function downloadCSV() {
  try {
    const token = getToken()
    const res = await fetch(`${API_BASE}/download`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })

    if (!res.ok) {
      // Try to read JSON error message
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
  } catch (error: any) {
    console.error('CSV download error:', error)
    throw new Error(error.message || 'Unknown error during CSV download')
  }
}

// Add this to api.ts

export interface FETransaction {
  terminalId: string
  rrn: string
  amount: number
  financialRequestReceived: boolean
  authorisedOnZS: boolean
  reversalProcessed: boolean
  postingDate: string // ISO date string
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

export async function viewReconciled(
  page: number = 0,
  size: number = 50
): Promise<ViewReconciledResponse> {
  try {
    const token = getToken()
    const res = await fetch(`${API_BASE}/view?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })

    const data: ViewReconciledResponse = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch reconciled transactions')
    }

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

export interface user {
  username: string
  email: string
  roleName: string
  password: string
}

export async function CreateUser(user: user) {
  try {
    const token = getToken()
    console.log('🔐 Token:', token) // Check if token exists

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include' as RequestCredentials,
      body: JSON.stringify(user),
    }

    console.log('📤 Full request:', {
      url: 'http://localhost:1977/api/auth/signup',
      method: 'POST',
      headers: requestOptions.headers,
      body: user,
    })

    const res = await fetch(
      `http://localhost:1977/api/auth/signup`,
      requestOptions
    )

    console.log('📥 Response status:', res.status)
    console.log(
      '📥 Response headers:',
      Object.fromEntries(res.headers.entries())
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error('❌ Backend error response:', errorText)
      throw new Error(
        `HTTP ${res.status}: ${errorText || 'Create user failed'}`
      )
    }

    const data = await res.json()
    console.log('✅ Success! Response data:', data)
    return data
  } catch (error: any) {
    console.error('💥 Fetch error:', error)
    throw new Error(error.message || 'Unknown error creating user')
  }
}

export async function fetchUsers() {
  try {
    const token = getToken()
    console.log('🔐 Token:', token) // Check if token exists

    const res = await fetch(`http://localhost:1977/api/users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    })
    console.log('📥 Response status:', res.status)
    if (!res.ok) {
      const errorText = await res.text()

      console.log('❌ Backend error response:', errorText)

      throw new Error(
        `HTTP ${res.status}: ${errorText || 'Fetch users failed'}`
      )
    }

    const data = await res.json()
    console.log('✅ Success! Fetched users:', data)
    return data
  } catch (error: any) {
    console.log('💥 Fetch error:', error)
    
  }
}
