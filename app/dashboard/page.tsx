// app/reconciliations/page.tsx
"use client";

import { useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, FileCheck, Eye } from "lucide-react";
import {
  uploadAcquirerFile,
  uploadHostFile,
  uploadIssuerFile,
  reconcile,
  ReconcileResponse,
  downloadCSV,
  viewReconciled,
  ViewReconciledResponse,
  FETransaction,
} from "../services/api";

export default function ReconciliationPage() {
  const [hostFile, setHostFile] = useState<File | null>(null);
  const [issuerFile, setIssuerFile] = useState<File | null>(null);
  const [acquirerFile, setAcquirerFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ReconcileResponse | null>(null);
  const [reconciledData, setReconciledData] = useState<ViewReconciledResponse | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"matched" | "unmatched" | "autoReversals">("matched");

  const allUploaded = hostFile && issuerFile && acquirerFile;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files?.length) setter(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>, setter: (file: File | null) => void, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setter(e.dataTransfer.files[0]);
  };

  const handleUpload = async (host: File, issuer: File, acquirer: File) => {
    setIsUploading(true);
    try {
      const [hostRes, issuerRes, acquirerRes] = await Promise.all([
        uploadHostFile(host),
        uploadIssuerFile(issuer),
        uploadAcquirerFile(acquirer),
      ]);

      return { host: hostRes, issuer: issuerRes, acquirer: acquirerRes, message: "All files uploaded successfully", status: "success" };
    } catch (err: any) {
      return { message: err.message || "Error uploading one or more files", status: "error" };
    } finally {
      setIsUploading(false);
    }
  };

  async function submitFiles() {
    if (!hostFile || !issuerFile || !acquirerFile) {
      alert("Please select all files before uploading");
      return;
    }

    const result = await handleUpload(hostFile, issuerFile, acquirerFile);

    if (result.status === "success") {
      alert("All files uploaded!");
    } else {
      alert(result.message);
    }
  }

  const handleReconcile = async () => {
    setIsLoading(true);
    const response = await reconcile();
    setResult(response);
    setIsLoading(false);
  };

  const handleViewData = async () => {
    setIsLoading(true);
    const data = await viewReconciled();
    setReconciledData(data);
    setIsLoading(false);
  };

  const getDataForView = (): FETransaction[] => {
    if (!reconciledData) return [];
    switch (viewType) {
      case "matched":
        return reconciledData.matched || [];
      case "unmatched":
        return reconciledData.unmatched || [];
      case "autoReversals":
        return reconciledData.autoReversals || [];
      default:
        return [];
    }
  };

  // Define the columns you want to display
const columnsToDisplay: (keyof FETransaction)[] = ["terminalId", "rrn", "amount", "postingDate", ];


  const displayedData = getDataForView();

  return (
    <div className="h-full min-w-full max-w-7xl mx-auto w-full justify-center p-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reconcile Reports</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload the required files and reconcile or view reconciled transactions.
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <UploadCard file={hostFile} setFile={setHostFile} dragActive={dragActive} setDragActive={setDragActive} allUploaded={allUploaded} type="host" label="Host File" />
        <UploadCard file={acquirerFile} setFile={setAcquirerFile} dragActive={dragActive} setDragActive={setDragActive} allUploaded={allUploaded} type="acquirer" label="Acquirer SAQ Report" />
        <UploadCard file={issuerFile} setFile={setIssuerFile} dragActive={dragActive} setDragActive={setDragActive} allUploaded={allUploaded} type="issuer" label="Issuer SAQ Report" />
      </div>

      {/* Action Buttons */}
      <div className="mt-12 flex flex-wrap gap-4">
        <Button onClick={submitFiles} size="lg" disabled={!allUploaded || isUploading} className="px-10 py-6 text-lg bg-green-700 hover:bg-accent">
          <Upload className="mr-2 h-5 w-5" /> {isUploading ? "reconciling please wait..." : "reconcile"}
        </Button>
    
        <Button onClick={handleViewData} size="lg" disabled={isLoading} className="px-10 py-6 text-lg bg-blue-700 hover:bg-blue-800">
          <Eye className="mr-2 h-5 w-5" /> {isLoading ? "Loading..." : "View Data"}
        </Button>
      </div>

      {/* Table Section */}
      {reconciledData && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="mt-4 flex space-x-3">
            <Button variant={viewType === "matched" ? "default" : "outline"} onClick={() => setViewType("matched")}>Matched</Button>
            <Button variant={viewType === "unmatched" ? "default" : "outline"} onClick={() => setViewType("unmatched")}>Unmatched</Button>
            <Button variant={viewType === "autoReversals" ? "default" : "outline"} onClick={() => setViewType("autoReversals")}>Auto Reversals</Button>
          </div>

                            {displayedData.length > 0 ? (
  <div className="mt-4 overflow-x-auto">
    <table className="min-w-full border border-gray-300 dark:border-gray-700">
      <thead className="bg-gray-100 dark:bg-gray-700">
        <tr>
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
            className={idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
          >
          {columnsToDisplay.map((key) => (
  <td key={key} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
    {row[key]?.toString() || ""}
  </td>
))}

          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="mt-4 text-gray-500 dark:text-gray-400">No {viewType} transactions to display.</p>
)}

        </div>
      )}
    </div>
  );
}

// Reusable Upload Card Component
interface UploadCardProps {
  file: File | null;
  setFile: (file: File | null) => void;
  dragActive: string | null;
  setDragActive: (type: string | null) => void;
  allUploaded: boolean;
  type: string;
  label: string;
}

function UploadCard({ file, setFile, dragActive, setDragActive, allUploaded, type, label }: UploadCardProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragActive(type); }}
        onDragLeave={() => setDragActive(null)}
        onDrop={(e) => { e.preventDefault(); setDragActive(null); if (e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0]); }}
        className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${dragActive === type ? "border-green-600 bg-green-50" : "border-gray-300 hover:border-green-600 hover:bg-green-50"}`}
      >
        {allUploaded ? <FileCheck className="h-10 w-10 text-green-600 mb-3" /> : <Upload className="h-10 w-10 text-gray-700 mb-3" />}
        <p className={`text-base ${allUploaded ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>
          <span className="font-semibold">{allUploaded ? "File uploaded successfully" : "Click to upload"}</span> {!allUploaded && "or drag & drop"}
        </p>
        <p className={`text-xs ${allUploaded ? "text-green-500 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>CSV (MAX. 5MB)</p>
        <input disabled={allUploaded} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={(e) => { if (e.target.files?.length) setFile(e.target.files[0]); }} />
      </label>
      {file && <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">{file.name}</p>}
    </div>
  );
}
