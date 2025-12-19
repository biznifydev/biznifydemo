"use client"

import { useState } from "react"
import { X, CheckCircle, XCircle, Calendar, User, FileText } from "lucide-react"

interface ApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  onApprove: (requestId: string, notes: string) => void
  onReject: (requestId: string, notes: string) => void
}

export function ApprovalModal({ isOpen, onClose, request, onApprove, onReject }: ApprovalModalProps) {
  const [notes, setNotes] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const handleSubmit = () => {
    if (action === "approve") {
      onApprove(request.id, notes)
    } else if (action === "reject") {
      onReject(request.id, notes)
    }
    onClose()
    setNotes("")
    setAction(null)
  }

  if (!isOpen || !request) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Review Leave Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Request Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{request.employee}</h3>
                <p className="text-sm text-gray-500">Request ID: {request.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Leave Type:</span>
                <p className="font-medium text-gray-900">{request.type}</p>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <p className="font-medium text-gray-900">{request.days} days</p>
              </div>
              <div>
                <span className="text-gray-500">Start Date:</span>
                <p className="font-medium text-gray-900">{request.startDate}</p>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <p className="font-medium text-gray-900">{request.endDate}</p>
              </div>
            </div>

            <div className="mt-3">
              <span className="text-gray-500 text-sm">Reason:</span>
              <p className="text-sm text-gray-900 mt-1">{request.reason}</p>
            </div>

            <div className="mt-3">
              <span className="text-gray-500 text-sm">Submitted:</span>
              <p className="text-sm text-gray-900 mt-1">{request.submittedDate}</p>
            </div>
          </div>

          {/* Approval Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Add any notes or comments for the employee..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setAction("reject")}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
            >
              <XCircle className="h-4 w-4 inline mr-1" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => setAction("approve")}
              className="flex-1 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200"
            >
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Approve
            </button>
          </div>

          {/* Confirmation */}
          {action && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {action === "approve" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {action === "approve" ? "Approve" : "Reject"} this request?
                  </p>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-3">
                <button
                  onClick={() => setAction(null)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${
                    action === "approve" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm {action === "approve" ? "Approval" : "Rejection"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 