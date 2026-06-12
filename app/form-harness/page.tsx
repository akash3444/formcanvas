import { notFound } from "next/navigation"
import { FormHarness } from "./harness-client"

// Test-only route: renders generated form code live for end-to-end tests.
// Never exposed in production builds.
export default function FormHarnessPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <FormHarness />
}
