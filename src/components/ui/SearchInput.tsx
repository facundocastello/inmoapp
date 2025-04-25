'use client'
import { useEffect, useState } from 'react'

import { useDebounce } from '@/lib/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchInputProps<T extends { id: string | number }> {
  renderItem: (item: T) => React.ReactNode
  selectedItem: T | null
  onSelect: (property: T) => void
  handleSearch: (data: { query: string; ignoreIds?: string[] }) => Promise<{
    success: boolean
    data?: T[] | null
    error?: string
  }>
  ignoreIds?: string[]
  initialValue?: string
}

export const SearchInput = <T extends { id: string | number }>({
  onSelect,
  selectedItem,
  handleSearch,
  renderItem,
  ignoreIds,
  initialValue,
}: SearchInputProps<T>) => {
  const [value, setValue] = useState(initialValue || '')
  const [searchResults, setSearchResults] = useState<T[]>(
    selectedItem ? [selectedItem] : [],
  )
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const debouncedSearch = useDebounce(value, 500)

  useEffect(() => {
    if (debouncedSearch.length > 2) triggerSearch(debouncedSearch)
  }, [debouncedSearch])

  const triggerSearch = async (query: string) => {
    if (query.length < 3) return

    setIsSearching(true)
    const { data } = await handleSearch({ query, ignoreIds })
    if (data) {
      setSearchResults(data)
    }
    setIsSearching(false)
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        onChange={(e) => setValue(e.currentTarget.value)}
        onFocus={() => setShowResults(true)}
      />
      {showResults && (
        <div className={styles.results} onMouseDown={(e) => e.preventDefault()}>
          {isSearching && <div className={styles.loading}>Searching...</div>}
          {searchResults.map((item) => (
            <div
              className={cn(
                styles.resultItem,
                selectedItem?.id === item.id && styles.selected,
              )}
              onClick={() => {
                onSelect(item)
                setShowResults(false)
              }}
              key={item.id}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: 'flex flex-col space-y-4 relative',
  input: 'w-full border border-primary-300 rounded p-2',
  loading: 'text-primary-700',
  results:
    'flex flex-col space-y-2 min-h-96 border border-primary-300 rounded p-2 overflow-y-auto absolute top-full left-0 w-full z-50 bg-primary-100/95 shadow',
  resultItem: 'p-2 rounded cursor-pointer bg-primary-200 hover:bg-primary-300',
  selected: 'bg-primary-200',
  resultTitle: 'font-medium',
  resultSubtitle: 'text-sm text-primary-700',
}
