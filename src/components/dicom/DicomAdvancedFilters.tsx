import React from 'react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/forms/Checkbox'
import { DatePicker } from '@/components/ui/forms/DatePicker'
import { Input } from '@/components/ui/forms/Input'
import { Select } from '@/components/ui/forms/Select'

// Common modalities in DICOM
export const MODALITIES = [
  { value: 'CR', label: 'Computed Radiography' },
  { value: 'CT', label: 'Computed Tomography' },
  { value: 'DX', label: 'Digital Radiography' },
  { value: 'MG', label: 'Mammography' },
  { value: 'MR', label: 'Magnetic Resonance' },
  { value: 'NM', label: 'Nuclear Medicine' },
  { value: 'OT', label: 'Other' },
  { value: 'PT', label: 'Positron Emission Tomography (PET)' },
  { value: 'RF', label: 'Radio Fluoroscopy' },
  { value: 'US', label: 'Ultrasound' },
  { value: 'XA', label: 'X-Ray Angiography' },
]

// Sort options for the studies
const SORT_OPTIONS = [
  { value: 'StudyDate', label: 'Study Date' },
  { value: 'PatientName', label: 'Patient Name' },
  { value: 'Modality', label: 'Modality' },
  { value: 'AccessionNumber', label: 'Accession Number' },
]

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10 per page' },
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
  { value: '100', label: '100 per page' },
]

interface DicomAdvancedFiltersProps {
  onResetFilters: () => void
}

export function DicomAdvancedFilters({
  onResetFilters,
}: DicomAdvancedFiltersProps) {
  const { setValue, watch } = useFormContext()
  const sortOrder = watch('sortOrder')

  return (
    <>
      {/* Main Filter Grid */}
      <div className={styles.filterGrid}>
        <Input name="accessionNumber" label="Accession Number" type="text" />
        <Input name="patientId" label="Patient ID" type="text" />
        <DatePicker name="studyDateFrom" label="Study Date From" />
        <DatePicker name="studyDateTo" label="Study Date To" />

        {/* Sort By */}
        <div className={styles.formGroup}>
          <Select name="sortBy" label="Sort" options={SORT_OPTIONS} />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setValue('sortOrder', sortOrder === 'asc' ? 'desc' : 'asc')
            }
            className={styles.sortDirectionButton}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        <div className={styles.checkboxContainer}>
          <Checkbox name="fuzzyMatching" label="Fuzzy Matching" />
        </div>
      </div>

      {/* Modalities Filter */}
      <div className={styles.modalitiesSection}>
        <label className={styles.modalitiesLabel}>Modalities</label>
        <div className={styles.modalitiesGrid}>
          {MODALITIES.map((modality) => (
            <Checkbox
              key={modality.value}
              name={`modalities.${modality.value}`}
              label={modality.value}
            />
          ))}
        </div>
      </div>

      {/* Page Size and Reset Filters */}
      <div className={styles.footerSection}>
        <div className={styles.pageSizeContainer}>
          <label className={styles.pageSizeLabel}>Show</label>
          <Select name="pageSize" label="" options={PAGE_SIZE_OPTIONS} />
        </div>
        <Button variant="outline" type="button" onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>
    </>
  )
}

const styles = {
  filterGrid:
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t mt-4',
  formGroup: 'flex items-end gap-2',
  label: 'block text-sm font-medium text-primary-900',
  sortContainer: 'flex gap-2',
  sortDirectionButton: 'px-3 h-9',
  checkboxContainer: 'flex items-center',
  modalitiesSection: 'pt-4 border-t mt-4',
  modalitiesLabel: 'mb-2 block text-sm font-medium text-primary-900',
  modalitiesGrid: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2',
  footerSection: 'flex justify-between items-center pt-4 border-t mt-4',
  pageSizeContainer: 'flex items-center space-x-2',
  pageSizeLabel: 'text-sm font-medium text-primary-900',
}
