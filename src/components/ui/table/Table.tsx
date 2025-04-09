import { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

import { Image } from '../Image'

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = ({ className, ...props }: TableProps) => {
  return (
    <div className={styles.wrapper}>
      <table className={cn(styles.table, className)} {...props} />
    </div>
  )
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = ({ className, ...props }: TableHeaderProps) => {
  return <thead className={cn(styles.header, className)} {...props} />
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = ({ className, ...props }: TableBodyProps) => {
  return <tbody className={cn(styles.body, className)} {...props} />
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = ({ className, ...props }: TableRowProps) => {
  return <tr className={cn(styles.row, className)} {...props} />
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}
interface TableCellImageProps extends HTMLAttributes<HTMLTableCellElement> {
  fileKey: string | null
}

export const TableCell = ({ className, ...props }: TableCellProps) => {
  return <td className={cn(styles.cell, className)} {...props} />
}

export const TableCellImage = ({
  className,
  fileKey,
  ...props
}: TableCellImageProps) => {
  return (
    <td className={cn(styles.cell, className)} {...props}>
      {fileKey && (
        <Image className={styles.image} fileKey={fileKey} alt="Preview" />
      )}
    </td>
  )
}
interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {}

export const TableHeaderCell = ({
  className,
  ...props
}: TableHeaderCellProps) => {
  return <th className={cn(styles.headerCell, className)} {...props} />
}

const styles = {
  wrapper: 'overflow-x-auto rounded-lg border border-primary-200 shadow-sm',
  table: 'w-full border-collapse text-sm',
  header: 'bg-primary-200',
  body: 'divide-y divide-primary-100',
  row: 'hover:bg-primary-50/50 transition-colors duration-150',
  dataRow: 'bg-primary-50/30',
  cell: 'whitespace-nowrap px-6 py-4 text-primary-900',
  headerCell:
    'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-primary-800 bg-primary-100/50',
  image: 'w-12 h-12 rounded-full',
}
