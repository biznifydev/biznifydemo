import { NextResponse } from "next/server"
import { LEGAL_DOCUMENTS } from "@/lib/constants"

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      data: LEGAL_DOCUMENTS,
      message: "Legal documents retrieved successfully"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve legal documents"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Here you would typically save to a database
    // For now, just return the received data
    return NextResponse.json({
      success: true,
      data: body,
      message: "Legal document updated successfully"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update legal document"
      },
      { status: 500 }
    )
  }
} 