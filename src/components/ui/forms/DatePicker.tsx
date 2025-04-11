'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  name: string
  label: string
  error?: string
  helperText?: string
}

export const DatePicker = ({
  name,
  label,
  error,
  helperText,
}: DatePickerProps) => {
  const { register, setValue, watch } = useFormContext()
  const value = watch(name)
  const [isOpen, setIsOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Get current date info
  const currentDate = new Date()
  const [year, setYear] = useState(
    value ? new Date(value).getFullYear() : currentDate.getFullYear(),
  )
  const [month, setMonth] = useState(
    value ? new Date(value).getMonth() : currentDate.getMonth(),
  )

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Generate days for the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay} />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isSelected =
        value && new Date(value).toDateString() === date.toDateString()
      const isToday = currentDate.toDateString() === date.toDateString()

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => {
            setValue(name, date)
            setIsOpen(false)
          }}
          className={cn(
            styles.dayButton,
            isSelected && styles.selectedDay,
            !isSelected && isToday && styles.todayDay,
            !isSelected && !isToday && styles.normalDay,
          )}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  // Helper for month name
  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString('default', { month: 'long' })
  }

  return (
    <div className={styles.container}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>

      <div className={styles.relative}>
        {/* Hidden input for form registration */}
        <input type="hidden" id={name} {...register(name)} />

        {/* Date display button */}
        <Button
          type="button"
          variant="outline"
          className={styles.dateButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <CalendarIcon className={styles.calendarIcon} />
          {value ? (
            new Date(value).toLocaleDateString()
          ) : (
            <span className={styles.placeholderText}>Pick a date</span>
          )}
        </Button>

        {/* Calendar dropdown */}
        {isOpen && (
          <div ref={calendarRef} className={styles.calendarDropdown}>
            {/* Calendar header */}
            <div className={styles.calendarHeader}>
              <button
                type="button"
                onClick={() => setMonth((prev) => (prev > 0 ? prev - 1 : 11))}
                className={styles.navButton}
              >
                ◀
              </button>

              <div className={styles.monthYearSelector}>
                <span className={styles.monthLabel}>{getMonthName(month)}</span>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className={styles.yearSelect}
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => currentDate.getFullYear() - 5 + i,
                  ).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setMonth((prev) => (prev < 11 ? prev + 1 : 0))}
                className={styles.navButton}
              >
                ▶
              </button>
            </div>

            {/* Day headers */}
            <div className={styles.daysHeader}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className={styles.dayHeaderCell}>
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className={styles.daysGrid}>{renderCalendar()}</div>

            {/* Quick navigation */}
            <div className={styles.quickNav}>
              <button
                type="button"
                className={styles.quickNavButton}
                onClick={() => {
                  setValue(name, new Date())
                  setIsOpen(false)
                }}
              >
                Today
              </button>
              <button
                type="button"
                className={styles.quickNavButton}
                onClick={() => {
                  setValue(name, '')
                  setIsOpen(false)
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  )
}

const styles = {
  container: 'space-y-2',
  label: 'block text-sm font-medium text-primary-900',
  relative: 'relative',
  dateButton: 'bg-primary-100 w-full justify-start text-left font-normal',
  calendarIcon: 'mr-2 h-4 w-4',
  placeholderText: 'text-primary-900',
  calendarDropdown:
    'absolute z-10 mt-1 w-full max-w-64 bg-primary-100 rounded-md border border-primary-300 shadow-lg p-3',
  calendarHeader: 'flex justify-between items-center mb-2',
  navButton: 'p-1 rounded hover:bg-primary-100',
  monthYearSelector: 'flex items-center',
  monthLabel: 'mr-1',
  yearSelect: 'p-1 border-none text-sm bg-transparent',
  daysHeader: 'grid grid-cols-7 gap-1 mb-1',
  dayHeaderCell:
    'h-8 w-8 flex items-center justify-center text-xs font-medium text-primary-500',
  daysGrid: 'grid grid-cols-7 gap-1',
  emptyDay: 'h-8 w-8',
  dayButton: 'h-8 w-8 rounded-full text-sm flex items-center justify-center',
  selectedDay: 'bg-primary-200 text-white',
  todayDay: 'border border-primary-200',
  normalDay: 'hover:bg-primary-100',
  quickNav: 'mt-2 pt-2 border-t border-primary-100 flex justify-between',
  quickNavButton: 'text-xs text-primary-500 hover:underline',
  errorMessage: 'text-sm text-error-500',
  helperText: 'text-[11px] text-primary-700',
}
