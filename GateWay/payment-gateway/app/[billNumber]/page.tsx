// app/[billNumber]/page.tsx
import Home from '../page';  // Adjust path as needed

interface Params {
  billNumber: string;
}

interface BillPageProps {
  params: Params;
}

export default function BillPage({ params }: BillPageProps) {
  return <Home billNumber={params.billNumber} />;
}

export async function generateStaticParams() {
  // If you have a list of bill numbers, you can generate static params here.
  // For example:
  // const billNumbers = await fetchBillNumbers();
  // return billNumbers.map((billNumber) => ({ billNumber }));

  return []; // Return an empty array if you don't have a list of bill numbers.
}
