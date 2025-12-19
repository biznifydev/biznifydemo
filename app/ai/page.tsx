"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function AIPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isChatMode, setIsChatMode] = useState(false)
  const [currentMessage, setCurrentMessage] = useState("")
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Business Strategy Discussion", date: "2024-01-15" },
    { id: 2, title: "Marketing Campaign Planning", date: "2024-01-14" },
    { id: 3, title: "Legal Document Review", date: "2024-01-13" },
  ])
  const [currentChat, setCurrentChat] = useState<{ id: number; messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }> } | null>(null)

  const headerButtons = (
    <>
      <button 
        onClick={() => {
          setIsChatMode(false)
          setCurrentChat(null)
        }}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>New Chat</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Chat History</span>
      </button>
    </>
  )

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return
    
    const newChatId = Date.now()
    const newChat = {
      id: newChatId,
      messages: [
        {
          role: 'user' as const,
          content: message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant' as const,
          content: `I understand you're asking about "${message}". Let me help you with that. This is a sample response - in a real implementation, this would be connected to an AI service.`,
          timestamp: new Date().toISOString()
        }
      ]
    }
    
    setCurrentChat(newChat)
    setIsChatMode(true)
    
    // Add to chat history
    const newHistoryItem = {
      id: newChatId,
      title: message.length > 30 ? message.substring(0, 30) + "..." : message,
      date: new Date().toLocaleDateString()
    }
    setChatHistory([newHistoryItem, ...chatHistory])
  }

  return (


    <ProtectedRoute>


      <PageWrapper 
      title="Ask Biznify AI" 
      headerButtons={headerButtons}
    >
      {!isChatMode ? (
        <div className="space-y-8 max-w-4xl mx-auto px-6">
          {/* AI Business Assistant */}
          <div className="bg-white rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-gray-600">Hi, I'm your Biznify AI business assistant</p>
                <div className="flex items-center justify-center space-x-2">
                  <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-800">Ask me anything about your business</h2>
                </div>
              </div>
              
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(currentMessage)
                      setCurrentMessage("")
                    }
                  }}
                  placeholder="Ask about business strategy, operations, growth, or any business challenge"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button 
                    onClick={() => {
                      handleSendMessage(currentMessage)
                      setCurrentMessage("")
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-full hover:bg-purple-700 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Ask</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Start Section */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">QUICK START</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">Business Strategy</h4>
                  <p className="text-sm text-gray-600">Get insights on business strategy and growth planning.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">Legal Documents</h4>
                  <p className="text-sm text-gray-600">Generate and review legal documents and contracts.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">Marketing Campaigns</h4>
                  <p className="text-sm text-gray-600">Create and optimize marketing campaigns.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">Financial Planning</h4>
                  <p className="text-sm text-gray-600">Get advice on financial planning and budgeting.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">HR & Operations</h4>
                  <p className="text-sm text-gray-600">Manage HR processes and operational efficiency.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Insights</h4>
                  <p className="text-sm text-gray-600">Analyze customer data and market trends.</p>
                </div>
                <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Screen Chat Interface */
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white m-4 rounded-lg border border-gray-200 relative">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {currentChat?.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Floating Chat Input */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      if (currentChat) {
                        const newMessage = {
                          role: 'user' as const,
                          content: currentMessage,
                          timestamp: new Date().toISOString()
                        }
                        const aiResponse = {
                          role: 'assistant' as const,
                          content: `I understand you're asking about "${currentMessage}". Let me help you with that. This is a sample response - in a real implementation, this would be connected to an AI service.`,
                          timestamp: new Date().toISOString()
                        }
                        setCurrentChat({
                          ...currentChat,
                          messages: [...currentChat.messages, newMessage, aiResponse]
                        })
                        setCurrentMessage("")
                      }
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 px-4 py-3 border-0 focus:outline-none focus:ring-0 text-sm bg-transparent"
                />
                <button
                  onClick={() => {
                    if (currentChat && currentMessage.trim()) {
                      const newMessage = {
                        role: 'user' as const,
                        content: currentMessage,
                        timestamp: new Date().toISOString()
                      }
                      const aiResponse = {
                        role: 'assistant' as const,
                        content: `I understand you're asking about "${currentMessage}". Let me help you with that. This is a sample response - in a real implementation, this would be connected to an AI service.`,
                        timestamp: new Date().toISOString()
                      }
                      setCurrentChat({
                        ...currentChat,
                        messages: [...currentChat.messages, newMessage, aiResponse]
                      })
                      setCurrentMessage("")
                    }
                  }}
                  className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  </ProtectedRoute>
  )
}