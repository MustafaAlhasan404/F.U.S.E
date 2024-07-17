// app/page.tsx

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport, useToast } from "../components/ui/toast"
import Image from "next/image"
import { genPublic, genShared, encryption, decryption } from "../lib/crypto-utils"
import { useKeyContext } from "../context/KeyContext"
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode

const LoginPage = () => {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [step, setStep] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const { open, message, setOpen, showToast } = useToast()
  const { sharedKey, jwt, setServerPublicKey, setSharedKey, setJwt, setRole } = useKeyContext() // Add setRole

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const clientPublicKey = await genPublic();

      const response = await fetch("https://fuse-backend-x7mr.onrender.com/key/dashboard/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, clientPublicKey }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const { serverPublicKey } = data;

      setServerPublicKey(serverPublicKey);

      const derivedSharedKey = await genShared(serverPublicKey);
      setSharedKey(derivedSharedKey);

      setStep(2);
    } catch (error) {
      console.error('Error during key exchange:', error);
      showToast("Error", "Failed to exchange keys. Please try again.", "destructive");
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (sharedKey) {
        const encryptedPayload = await encryption({ data: { email, password } }, sharedKey);

        const response = await fetch("https://fuse-backend-x7mr.onrender.com/auth/dashboard/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, payload: encryptedPayload }),
        });

        if (response.ok) {
          const decryptedData = await decryption(await response.json(), sharedKey);
          const parsedData = JSON.parse(decryptedData);
          const { jwt } = parsedData;
          setJwt(jwt);

          // Decode the JWT token to extract the role
          const decodedToken: any = jwtDecode(jwt);
          const { role } = decodedToken;
          console.log("Decoded role:", role); // Debug: Print the extracted role
          setRole(role); // Save the role in context

          router.push("/Dashboard/home");
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          showToast("Invalid credentials", "Please check your email and password and try again.", "destructive");
        }
      } else {
        showToast("Error", "Encryption key not established. Please try again.", "destructive");
      }
    } catch (error) {
      console.error('Error during login:', error);
      showToast("Error", "Failed to login. Please try again.", "destructive");
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md p-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Access your account
                </CardDescription>
              </div>
              <Image
                priority={true}
                src="/FuseLogo.png"
                alt="Fuse Logo"
                width={50}
                height={50}
                className="ml-2"
              />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="mr-2">Loading...</span>
                      <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 border-t-transparent border-white rounded-full"></div>
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="mr-2">Loading...</span>
                      <div className="spinner-border animate-spin inline-block w-4 h-4 border-4 border-t-transparent border-white rounded-full"></div>
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <ToastViewport />
        <Toast open={open} onOpenChange={setOpen} variant={message.variant}>
          <ToastTitle>{message.title}</ToastTitle>
          <ToastDescription>{message.description}</ToastDescription>
        </Toast>
      </div>
      {jwt && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-md">
          <h2 className="text-lg font-bold">JWT Token:</h2>
          <pre className="break-words">{jwt}</pre>
        </div>
      )}
    </ToastProvider>
  )
}

export default LoginPage
