import { Chip, User, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { DataTable } from '@/components/data-table';
import { customers } from '@/data/customers-data';

export const Customers = () => {
  const columns = [
    {
      key: "name",
      label: "NAME",
      render: (customer) => (
        <User
          name={customer.name}
          description={customer.email}
          avatarProps={{
            src: customer.avatar,
            size: "sm"
          }}
        />
      )
    },
    {
      key: "status",
      label: "STATUS",
      render: (customer) => {
        const statusMap = {
          active: { color: "success", label: "Active" },
          inactive: { color: "danger", label: "Inactive" },
          pending: { color: "warning", label: "Pending" }
        };

        const { color, label } = statusMap[customer.status] || { color: "primary", label: customer.status };

        return <Chip color={color} size="sm" variant="flat">{label}</Chip>;
      }
    },
    { key: "location", label: "LOCATION" },
    { key: "orders", label: "ORDERS" },
    { key: "spent", label: "TOTAL SPENT" },
    {
      key: "actions",
      label: "ACTIONS",
      render: () => (
        <div className="flex gap-2 justify-end">
          <Button isIconOnly size="sm" variant="light">
            <Icon icon="lucide:eye" width={16} height={16} />
          </Button>
          <Button isIconOnly size="sm" variant="light">
            <Icon icon="lucide:edit" width={16} height={16} />
          </Button>
          <Button isIconOnly size="sm" variant="light" color="danger">
            <Icon icon="lucide:trash" width={16} height={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-default-500">Manage your customer database.</p>
        </div>
        <Button color="primary" startContent={<Icon icon="lucide:plus" width={16} height={16} />}>
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-success-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success-500/20">
            <Icon icon="lucide:users" className="text-success-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-success-700">Active Customers</p>
            <p className="text-2xl font-semibold text-success-700">{customers.filter(c => c.status === 'active').length}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-warning-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-warning-500/20">
            <Icon icon="lucide:clock" className="text-warning-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-warning-700">Pending Customers</p>
            <p className="text-2xl font-semibold text-warning-700">{customers.filter(c => c.status === 'pending').length}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-danger-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-danger-500/20">
            <Icon icon="lucide:user-x" className="text-danger-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-danger-700">Inactive Customers</p>
            <p className="text-2xl font-semibold text-danger-700">{customers.filter(c => c.status === 'inactive').length}</p>
          </div>
        </div>
      </div>

      <DataTable
        title="Customer List"
        columns={columns}
        data={customers}
        rowKey="id"
      />
    </div>
  );
};