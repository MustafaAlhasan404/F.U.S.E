'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateAesKey, encryptAesKey, encryptData, decryptData } from "../lib/crypto-utils";
import axios from "axios";
import Image from "next/image";

const baseUrl = "https://fuse-backend-x7mr.onrender.com";

interface HomeProps {
  billNumber?: string;
}

interface Card {
  id: string;
  cvv: string;
  expiryDate: string;
  cardName: string;
  balance: number; // Add this line
}

interface Bill {
  id?: string;
  invalid?: boolean;
  status?: string;
  category?: string;
  merchantAccount?: {
    user: {
      name: string;
    }
  };
  details?: string;
  amount?: number;
}


export default function Home({ billNumber }: HomeProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aesKey, setAesKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [jwt, setJwt] = useState("");

  const searchForBill = useCallback(async (billNumber: string) => {
    if (!billNumber) return;
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/bill/${billNumber}`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      if (decryptedPayload && decryptedPayload.id) {
        setBill(decryptedPayload);
      } else {
        setBill({ invalid: true });
      }
    } catch (error) {
      console.error('Failed to fetch bill:', error);
      setBill({ invalid: true });
    } finally {
      setLoading(false);
    }
  }, [aesKey, jwt]);

  useEffect(() => {
    if (billNumber && selectedCard) {
      searchForBill(billNumber);
    }
  }, [selectedCard, billNumber, searchForBill]);

  useEffect(() => {
    if (cards.length > 0) {
      setSelectedCard(cards[0]);
    }
  }, [cards]);

  const handleLoginStep1 = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/key/publicKey`, { email });
      const { publicKey } = response.data;
      const newAesKey = generateAesKey();
      setAesKey(newAesKey);
      const encryptedAesKey = encryptAesKey(publicKey, newAesKey);
      const response2 = await axios.post(`${baseUrl}/key/setAESkey`, { email, encryptedAesKey });
      if (response2.status === 200) {
        setStep(2);
      }
    } catch (error) {
      alert('Failed to initiate login process');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStep2 = async () => {
    setLoading(true);
    try {
      const payload = encryptData({ email, password }, aesKey);
      const response = await axios.post(`${baseUrl}/auth/login`, { email, payload });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      setJwt(decryptedPayload.jwt);
      await fetchCards(decryptedPayload.jwt, aesKey);
      setStep(3);
    } catch (error) {
      alert('Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async (jwt: string, aesKey: string) => {
    try {
      const response = await axios.post(`${baseUrl}/card/user`, { jwt });
      const decryptedPayload = decryptData(response.data.payload, aesKey);
      setCards(decryptedPayload);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const payBill = async () => {
    if (!selectedCard || !selectedCard.expiryDate) {
      alert('Card information is incomplete');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/bill/pay/${bill?.id}`, {
        jwt,
        payload: encryptData({
          cardId: selectedCard.id,
          cvv: selectedCard.cvv,
          month: (new Date(selectedCard.expiryDate).getMonth() + 1).toString(),
          year: (new Date(selectedCard.expiryDate).getFullYear()).toString(),
        }, aesKey),
      });
      decryptData(response.data.payload, aesKey);
      setTransactionStatus("success");
    } catch (error) {
      alert('Failed to pay bill');
      setTransactionStatus("failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {step < 3 ? (
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
                src="/assets/FuseLogo.png"
                alt="Fuse Logo"
                width={50}
                height={50}
                className="ml-2"
              />
            </div>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleLoginStep1(); }} className="space-y-4">
                <div className="mb-4">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
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
              <form onSubmit={(e) => { e.preventDefault(); handleLoginStep2(); }} className="space-y-4">
                <div className="mb-4">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required
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
      ) : (
        <div className="w-full md:w-10/12 lg:w-8/12 flex flex-col md:flex-row gap-4 md:gap-8">
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Select a Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-3xl cursor-pointer ${selectedCard && selectedCard.id === card.id ? 'ring-2 ring-black ring-inset' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <div
                      className="relative overflow-hidden rounded-lg mx-auto card-container"
                      style={{
                        backgroundImage: "url('/assets/Cart Minimal 5.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100%',
                        maxWidth: '23rem',
                        height: '0',
                        paddingBottom: '62.5%',
                      }}
                    >
                      <div className="absolute inset-0 p-4 text-white flex flex-col justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-70 mb-1">Card Name:</p>
                          <p className="text-sm sm:text-lg font-bold">{card.cardName}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm opacity-70 mb-1">Balance:</p>
                          <p className="text-lg sm:text-2xl font-bold">${card.balance}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70 mb-1">Expiry Date:</p>
                          <p className="text-xs sm:text-sm">
                            {new Date(card.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedCard && (
            <Card className="w-full md:w-1/2">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Bill Details</CardTitle>
              </CardHeader>
              <CardContent>
                {bill ? (
                  bill.invalid ? (
                    <p className="text-red-500">This bill number is invalid.</p>
                  ) : (
                    <div className="space-y-2 text-sm sm:text-base">
                      {bill.status === "Paid" ? (
                        <p className="text-xl text-green-600 font-medium sm:text-2xl">Paid Bill</p>
                      ) : (
                        <>
                          <p><strong>Bill Number:</strong> {bill.id}</p>
                          <p><strong>Category:</strong> {bill.category}</p>
                          <p><strong>Merchant:</strong> {bill.merchantAccount?.user?.name ?? 'N/A'}</p>
                          <p><strong>Description:</strong> {bill.details}</p>
                          <p><strong>Amount:</strong> ${bill.amount}</p>
                          <Button onClick={payBill} className="w-full mt-4" disabled={loading}>
                            {loading ? "Processing..." : "Pay Bill"}
                          </Button>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  <p>Loading bill details...</p>
                )}
                {transactionStatus && (
                  <div className="mt-4 text-center">
                    {transactionStatus === "success" ? (
                      <p className="text-green-500">Payment completed successfully.</p>
                    ) : (
                      <p className="text-red-500">An error occurred, please try again later.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
