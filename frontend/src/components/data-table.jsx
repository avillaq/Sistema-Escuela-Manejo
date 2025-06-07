import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState, useMemo } from 'react';

export function DataTable({ title, columns, data, rowKey }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const pages = Math.ceil(data.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    
    return data.slice(start, end);
  }, [data, page]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
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
          emptyContent={"No se encontraron usuarios"} 
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