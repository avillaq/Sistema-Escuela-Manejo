import { DataTable } from "@/components/dashboard/DataTable";

export const Customers = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Customers</h2>
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <DataTable />
      </div>
    </div>
  );
}