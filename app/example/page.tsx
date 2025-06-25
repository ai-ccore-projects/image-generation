"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExamplePage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    try {
      const { data, error } = await supabase.from("test_table").select("*").limit(5)

      if (error) {
        console.error("Error:", error)
      } else {
        setData(data || [])
        console.log("Connection successful!")
      }
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? "Testing..." : "Test Supabase Connection"}
          </Button>

          {data.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Data from Supabase:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
