"use client";

import * as React from "react";
import { useState, useMemo } from "react";
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

interface CardStatusData {
  cardNumber: string;
  accountNumber: string;
  issueDate: string;
  status: string;
}

export const physicalCardStatusData: CardStatusData[] = [
  { cardNumber: "1234 5678 9012 3456", accountNumber: "12345", issueDate: "2023-01-01", status: "Active" },
  { cardNumber: "2345 6789 0123 4567", accountNumber: "67890", issueDate: "2023-02-01", status: "Inactive" },
  { cardNumber: "3456 7890 1234 5678", accountNumber: "54321", issueDate: "2023-03-01", status: "Active" },
  { cardNumber: "4567 8901 2345 6789", accountNumber: "12345", issueDate: "2024-01-01", status: "Active" },
  { cardNumber: "5678 9012 3456 7890", accountNumber: "67890", issueDate: "2024-02-01", status: "Inactive" },
  { cardNumber: "6789 0123 4567 8901", accountNumber: "54321", issueDate: "2024-03-01", status: "Active" },
  // Add more data as needed
];

const PhysicalCardStatus = () => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof CardStatusData, direction: string } | null>(null);
  const [filter, setFilter] = useState<{ accountNumber: string, issueDate: string, status: string }>({
    accountNumber: "",
    issueDate: "",
    status: ""
  });

  const cardStatusData: CardStatusData[] = useMemo(() => physicalCardStatusData, []);

  const sortedData = useMemo(() => {
    let sortableData = [...cardStatusData];
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
  }, [cardStatusData, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      const matchesAccountNumber = item.accountNumber.includes(filter.accountNumber);
      const matchesIssueDate = item.issueDate.includes(filter.issueDate);
      const matchesStatus = item.status.includes(filter.status);
      return matchesAccountNumber && matchesIssueDate && matchesStatus;
    });
  }, [sortedData, filter]);

  const requestSort = (key: keyof CardStatusData) => {
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
      case 'cardNumber':
        requestSort('cardNumber');
        break;
      case 'accountNumber':
        requestSort('accountNumber');
        break;
      case 'issueDate':
        requestSort('issueDate');
        break;
      case 'status':
        requestSort('status');
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
              <CardTitle>Physical Card Issuing Status</CardTitle>
              <CardDescription>All physical card statuses</CardDescription>
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
                        placeholder="Filter by issue date..." 
                        name="issueDate"
                        value={filter.issueDate} 
                        onChange={handleFilterChange} 
                      />
                      <Input 
                        type="text" 
                        placeholder="Filter by status..." 
                        name="status"
                        value={filter.status} 
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
                    <DropdownMenuItem onSelect={() => handleSortChange('cardNumber')}>Card Number</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('accountNumber')}>Account Number</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('issueDate')}>Issue Date</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleSortChange('status')}>Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('cardNumber')}>
                      Card Number {sortConfig?.key === 'cardNumber' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('accountNumber')}>
                      Account Number {sortConfig?.key === 'accountNumber' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('issueDate')}>
                      Issue Date {sortConfig?.key === 'issueDate' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                      Status {sortConfig?.key === 'status' ? (sortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.cardNumber}</TableCell>
                      <TableCell>{item.accountNumber}</TableCell>
                      <TableCell>{item.issueDate}</TableCell>
                      <TableCell>{item.status}</TableCell>
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

export const LatestPhysicalCardStatus: React.FC = () => {
  const latestCardStatusData = physicalCardStatusData
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3);

  return (
    <Link href="/Dashboard/physical-card-status">
      <Card className="bg-white shadow-md cursor-pointer">
        <CardHeader>
          <CardTitle>Physical Card Issuing Status</CardTitle>
          <CardDescription>Newest 3 card statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Number</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestCardStatusData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.cardNumber}</TableCell>
                  <TableCell>{item.accountNumber}</TableCell>
                  <TableCell>{item.issueDate}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PhysicalCardStatus;
