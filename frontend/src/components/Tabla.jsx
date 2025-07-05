import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination } from '@heroui/react';
import { useState, useMemo } from 'react';

export function Tabla({ 
  title, 
  columns, 
  data, 
  rowKey, 
  showPagination = true, 
  isloading = false, 
  loadingContent = null,
  customPagination = null
}) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  const pages = Math.ceil(data.length / rowsPerPage);
  const items = useMemo(() => {
    if (!showPagination || customPagination) {
      return data;
    }

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, showPagination, customPagination]);

  const shouldShowPagination = customPagination 
    ? customPagination.show 
    : showPagination && pages > 1;

  const paginationComponent = customPagination ? (
    <div className="flex justify-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={customPagination.page}
        total={customPagination.total}
        onChange={customPagination.onChange}
      />
    </div>
  ) : (
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
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      
      <Table 
        aria-label={title}
        bottomContent={shouldShowPagination ? paginationComponent : null}
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
          emptyContent={"No se encontraron datos"} 
          items={items}
          isLoading={isloading}
          loadingContent={loadingContent || <div>Cargando...</div>}
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