// app/reconciliations/page.tsx
"use client";

import { useState, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw } from "lucide-react";

export default function ReconciliationPage() {
  const [hostFile, setHostFile] = useState<File | null>(null);
  const [issuerFile, setIssuerFile] = useState<File | null>(null);
  const [acquirerFile, setAcquirerFile] = useState<File | null>(null);

  const [dragActive, setDragActive] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files?.length) {
      setter(e.target.files[0]);
    }
  };

  const handleDrop = (
    e: DragEvent<HTMLLabelElement>,
    setter: (file: File | null) => void,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setter(e.dataTransfer.files[0]);
    }
  };

  const allUploaded = hostFile && issuerFile && acquirerFile;

  return (
   
      <div className="h-full min-w-full max-w-7xl mx-auto  w-full  justify-center">
        {/* Header */}
        <div className="mb-10 ">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reconcile Reports
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please upload the required files to start the reconciliation process.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Host File */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Host File
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive("host");
              }}
              onDragLeave={() => setDragActive(null)}
              onDrop={(e) => handleDrop(e, setHostFile, "host")}
              className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                dragActive === "host"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-green-600 hover:bg-green-50"
              }`}
            >
              <Upload className="h-10 w-10 text-green-600 mb-3" />
              <p className="text-base text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV, XLS, XLSX (MAX. 5MB)
              </p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleFileChange(e, setHostFile)}
              />
            </label>
            {hostFile && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                {hostFile.name}
              </p>
            )}
          </div>

          {/* Acquirer File */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Acquirer SAQ Report
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive("acquirer");
              }}
              onDragLeave={() => setDragActive(null)}
              onDrop={(e) => handleDrop(e, setAcquirerFile, "acquirer")}
              className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                dragActive === "acquirer"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-green-600 hover:bg-green-50"
              }`}
            >
              <Upload className="h-10 w-10 text-green-600 mb-3" />
              <p className="text-base text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV, XLS, XLSX (MAX. 5MB)
              </p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleFileChange(e, setAcquirerFile)}
              />
            </label>
            {acquirerFile && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                {acquirerFile.name}
              </p>
            )}
          </div>

          {/* Issuer File */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Issuer SAQ Report
            </label>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive("issuer");
              }}
              onDragLeave={() => setDragActive(null)}
              onDrop={(e) => handleDrop(e, setIssuerFile, "issuer")}
              className={`flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
                dragActive === "issuer"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 hover:border-green-600 hover:bg-green-50"
              }`}
            >
              <Upload className="h-10 w-10 text-green-600 mb-3" />
              <p className="text-base text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag & drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                CSV, XLS, XLSX (MAX. 5MB)
              </p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleFileChange(e, setIssuerFile)}
              />
            </label>
            {issuerFile && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                {issuerFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Reconcile Action */}
        <div className="mt-12 flex justify-center">
          <Button
            size="lg"
            disabled={!allUploaded}
            className="px-10 py-6 text-lg bg-green-700 hover:bg-green-800"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Reconcile
          </Button>
        </div>
      </div>

  );
}
