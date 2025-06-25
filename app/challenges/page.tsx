import { ProtectedRoute } from "@/components/auth/protected-route"
import { ChallengesDashboard } from "@/components/challenges/challenges-dashboard"

export default function ChallengesPage() {
  return (
    <ProtectedRoute>
      <ChallengesDashboard />
    </ProtectedRoute>
  )
}
