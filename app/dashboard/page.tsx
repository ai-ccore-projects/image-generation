import { ProtectedRoute } from "@/components/auth/protected-route"
import { ModelComparisonDashboard } from "@/components/generation/model-comparison-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ModelComparisonDashboard />
    </ProtectedRoute>
  )
}
