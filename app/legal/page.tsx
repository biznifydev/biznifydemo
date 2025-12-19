import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { redirect } from "next/navigation"

export default function LegalPage() {
  redirect("/legal/overview")
} 