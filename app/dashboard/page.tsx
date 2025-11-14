'use client'

import { useState, DragEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, FileCheck, Eye } from 'lucide-react'
import { getLoggedInUser } from '../services/logedUserHelper'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import {
  uploadSAQ,
  ReconcileResponse,
  viewReconciled,
  ViewReconciledResponse,
  FETransaction,
  ReconcileAndSaveReport,
} from '../services/api'

interface FormErrors {
  accountNumber?: string
  accountName?: string
  currency?: string
  reconDate?: string
}

interface ReconciliationSummary {
  totalIssuerTransactions: number;
  totalAcquirerTransactions: number;
  totalMatched: number;
  totalExceptions: number;
  totalOthersOnUs: number;
  totalAmount: number;
}

interface ReconciliationTransaction {
  terminalId: string;
  rrn: string;
  amount: number;
  postingDate: string;
  bin: string;
  mti: string;
  narration?: string;
}

interface ReconciliationResult {
  message: string;
  status: "success" | "error";
  sessionId?: string;
  timestamp?: string;
  summary?: ReconciliationSummary;
  data?: {
    issuerAfterCutoff: ReconciliationTransaction[];
    acquirerAfterCutoff: ReconciliationTransaction[];
    exceptions: ReconciliationTransaction[];
    othersOnUsFailed: ReconciliationTransaction[];
    matchedTotal: number;
    issuerAfterCutoffTotal: number;
    acquirerAfterCutoffTotal: number;
    exceptionsTotal: number;
    othersOnUsFailedTotal: number;
  };
}

const FormField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
  ...props
}: any) => {
  const [inputType, setInputType] = useState(type)

  const handleFocus = () => {
    if (type === 'date') {
      setInputType('date')
    }
  }

  const handleBlur = (e: any) => {
    if (type === 'date' && !e.target.value) {
      setInputType('text')
    }
  }

  const inputClass = `
    w-full p-3 border rounded-lg 
    focus:ring-2 transition duration-150 ease-in-out
    dark:bg-gray-700 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    text-black
    ${
      error
        ? 'border-red-500 focus:ring-red-500/50'
        : 'border-gray-300 focus:ring-blue-500/50 focus:border-blue-500 dark:border-gray-600'
    }
  `

  const finalInputType = type === 'date' && !value ? 'text' : inputType

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={finalInputType}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputClass}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  )
}

