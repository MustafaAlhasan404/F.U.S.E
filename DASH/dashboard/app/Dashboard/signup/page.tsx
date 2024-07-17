// app/Dashboard/signup/page.tsx

"use client"

import * as React from "react"
import { useRouter } from "next/navigation" // Import useRouter from next/navigation
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { useKeyContext } from "../../../context/KeyContext" // Import the KeyContext
import { encryption } from "../../../lib/crypto-utils" // Import the encryption function
import { FaArrowLeft } from "react-icons/fa" // Import the back arrow icon

const SignupPage = () => {
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [birth, setBirth] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rPassword, setRPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false) // Add loading state
  const router = useRouter()
  const { jwt, sharedKey } = useKeyContext() // Get the JWT and shared key from the context

  React.useEffect(() => {
    console.log("Shared key in SignupPage:", sharedKey); // Debug: Print the shared key
    console.log("JWT in SignupPage:", jwt); // Debug: Print the JWT
  }, [sharedKey, jwt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true) // Set loading to true

    if (password !== rPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      if (sharedKey && jwt) {
        const employeeData = { name, email, phone, birth, password, rPassword }
        const encryptedPayload = await encryption({ data: employeeData }, sharedKey) // Encrypt the employee data

        const response = await fetch("https://fuse-backend-x7mr.onrender.com/auth/register/employee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwt}` // Include the JWT token in the Authorization header
          },
          body: JSON.stringify({ jwt, payload: encryptedPayload }), // Include jwt and payload in the body
        })

        console.log("Server response status:", response.status); // Log the response status
        const responseData = await response.json();
        console.log("Server response data:", responseData); // Log the response data

        if (response.ok) {
          router.push("/Dashboard/home")
        } else {
          console.error('Error response:', responseData) // Debug: Print the error response
          setError("Failed to register employee. Please try again.")
        }
      } else {
        setError("Encryption key not established. Please try again.")
      }
    } catch (error) {
      console.error('Error during employee registration:', error)
      setError("Failed to register employee. Please try again.")
    } finally {
      setLoading(false) // Set loading to false
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 bg-black text-white rounded-full"
        >
          <FaArrowLeft />
        </button>
      </div>
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle>Register Employee</CardTitle>
          <CardDescription>Create a new employee account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <Input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="birth" className="block text-sm font-medium text-gray-700">Birth Date (dd/mm/yyyy)</label>
              <Input
                id="birth"
                type="text"
                value={birth}
                onChange={(e) => setBirth(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="rPassword" className="block text-sm font-medium text-gray-700">Repeat Password</label>
              <Input
                id="rPassword"
                type="password"
                value={rPassword}
                onChange={(e) => setRPassword(e.target.value)}
                required
                className="mt-1 block w-full"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="mr-2">Loading...</span>
                  <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full"></div>
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupPage
