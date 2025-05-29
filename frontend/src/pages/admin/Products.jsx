import { Chip, Button, Card, CardBody, CardFooter, Image } from '@heroui/react';
import { Icon } from '@iconify/react';
import { DataTable } from '../../components/data-table';
import { products } from '../../data/products-data';
import { useState } from 'react';

export const Products = () => {
  const [view, setView] = useState('table');
  
  const columns = [
    {
      key: "name",
      label: "PRODUCT",
      render: (product) => (
        <div className="flex items-center gap-3">
          <Image
            src={product.image}
            alt={product.name}
            className="w-10 h-10 object-cover rounded-md"
          />
          <div>
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-default-500">{product.sku}</p>
          </div>
        </div>
      )
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (product) => (
        <Chip size="sm" variant="flat">{product.category}</Chip>
      )
    },
    { 
      key: "price", 
      label: "PRICE",
      render: (product) => (
        <span>${product.price.toFixed(2)}</span>
      )
    },
    { 
      key: "stock", 
      label: "STOCK",
      render: (product) => {
        let color = "success";
        
        if (product.stock < 10) {
          color = "danger";
        } else if (product.stock < 50) {
          color = "warning";
        }
        
        return <Chip color={color} size="sm" variant="flat">{product.stock}</Chip>;
      }
    },
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
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-default-500">Manage your product inventory.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'table' ? 'solid' : 'flat'} 
            onPress={() => setView('table')}
            isIconOnly
          >
            <Icon icon="lucide:list" width={16} height={16} />
          </Button>
          <Button 
            variant={view === 'grid' ? 'solid' : 'flat'} 
            onPress={() => setView('grid')}
            isIconOnly
          >
            <Icon icon="lucide:grid" width={16} height={16} />
          </Button>
          <Button color="primary" startContent={<Icon icon="lucide:plus" width={16} height={16} />}>
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-primary-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-primary-500/20">
            <Icon icon="lucide:package" className="text-primary-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-primary-700">Total Products</p>
            <p className="text-2xl font-semibold text-primary-700">{products.length}</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-warning-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-warning-500/20">
            <Icon icon="lucide:alert-triangle" className="text-warning-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-warning-700">Low Stock</p>
            <p className="text-2xl font-semibold text-warning-700">{products.filter(p => p.stock < 50).length}</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg bg-success-100 flex items-center gap-4">
          <div className="p-3 rounded-full bg-success-500/20">
            <Icon icon="lucide:trending-up" className="text-success-500" width={24} height={24} />
          </div>
          <div>
            <p className="text-sm text-success-700">Total Value</p>
            <p className="text-2xl font-semibold text-success-700">
              ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {view === 'table' ? (
        <DataTable 
          title="Product List" 
          columns={columns} 
          data={products} 
          rowKey="id" 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} shadow="sm" isPressable>
              <CardBody className="p-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-md font-semibold">{product.name}</h3>
                      <p className="text-sm text-default-500">{product.category}</p>
                    </div>
                    <Chip size="sm" variant="flat">${product.price.toFixed(2)}</Chip>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-default-500">SKU: {product.sku}</p>
                    <Chip 
                      size="sm" 
                      color={product.stock < 10 ? "danger" : product.stock < 50 ? "warning" : "success"}
                    >
                      {product.stock} in stock
                    </Chip>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="flex justify-between">
                <Button size="sm" variant="flat">
                  <Icon icon="lucide:eye" width={16} height={16} className="mr-1" /> View
                </Button>
                <Button size="sm" variant="flat">
                  <Icon icon="lucide:edit" width={16} height={16} className="mr-1" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};