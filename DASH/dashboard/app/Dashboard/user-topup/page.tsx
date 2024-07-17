"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link"; // Import Link from next/link
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../../components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../../components/ui/tooltip";
import { FaFilter, FaSort } from "react-icons/fa"; // Importing icons from react-icons
import { Sidebar } from "../../../components/ui/SideBar"; // Import Sidebar
import { useKeyContext } from "../../../context/KeyContext"; // Import KeyContext
import { encryption, decryption } from "../../../lib/crypto-utils"; // Import encryption and decryption functions

interface TopupData {
  id: number;
  supervisor?: {
    role: string;
  };
  account?: {
    user?: {
      name: string;
    };
  };
  accountNumber: number;
  amount: number;
  status: string;
  date?: string; // Add date property if needed
}

const UserTopup = () => {
  const { jwt, sharedKey } = useKeyContext(); // Get JWT token and shared key from context
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: string } | null>(null);
  const [filter, setFilter] = useState<{ accountNumber: string, date: string, minAmount: string, maxAmount: string }>({
    accountNumber: "",
    date: "",
    minAmount: "",
    maxAmount: ""
  });
  const [showPopup, setShowPopup] = useState(false);
  const [destinationAccount, setDestinationAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [topupData, setTopupData] = useState<TopupData[]>([]); // State to store fetched data

  useEffect(() => {
    const fetchTopupData = async () => {
      if (!jwt || !sharedKey) {
        return;
      }

      const response = await fetch("https://fuse-backend-x7mr.onrender.com/transaction/topUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt }),
      });

      const data = await response.json();
      console.log("Fetched data:", data); // Log the fetched data

      if (response.ok) {
        if (data.payload) {
          try {
            console.log("Payload before decryption:", data.payload);
            const decryptedData = await decryption(data, sharedKey);
            console.log("Decrypted data:", decryptedData);
            const parsedData = JSON.parse(decryptedData);
            if (Array.isArray(parsedData)) {
              setTopupData(parsedData);
            } else {
              alert("Fetched data is not an array");
            }
          } catch (error) {
            console.error("Decryption error:", error);
            alert("Failed to decrypt data");
          }
        } else {
          console.error("Payload is missing in the response data");
          alert("Payload is missing in the response data");
        }
      } else {
        alert("Failed to fetch top-up data");
      }
    };

    fetchTopupData();
  }, [jwt, sharedKey]);

  const sortedData = useMemo(() => {
    let sortableData = [...topupData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [topupData, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const matchesAccountNumber = item.account?.user?.name.includes(filter.accountNumber);
      const matchesDate = true; // Adjust this if you have a date field in the new structure
      const matchesMinAmount = filter.minAmount === "" || item.amount >= parseFloat(filter.minAmount);
      const matchesMaxAmount = filter.maxAmount === "" || item.amount <= parseFloat(filter.maxAmount);
      return matchesAccountNumber && matchesDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [sortedData, filter]);

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({ ...prevFilter, [name]: value }));
  };

  const handleSortChange = (value: string) => {
    requestSort(value);
  };

  const handleAddBalance = async () => {
    if (!jwt || !sharedKey) {
      return;
    }

    const payload = {
      account: parseInt(destinationAccount, 10),
      amount: parseFloat(amount),
    };

    const encryptedPayload = await encryption({ data: payload }, sharedKey);

    console.log("Making request to /transaction/cash/deposit with payload:", { jwt, payload: encryptedPayload });

    const response = await fetch("https://fuse-backend-x7mr.onrender.com/transaction/cash/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`,
      },
      body: JSON.stringify({ jwt, payload: encryptedPayload }),
    });

    if (response.ok) {
      alert("Balance added successfully");
      setShowPopup(false);
    } else {
      alert("Failed to add balance");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar className="w-64 bg-black text-white shadow-md" />
        <div className="flex-1 p-6 ml-64">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Vendor Topup</CardTitle>
              <CardDescription>Details of vendor top-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end space-x-4">
                <Button onClick={() => setShowPopup(true)}>+ Add Balance</Button>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <FaFilter />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Filter</span>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <div className="p-4 grid grid-cols-1 gap-4">
                      <Input
                        type="text"
                        placeholder="Filter by account number..."
                        name="accountNumber"
                        value={filter.accountNumber}
                        onChange={handleFilterChange}
                      />
                      <Input
                        type="date"
                        placeholder="Filter by date..."
                        name="date"
                        value={filter.date}
                        onChange={handleFilterChange}
                      />
                      <Input
                        type="number"
                        placeholder="Min amount..."
                        name="minAmount"
                        value={filter.minAmount}
                        onChange={handleFilterChange}
                      />
                      <Input
                        type="number"
                        placeholder="Max amount..."
                        name="maxAmount"
                        value={filter.maxAmount}
                        onChange={handleFilterChange}
                      />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <FaSort />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Sort</span>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleSortChange('supervisor.role')}>Source Role</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('accountNumber')}>Account ID</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('account.user.name')}>Account User Name</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('amount')}>Amount</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('status')}>Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center cursor-pointer" onClick={() => requestSort('supervisor.role')}>
                      Source Role {sortConfig?.key === 'supervisor.role' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => requestSort('accountNumber')}>
                      Account ID {sortConfig?.key === 'accountNumber' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => requestSort('account.user.name')}>
                      Account User Name {sortConfig?.key === 'account.user.name' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => requestSort('amount')}>
                      Amount {sortConfig?.key === 'amount' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="text-center cursor-pointer" onClick={() => requestSort('status')}>
                      Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">{item.supervisor?.role || "N/A"}</TableCell>
                      <TableCell className="text-center">{item.accountNumber}</TableCell>
                      <TableCell className="text-center">{item.account?.user?.name || "N/A"}</TableCell>
                      <TableCell className="text-center">${item.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">{item.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </CardContent>
          </Card>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl mb-4">Add Balance</h2>
            <Input
              type="text"
              placeholder="Destination Account"
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
              className="mb-4"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-4">
              <Button onClick={() => setShowPopup(false)}>Cancel</Button>
              <Button onClick={handleAddBalance}>Add Balance</Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};

export const LatestVendorTopup: React.FC = () => {
  const { jwt, sharedKey } = useKeyContext(); // Get JWT token and shared key from context
  const [latestTopupData, setLatestTopupData] = useState<TopupData[]>([]);

  useEffect(() => {
    const fetchLatestTopupData = async () => {
      if (!jwt || !sharedKey) {
        return;
      }

      const response = await fetch("https://fuse-backend-x7mr.onrender.com/transaction/topUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jwt }),
      });

      const data = await response.json();
      console.log("Fetched data:", data); // Log the fetched data

      if (response.ok) {
        if (data.payload) {
          try {
            console.log("Payload before decryption:", data.payload);
            const decryptedData = await decryption(data, sharedKey);
            console.log("Decrypted data:", decryptedData);
            const parsedData = JSON.parse(decryptedData);
            if (Array.isArray(parsedData)) {
              const sortedData = parsedData.sort((a: TopupData, b: TopupData) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).slice(0, 3);
              setLatestTopupData(sortedData);
            } else {
              alert("Fetched data is not an array");
            }
          } catch (error) {
            console.error("Decryption error:", error);
            alert("Failed to decrypt data");
          }
        } else {
          console.error("Payload is missing in the response data");
          alert("Payload is missing in the response data");
        }
      } else {
        alert("Failed to fetch top-up data");
      }
    };

    fetchLatestTopupData();
  }, [jwt, sharedKey]);

  return (
    <Link href="/Dashboard/user-topup">
      <Card className="bg-white shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle>Vendor Topup</CardTitle>
          <CardDescription>Newest 3 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Source Role</TableHead>
                <TableHead className="text-center">Account ID</TableHead>
                <TableHead className="text-center">Account User Name</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestTopupData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.supervisor?.role || "N/A"}</TableCell>
                  <TableCell className="text-center">{item.accountNumber}</TableCell>
                  <TableCell className="text-center">{item.account?.user?.name || "N/A"}</TableCell>
                  <TableCell className="text-center">${item.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Link>
  );
};

export default UserTopup;

// Helper function to get nested value
function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((value, key) => value?.[key], obj);
}
