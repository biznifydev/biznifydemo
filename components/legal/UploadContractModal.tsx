"use client"

import { useState } from "react"
import { X, Upload, FileText, FileUp } from "lucide-react"

interface UploadContractModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadContractModal({ isOpen, onClose }: UploadContractModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setIsUploading(true)
      
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false)
        // Here you would typically process the file and open the editor
        console.log('File uploaded:', file.name)
        onClose()
      }, 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="h-8 w-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Contract</h2>
          <p className="text-gray-600 mb-8">
            Upload an existing contract to edit and customize
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="contract-upload"
              disabled={isUploading}
            />
            <label htmlFor="contract-upload" className="cursor-pointer">
              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-600">Processing {uploadedFile?.name}...</p>
                </div>
              ) : (
                <>
                  <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to select or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports PDF, Word, and text files
                  </p>
                </>
              )}
            </label>
          </div>

          <div className="mt-8 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 