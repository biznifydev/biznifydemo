import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { redirect } from "next/navigation"

export default function MarketingPage() {
  redirect("/marketing/overview")
} 