export default function ReconciliationPage() {
  const [issuerFile, setIssuerFile] = useState<File | null>(null)
  const [acquirerFile, setAcquirerFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ReconcileResponse | null>(null)
  const [reconciledData, setReconciledData] = useState<ViewReconciledResponse | null>(null)
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [viewType, setViewType] = useState<
    'matched' | 'exceptions' | 'issuerAfterCutoff' | 'acquirerAfterCutoff' | 'othersOnUsFailed'
  >('issuerAfterCutoff')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(50)
  const [user, setUser] = useState<any>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [currency, setCurrency] = useState('')
  const [reconDate, setReconDate] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null)
  const allUploaded = issuerFile && acquirerFile

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files?.length) setter(e.target.files[0])
  }

  const handleDrop = (
    e: DragEvent<HTMLLabelElement>,
    setter: (file: File | null) => void,
    type: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
      setter(e.dataTransfer.files[0])
  }

  async function handleUpload(issuer: File, acquirer: File) {
    setIsUploading(true)
    try {
      const uploadRes = await uploadSAQ(issuer, acquirer)
      return {
        message: 'Files uploaded successfully',
        status: 'success',
        data: uploadRes
      }
    } catch (err: any) {
      return {
        message: err.message || 'Error uploading files',
        status: 'error',
      }
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error('Failed to fetch user:', err))
  }, [])

  useEffect(() => {
    if (!user) return
    console.log('this is our user', user)
  }, [user])

  async function submitFiles() {
    if (!issuerFile || !acquirerFile) {
      alert('Please select both issuer and acquirer files before uploading')
      return
    }

    if (!validate()) {
      console.error('Account details validation failed.')
      return
    }

    setIsLoading(true);
    setReconciliationResult(null);

    try {
      const uploadResult = await handleUpload(issuerFile, acquirerFile)

      if (uploadResult.status === 'success') {
        console.log('Files uploaded successfully! Starting reconciliation...')
        
        const reconcileResult = await ReconcileAndSaveReport(
          user.id,
          accountNumber,
          accountName,
          reconDate,
          currency,
        )

        console.log('Reconciliation result:', reconcileResult);
        
        if (reconcileResult.status === 'success') {
          setReconciliationResult(reconcileResult);
          
          // Access the parsed data
          if (reconcileResult.data) {
            console.log('Issuer after cutoff:', reconcileResult.data.issuerAfterCutoff);
            console.log('Acquirer after cutoff:', reconcileResult.data.acquirerAfterCutoff);
            console.log('Exceptions:', reconcileResult.data.exceptions);
            console.log('Others on us failed:', reconcileResult.data.othersOnUsFailed);
          }
        } else {
          setReconciliationResult({
            status: "error",
            message: reconcileResult.message
          });
          alert(`Reconciliation failed: ${reconcileResult.message}`);
        }
      } else {
        setReconciliationResult({
          status: "error",
          message: uploadResult.message
        });
        alert(`Upload failed: ${uploadResult.message}`);
      }
    } catch (error: any) {
      console.error('Error during reconciliation process:', error);
      setReconciliationResult({
        status: "error",
        message: 'An unexpected error occurred during reconciliation'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getDataForView = (): ReconciliationTransaction[] => {
    if (!reconciliationResult?.data) return [];
    
    switch (viewType) {
      case 'matched':
        return []; // You don't have matched data in your current response
      case 'exceptions':
        return reconciliationResult.data.exceptions || [];
      case 'issuerAfterCutoff':
        return reconciliationResult.data.issuerAfterCutoff || [];
      case 'acquirerAfterCutoff':
        return reconciliationResult.data.acquirerAfterCutoff || [];
      case 'othersOnUsFailed':
        return reconciliationResult.data.othersOnUsFailed || [];
      default:
        return [];
    }
  }

  const getTotalForView = (): number => {
    if (!reconciliationResult?.data) return 0;
    
    switch (viewType) {
      case 'matched':
        return reconciliationResult.data.matchedTotal || 0;
      case 'exceptions':
        return reconciliationResult.data.exceptionsTotal || 0;
      case 'issuerAfterCutoff':
        return reconciliationResult.data.issuerAfterCutoffTotal || 0;
      case 'acquirerAfterCutoff':
        return reconciliationResult.data.acquirerAfterCutoffTotal || 0;
      case 'othersOnUsFailed':
        return reconciliationResult.data.othersOnUsFailedTotal || 0;
      default:
        return 0;
    }
  }

  const columnsToDisplay: (keyof ReconciliationTransaction)[] = [
    'terminalId',
    'rrn',
    'amount',
    'postingDate',
    'bin',
    'mti'
  ]

  const validate = (): boolean => {
    let newErrors: FormErrors = {}

    if (!accountNumber) {
      newErrors.accountNumber = 'Account number is required.'
    } else if (!/^\d+$/.test(accountNumber)) {
      newErrors.accountNumber = 'Account number must only contain digits.'
    }

    if (!accountName) {
      newErrors.accountName = 'Account name is required.'
    }

    if (!currency) {
      newErrors.currency = 'Currency is required.'
    }

    if (!reconDate) {
      newErrors.reconDate = 'Reconciliation date is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const displayedData = getDataForView()
  const currentPageData = displayedData.slice(page * size, (page + 1) * size)
  const totalItems = getTotalForView()
  const totalPages = Math.ceil(totalItems / size)

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1)
  }

  return (
    <div className="h-full min-w-full max-w-7xl mx-auto w-full justify-center p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reconcile Reports
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload the required files and reconcile or view reconciled transactions.
        </p>
      </div>

      {/* Report headers section */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-12 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Account Reconciliation Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Account Number"
            value={accountNumber}
            onChange={(e: any) => setAccountNumber(e.target.value)}
            placeholder="e.g. 320200409000924"
            required
            error={errors.accountNumber}
          />

          <FormField
            label="Account Name"
            value={accountName}
            onChange={(e: any) => setAccountName(e.target.value)}
            placeholder="e.g. ZIMSWITCHSUSPENSE"
            required
            error={errors.accountName}
          />

          <FormField
            label="Currency"
            value={currency}
            onChange={(e: any) => setCurrency(e.target.value)}
            placeholder="e.g. ZWG or USD"
            required
            error={errors.currency}
          />

          <FormField
            label="Reconciliation Date"
            type="date"
            value={reconDate}
            onChange={(e: any) => setReconDate(e.target.value)}
            placeholder="e.g. YYYY-MM-DD"
            required
            error={errors.reconDate}
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <UploadCard
          file={issuerFile}
          setFile={setIssuerFile}
          dragActive={dragActive}
          setDragActive={setDragActive}
          allUploaded={allUploaded}
          type="issuer"
          label="Issuer SAQ Report"
        />
        <UploadCard
          file={acquirerFile}
          setFile={setAcquirerFile}
          dragActive={dragActive}
          setDragActive={setDragActive}
          allUploaded={allUploaded}
          type="acquirer"
          label="Acquirer SAQ Report"
        />
      </div>


      {/* Action Buttons */}
      <div className="mt-12 flex flex-wrap gap-4">
        <Button
          onClick={submitFiles}
          size="lg"
          disabled={!allUploaded || isUploading || isLoading}
          aria-busy={isUploading || isLoading}
          className="px-10 py-6 text-lg bg-green-700 hover:bg-green-800 disabled:opacity-70"
        >
          {(isUploading || isLoading) ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
          )}
          {(isUploading || isLoading) ? 'Uploading and Reconciling...' : 'Upload & Reconcile'}
        </Button>
      </div>

      {/* Transaction Table Section */}
      {reconciliationResult?.status === 'success' && reconciliationResult.data && (
        <div className="mt-8 p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Transaction Details
          </h2>
          
          {/* View Type Selector */}
          <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
            {(
              [
                'issuerAfterCutoff',
                'acquirerAfterCutoff',
                'exceptions',
                'othersOnUsFailed',
              ] as const
            ).map((type) => (
              <Button
                key={type}
                variant={viewType === type ? 'default' : 'outline'}
                onClick={() => {
                  setViewType(type);
                  setPage(0); // Reset to first page when changing view type
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 ${
                  viewType === type
                    ? type === 'exceptions'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : type === 'othersOnUsFailed'
                        ? 'bg-yellow-400 text-black hover:bg-yellow-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'exceptions' && <AlertCircle className="w-4 h-4" />}
                {type === 'othersOnUsFailed' && <Clock className="w-4 h-4" />}
                {(type === 'issuerAfterCutoff' || type === 'acquirerAfterCutoff') && (
                  <Eye className="w-4 h-4" />
                )}

                {type === 'issuerAfterCutoff'
                  ? `Issuer After Cut-Off (${reconciliationResult.data?.issuerAfterCutoffTotal || 0})`
                  : type === 'acquirerAfterCutoff'
                    ? `Acquirer After Cut-Off (${reconciliationResult.data?.acquirerAfterCutoffTotal || 0})`
                    : type === 'exceptions'
                      ? `Exceptions (${reconciliationResult.data?.exceptionsTotal || 0})`
                      : `Others On Us Failed (${reconciliationResult.data?.othersOnUsFailedTotal || 0})`}
              </Button>
            ))}
          </div>

          {/* Transaction Table */}
          {currentPageData.length > 0 ? (
            <div className="border rounded-lg overflow-auto max-h-[600px]">
              <table className="min-w-full border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b">
                      No
                    </th>
                    {columnsToDisplay.map((key) => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 border-b"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPageData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b">
                        {page * size + idx + 1}
                      </td>
                      {columnsToDisplay.map((key) => (
                        <td
                          key={key}
                          className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b"
                        >
                          {key === 'amount' 
                            ? (row[key]?.toFixed(2) || '0.00')
                            : (row[key]?.toString() || '-')
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 p-4 bg-gray-100 dark:bg-gray-700 border-t">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={page === 0}
                    variant="outline"
                    className="bg-white dark:bg-gray-600"
                  >
                    Previous
                  </Button>

                  <span className="text-gray-700 dark:text-gray-300">
                    Page {page + 1} of {totalPages} 
                    {` (Showing ${currentPageData.length} of ${totalItems} transactions)`}
                  </span>

                  <Button
                    onClick={handleNextPage}
                    disabled={page >= totalPages - 1}
                    variant="outline"
                    className="bg-white dark:bg-gray-600"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {viewType} transactions to display.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface UploadCardProps {
  file: File | null
  setFile: (file: File | null) => void
  dragActive: string | null
  setDragActive: (type: string | null) => void
  allUploaded: boolean
  type: string
  label: string
}

function UploadCard({
  file,
  setFile,
  dragActive,
  setDragActive,
  allUploaded,
  type,
  label,
}: UploadCardProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(type)
        }}
        onDragLeave={() => setDragActive(null)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(null)
          if (e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0])
        }}
        className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${dragActive === type ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-600 hover:bg-green-50'}`}
      >
        {allUploaded ? (
          <FileCheck className="h-10 w-10 text-green-600 mb-3" />
        ) : (
          <Upload className="h-10 w-10 text-gray-700 mb-3" />
        )}
        <p
          className={`text-base ${allUploaded ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}
        >
          <span className="font-semibold">
            {allUploaded ? 'File uploaded successfully' : 'Click to upload'}
          </span>{' '}
          {!allUploaded && 'or drag & drop'}
        </p>
        <p
          className={`text-xs ${allUploaded ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          CSV (MAX. 5MB)
        </p>
        <input
          disabled={allUploaded}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) setFile(e.target.files[0])
          }}
        />
      </label>
      {file && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
          {file.name}
        </p>
      )}
    </div>
  )
}