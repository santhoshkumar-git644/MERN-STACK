import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const DataTable = ({ columns, data, emptyMessage = "No results found." }) => {
  const [sorting, setSorting] = useState([]);

  // Adapt the existing simple column format to tanstack format if needed
  const tableColumns = React.useMemo(() => {
    return columns.map(col => ({
      accessorKey: col.accessorKey,
      header: col.header,
      cell: info => {
        if (col.render) {
          return col.render(info.row.original);
        }
        return info.getValue();
      }
    }));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-sm">
        <div className="w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/[0.08] bg-black/20">
                  {headerGroup.headers.map(header => {
                    return (
                      <th
                        key={header.id}
                        className="h-12 px-5 text-left align-middle font-medium text-muted-foreground whitespace-nowrap cursor-pointer hover:text-white transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <ChevronUp className="w-4 h-4 text-primary" />,
                            desc: <ChevronDown className="w-4 h-4 text-primary" />,
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.05] data-[state=selected]:bg-white/[0.05]"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-5 align-middle text-slate-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-muted-foreground">{emptyMessage}</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};