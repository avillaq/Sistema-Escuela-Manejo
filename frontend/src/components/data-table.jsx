import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';

export function DataTable({ title, columns, data, rowKey }) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 5;

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  const pages = Math.ceil(filteredData.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Icon icon="lucide:search" className="text-default-400" />}
            size="sm"
            className="w-full sm:max-w-[44%]"
          />
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="flat" 
                size="sm"
                endContent={<Icon icon="lucide:chevron-down" width={16} height={16} />}
              >
                Actions
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Table Actions">
              <DropdownItem key="export" startContent={<Icon icon="lucide:download" width={16} height={16} />}>
                Export to CSV
              </DropdownItem>
              <DropdownItem key="print" startContent={<Icon icon="lucide:printer" width={16} height={16} />}>
                Print
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      
      <Table 
        aria-label={title}
        bottomContent={
          pages > 0 ? (
            <div className="flex justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={setPage}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper: "min-h-[400px]",
        }}
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn 
              key={column.key} 
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody 
          emptyContent={"No data found"} 
          items={items}
        >
          {(item) => (
            <TableRow key={String(item[rowKey])}>
              {columns.map((column) => (
                <TableCell key={`${String(item[rowKey])}-${column.key}`}>
                  {column.render 
                    ? column.render(item)
                    : String(item[column.key] || '')
                  }
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}