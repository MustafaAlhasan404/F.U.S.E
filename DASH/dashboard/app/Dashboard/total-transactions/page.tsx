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
import { useKeyContext } from "../../../context/KeyContext"; // Import useKeyContext
import { encryption, decryption } from "../../../lib/crypto-utils"; // Import encryption and decryption methods

interface TransactionData {
  sourceAccount: string;
  sourceAccountName: string;
  destinationAccount: string;
  destinationAccountName: string;
  date: string;
  amount: number;
}

const TotalTransactions = () => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TransactionData, direction: string } | null>(null);
  const [filter, setFilter] = useState<{ accountNumber: string, date: string, minAmount: string, maxAmount: string }>({
    accountNumber: "",
    date: "",
    minAmount: "",
    maxAmount: ""
  });

  const { sharedKey, jwt } = useKeyContext(); // Get sharedKey and jwt from context

  useEffect(() => {
    const fetchData = async () => {
      if (sharedKey && jwt) {
        try {
          const response = await fetch("https://fuse-backend-x7mr.onrender.com/transaction/all", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jwt }),
          });
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status ${response.status}: ${errorText}`);
          }
    
          const responseData = await response.json();
          const decryptedData = await decryption(responseData, sharedKey);
          console.log("Decrypted Data:", decryptedData); // Log the decrypted data to inspect its structure
          const parsedData = JSON.parse(decryptedData).map((item: any) => ({
            ...item,
            sourceAccountName: item.sAccount?.user?.name || "Unknown Source",
            destinationAccountName: item.dAccount?.user?.name || "Unknown Destination",
            date: item.createdAt || "N/A",
          }));
          setTransactionData(parsedData);
        } catch (error) {
          console.error('Error during data fetch:', error);
        }
      }
    };
    

    fetchData();
  }, [sharedKey, jwt]);

  const sortedData = useMemo(() => {
    let sortableData = [...transactionData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [transactionData, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const sourceAccount = String(item.sourceAccount || "");
      const destinationAccount = String(item.destinationAccount || "");

      const matchesAccountNumber = sourceAccount.includes(filter.accountNumber) || destinationAccount.includes(filter.accountNumber);
      const matchesDate = item.date ? item.date.includes(filter.date) : true; // Skip date filtering if date is not present
      const matchesMinAmount = filter.minAmount === "" || item.amount >= parseFloat(filter.minAmount);
      const matchesMaxAmount = filter.maxAmount === "" || item.amount <= parseFloat(filter.maxAmount);
      return matchesAccountNumber && matchesDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [sortedData, filter]);

  const requestSort = (key: keyof TransactionData) => {
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
    switch (value) {
      case 'sourceAccount':
        requestSort('sourceAccount');
        break;
      case 'destinationAccount':
        requestSort('destinationAccount');
        break;
      case 'date':
        requestSort('date');
        break;
      case 'amount':
        requestSort('amount');
        break;
      default:
        break;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar className="w-64 bg-black text-white shadow-md" />
        <div className="flex-1 p-6 ml-64">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Total Transactions</CardTitle>
              <CardDescription>All transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end space-x-4">
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
                    <DropdownMenuItem onSelect={() => handleSortChange('sourceAccount')}>Source Account</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('destinationAccount')}>Destination Account</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('date')}>Date</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('amount')}>Amount</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('sourceAccount')}>
                      Source Name {sortConfig?.key === 'sourceAccount' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead>Source ID</TableHead> {/* Add this column */}
                    <TableHead className="cursor-pointer" onClick={() => requestSort('destinationAccount')}>
                      Destination Name {sortConfig?.key === 'destinationAccount' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead>Destination ID</TableHead> {/* Add this column */}
                    <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>
                      Date {sortConfig?.key === 'date' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('amount')}>
                      Amount {sortConfig?.key === 'amount' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sourceAccountName}</TableCell>
                      <TableCell>{item.sourceAccount}</TableCell>
                      <TableCell>{item.destinationAccountName}</TableCell>
                      <TableCell>{item.destinationAccount}</TableCell>
                      <TableCell>{item.date}</TableCell> {/* Handle missing date */}
                      <TableCell>${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export const LatestTotalTransactions: React.FC = () => {
  const { sharedKey, jwt } = useKeyContext(); // Get sharedKey and jwt from context
  const [latestTransactionData, setLatestTransactionData] = useState<TransactionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (sharedKey && jwt) {
        try {
          const response = await fetch("https://fuse-backend-x7mr.onrender.com/transaction/all", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jwt }),
          });
    
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status ${response.status}: ${errorText}`);
          }
    
          const responseData = await response.json();
          const decryptedData = await decryption(responseData, sharedKey);
          console.log("Decrypted Data:", decryptedData); // Log the decrypted data to inspect its structure
          const parsedData = JSON.parse(decryptedData).map((item: any) => ({
            ...item,
            sourceAccountName: item.sAccount?.user?.name || "Unknown Source",
            destinationAccountName: item.dAccount?.user?.name || "Unknown Destination",
            date: item.createdAt || "N/A",
          }));
          setLatestTransactionData(parsedData.slice(0, 3));
        } catch (error) {
          console.error('Error during data fetch:', error);
        }
      }
    };
    

    fetchData();
  }, [sharedKey, jwt]);

  return (
    <Link href="/Dashboard/total-transactions">
      <Card className="bg-white shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle>Total Transactions</CardTitle>
          <CardDescription>Newest 3 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Source Account Name</TableHead> {/* Add this column */}
                <TableHead className="text-center">Destination Account Name</TableHead> {/* Add this column */}
                <TableHead className="text-center">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestTransactionData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{item.sourceAccountName}</TableCell> {/* Add this cell */}
                  <TableCell className="text-center">{item.destinationAccountName}</TableCell> {/* Add this cell */}
                  <TableCell className="text-center">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TotalTransactions;
