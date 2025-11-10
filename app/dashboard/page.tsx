'use client'

import { useState, DragEvent, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, FileCheck, Eye } from 'lucide-react'
import { getLoggedInUser } from '../services/logedUserHelper'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import {
  uploadAcquirerFile,
  uploadHostFiles,
  uploadIssuerFile,
  ReconcileResponse,
  viewReconciled,
  ViewReconciledResponse,
  FETransaction,
  ReconcileAndSaveReport,
  uploadIHS,
} from '../services/api'
interface FormErrors {
  accountNumber?: string
  accountName?: string
  currency?: string
  reconDate?: string
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
}) => {
  const [inputType, setInputType] = useState(type)

  const handleFocus = () => {
    if (type === 'date') {
      setInputType('date')
    }
  }

  const handleBlur = (e) => {
    if (type === 'date' && !e.target.value) {
      setInputType('text')
    }
  }

  // Determine styles (same as before)
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
        // Use the dynamically determined type
        type={finalInputType}
        value={value}
        onChange={onChange}
        // Attach the new handlers
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
  const [hostFile, setHostFile] = useState<File | null>(null)
  const [IHSFile, setIHSFile]= useState<File | null>(null)
  const [issuerFile, setIssuerFile] = useState<File | null>(null)
  const [acquirerFile, setAcquirerFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ReconcileResponse | null>(null)
  const [reconciledData, setReconciledData] =
    useState<ViewReconciledResponse | null>(null)
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [viewType, setViewType] = useState<
    'matched' | 'exceptions' | 'usOnOthersAfterCutOff' | 'othersOnUsAfterCutOff'
  >('matched')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(50)
  const [user, setUser] = useState(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [currency, setCurrency] = useState('')
  const [reconDate, setReconDate] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const allUploaded = hostFile && issuerFile && acquirerFile && IHSFile

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

  async function handleUpload(host: File, issuer: File, acquirer: File, IHS: File, reconDate: string) {
    setIsUploading(true)
    try {
      const hostRes = await uploadHostFiles(host, reconDate)
      const IHSRes =  await uploadIHS(IHS, reconDate)
      const issuerRes = await uploadIssuerFile(issuer, reconDate)
      const acquirerRes = await uploadAcquirerFile(acquirer, reconDate)

      return {
        host: hostRes,
        issuer: issuerRes,
        acquirer: acquirerRes,
        IHS:IHSRes,
        message: 'All files uploaded successfully',
        status: 'success',
      }
    } catch (err: any) {
      return {
        message: err.message || 'Error uploading one or more files',
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
    console.log('this is out user', user)
  }, [user])

  async function submitFiles() {
    if (!hostFile || !issuerFile || !acquirerFile || !IHSFile) {
      alert('Please select all files before uploading')
      return
    }

    const timestamp = new Date().toISOString()

    const result = await handleUpload(hostFile, issuerFile, acquirerFile,IHSFile, timestamp)

    if (!validate()) {
      console.error('Account details validation failed.')
      return
    }

    if (result.status === 'success') {
      alert('All files uploaded!')

      //put the values
      const response = await ReconcileAndSaveReport(
        user.id,
        accountNumber,
        accountName,
        reconDate,
        currency,
        timestamp

      )
      if (response.status === 'success') {
        await handleViewData(0, timestamp)
      }
    } else {
      alert(result.message)
    }
  }

  const handleViewData = async (newPage: number = page, dateRecon: string) => {
    if (!user) return
    setIsLoading(true)
    const data = await viewReconciled(newPage, size, dateRecon )
    console.log(data)
    setReconciledData(data)
    setPage(newPage)
    setIsLoading(false)
  }

  const getDataForView = (): FETransaction[] => {
    if (!reconciledData) return []
    switch (viewType) {
      case 'matched':
        return reconciledData.matched || []
      case 'exceptions':
        return reconciledData.exceptions || []
      case 'usOnOthersAfterCutOff':
        return reconciledData.usOnOthersAfterCutOff || []
      case 'othersOnUsAfterCutOff':
        return reconciledData.othersOnUsAfterCutOff || []
      default:
        return []
    }
  }

  const columnsToDisplay: (keyof FETransaction)[] = [
    'terminalId',
    'rrn',
    'amount',
    'postingDate',
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

  return (
    <div className="h-full min-w-full max-w-7xl mx-auto w-full justify-center p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reconcile Reports
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload the required files and reconcile or view reconciled
          transactions.
        </p>
      </div>

      {/*report headers section */}

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-12 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Account Reconciliation Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="e.g. 320200409000924"
            required
          />

          <FormField
            label="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="e.g. ZIMSWITCHSUSPENSE"
            required
          />

          <FormField
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="e.g. ZWG or USD"
            required
          />

          <FormField
            label="Reconciliation Date"
            type="date"
            value={reconDate}
            onChange={(e) => setReconDate(e.target.value)}
            placeholder="e.g. YYYY-MM-DD" // <-- Now this will show until clicked!
            required
          />
        </div>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <UploadCard
          file={hostFile}
          setFile={setHostFile}
          dragActive={dragActive}
          setDragActive={setDragActive}
          allUploaded={allUploaded}
          type="host"
          label="Essence File"
        />
        <UploadCard
          file={IHSFile}
          setFile={setIHSFile}
          dragActive={dragActive}
          setDragActive={setDragActive}
          allUploaded={allUploaded}
          type="IHS"
          label="IHS File"
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
        <UploadCard
          file={issuerFile}
          setFile={setIssuerFile}
          dragActive={dragActive}
          setDragActive={setDragActive}
          allUploaded={allUploaded}
          type="issuer"
          label="Issuer SAQ Report"
        />
      </div>

      {/* Action Buttons */}

      <div className="mt-12 flex flex-wrap gap-4">
        {/* Reconcile Button */}
        <Button
          onClick={submitFiles}
          size="lg"
          disabled={!allUploaded || isUploading}
          aria-busy={isUploading}
          className="px-10 py-6 text-lg bg-green-700 hover:bg-green-800 disabled:opacity-70"
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
          )}
          {isUploading ? 'Reconciling, please wait...' : 'Reconcile'}
        </Button>
      </div>

      {/* Table Section */}
      {reconciledData && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="mt-4 flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            {(
              [
                'matched',

                'exceptions',
                'usOnOthersAfterCutOff',
                'othersOnUsAfterCutOff',
              ] as const
            ).map((type) => (
              <Button
                key={type}
                variant={viewType === type ? 'default' : 'outline'}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 text-sm font-medium rounded-full flex items-center gap-2 ${
                  viewType === type
                    ? type === 'exceptions'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : type === 'usOnOthersAfterCutOff' ||
                          type === 'othersOnUsAfterCutOff'
                        ? 'bg-yellow-400 text-black hover:bg-yellow-600'
                        : 'bg-green-600 text-white hover:bg-accent'
                    : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'matched' && <CheckCircle className="w-4 h-4" />}
                {type === 'exceptions' && <AlertCircle className="w-4 h-4" />}
                {(type === 'usOnOthersAfterCutOff' ||
                  type === 'othersOnUsAfterCutOff') && (
                  <Clock className="w-4 h-4" />
                )}

                {type === 'matched'
                  ? `Matched (${reconciledData.matchedTotal ?? 0})`
                  : type === 'exceptions'
                    ? `Exceptions (${reconciledData.exceptionsTotal ?? 0})`
                    : type === 'usOnOthersAfterCutOff'
                      ? `Issuer After Cut-Off (${reconciledData.usOnOthersAfterCutOffTotal ?? 0})`
                      : `Acquirer After Cut-Off (${reconciledData.othersOnUsAfterCutOffTotal ?? 0})`}
              </Button>
            ))}
          </div>
          {displayedData.length > 0 ? (
            <div className="mt-4 border rounded-lg overflow-auto max-h-[500px]">
              <table className="min-w-full border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      No
                    </th>
                    {columnsToDisplay.map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? 'bg-white dark:bg-gray-800'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }
                    >
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {page * size + idx + 1}
                      </td>
                      {columnsToDisplay.map((key) => (
                        <td
                          key={key}
                          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
                        >
                          {row[key]?.toString() || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 p-2 bg-gray-100 dark:bg-gray-700 sticky bottom-0">
                <Button
                  onClick={() => handleViewData(page - 1)}
                  disabled={page === 0 || isLoading}
                  className="bg-gray-200 dark:bg-gray-600"
                >
                  Previous
                </Button>

                <span className="text-gray-700 dark:text-gray-300">
                  Page {page + 1}
                </span>

                <Button
                  onClick={() => handleViewData(page + 1)}
                  disabled={
                    isLoading ||
                    (viewType === 'matched' &&
                      (page + 1) * size >=
                        (reconciledData?.matchedTotal ?? 0)) ||
                    (viewType === 'exceptions' &&
                      (page + 1) * size >=
                        (reconciledData?.exceptionsTotal ?? 0)) ||
                    (viewType === 'usOnOthersAfterCutOff' &&
                      (page + 1) * size >=
                        (reconciledData?.usOnOthersAfterCutOffTotal ?? 0)) ||
                    (viewType === 'othersOnUsAfterCutOff' &&
                      (page + 1) * size >=
                        (reconciledData?.othersOnUsAfterCutOffTotal ?? 0))
                  }
                  className="bg-gray-200 dark:bg-gray-600"
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No {viewType} transactions to display.
            </p>
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
