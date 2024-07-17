import * as React from "react";
import { Sidebar } from "../../../components/ui/SideBar";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../components/ui/table";
import { LatestVendorTopup } from "../user-topup/page"; // Import the LatestVendorTopup component
import { LatestVendorToCustomers } from "../vendor-to-customers/page"; // Import the LatestVendorToCustomers component
import { LatestCustomerToCustomer } from "../customer-to-customer/page"; // Import the LatestCustomerToCustomer component
import { LatestPaymentCustomerToMerchant } from "../payment-customer-to-merchant/page"; // Import the LatestPaymentCustomerToMerchant component
// import { LatestPendingInvoices } from "../pending-invoices/page";
import { LatestPaymentMerchantToMerchant } from "../payment-merchant-to-merchant/page";
import { LatestTotalTransactions } from "../total-transactions/page";
// import { LatestPhysicalCardStatus } from "../physical-card-status/page";

const page = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar className="w-64 bg-black text-white shadow-md" />
      <div className="flex-1 p-6 ml-64">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <LatestVendorTopup /> {/* Use the LatestVendorTopup component here */}
          <LatestVendorToCustomers /> {/* Use the LatestVendorToCustomers component here */}
          <LatestCustomerToCustomer /> {/* Use the LatestCustomerToCustomer component here */}
          <LatestPaymentCustomerToMerchant /> {/* Use the LatestPaymentCustomerToMerchant component here */}
          <LatestPaymentMerchantToMerchant /> {/* Use the LatestPaymentCustomerToMerchant component here */}
          {/* <LatestPendingInvoices /> Use the LatestPendingInvoices component here */}
          <LatestTotalTransactions /> {/* Use the LatestTotalTransactions component here */}
          {/* <LatestPhysicalCardStatus /> Use the LatestPhysicalCardStatus component here */}
        </div>
      </div>
    </div>
  );
};

export default page;
