import { useState } from "react";
import { MoreVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const DataTable = () => {
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });
  
  const tableData = [
    { id: 1, name: 'John Smith', email: 'john@example.com', status: 'Active', amount: '$1,200.00' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', status: 'Pending', amount: '$850.00' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', status: 'Active', amount: '$1,450.00' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', status: 'Inactive', amount: '$320.00' },
    { id: 5, name: 'Robert Wilson', email: 'robert@example.com', status: 'Active', amount: '$970.00' },
  ];

  const handleSort = (column) => {
    setSort({ 
      column, 
      direction: sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc' 
    });
  };
  
  const sortedData = [...tableData].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    return a[sort.column] > b[sort.column] ? direction : -direction;
  });

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <TableHeader onClick={() => handleSort('name')} active={sort.column === 'name'} direction={sort.direction}>
              Customer
            </TableHeader>
            <TableHeader onClick={() => handleSort('email')} active={sort.column === 'email'} direction={sort.direction}>
              Email
            </TableHeader>
            <TableHeader onClick={() => handleSort('status')} active={sort.column === 'status'} direction={sort.direction}>
              Status
            </TableHeader>
            <TableHeader onClick={() => handleSort('amount')} active={sort.column === 'amount'} direction={sort.direction}>
              Amount
            </TableHeader>
            <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedData.map((row) => (
            <tr key={row.id} className="hover:bg-muted/50">
              <td className="py-4 px-4 whitespace-nowrap">
                <div className="font-medium">{row.name}</div>
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                {row.email}
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                <StatusBadge status={row.status} />
              </td>
              <td className="py-4 px-4 whitespace-nowrap">
                {row.amount}
              </td>
              <td className="py-4 px-4 whitespace-nowrap text-right">
                <button className="p-1 rounded-md hover:bg-accent">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableHeader({ children, onClick, active, direction }) {
  return (
    <th 
      className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <span className={cn("transition-opacity", active ? "opacity-100" : "opacity-0 group-hover:opacity-70")}>
          {active && direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        </span>
      </div>
    </th>
  );
}

function StatusBadge({ status }) {
  let className;
  
  switch (status) {
    case 'Active':
      className = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      break;
    case 'Pending':
      className = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      break;
    default:
      className = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      break;
  }
  
  return (
    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', className)}>
      {status}
    </span>
  );
}