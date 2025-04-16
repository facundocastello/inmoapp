import { DicomInstance, DicomSeries, DicomStudy } from './types/study'

export interface MappedStudy {
  studyInstanceUID: string
  patientName: string
  studyDate: string
  modalitiesInStudy: string[]
  studyDescription?: string
  patientID?: string
  numberOfInstances?: number
  patientBirthDate?: string
  patientSex?: string
  issuerOfPatientID?: string
  studyID?: string
  studyTime?: string
  accessionNumber?: string
  numberOfPatientRelatedStudies?: number
  numberOfStudyRelatedSeries?: number
  numberOfStudyRelatedInstances?: number
  sOPClassUID?: string
  archiveName?: string
  archiveAETitle?: string
  storageID?: string
  storageSize?: string
  storageStatus?: string
  createdTime?: string
  updatedTime?: string
  archivedTime?: string
  instanceAvailability?: string
  retrieveAETitle?: string
  url?: string
  specificCharacterSet?: string
  series: MappedSeries[]
}

export function mapDicomStudy(study: DicomStudy): MappedStudy {
  return {
    patientName: study['00100010']?.Value?.[0].Alphabetic || '',
    patientID: study['00100020']?.Value?.[0] || '',
    patientBirthDate: study['00100030']?.Value?.[0],
    patientSex: study['00100040']?.Value?.[0],
    issuerOfPatientID: study['00100021']?.Value?.[0],

    studyInstanceUID: study['0020000D']?.Value?.[0] || '',
    studyID: study['00200010']?.Value?.[0],
    studyDate: study['00080020']?.Value?.[0] || '',
    studyTime: study['00080030']?.Value?.[0],
    studyDescription: study['00081030']?.Value?.[0],
    accessionNumber: study['00080050']?.Value?.[0],
    numberOfPatientRelatedStudies: study['00201200']?.Value?.[0],
    numberOfStudyRelatedSeries: study['00201206']?.Value?.[0],
    numberOfStudyRelatedInstances: study['00201208']?.Value?.[0],

    modalitiesInStudy: study['00080061']?.Value || [],
    sOPClassUID: study['00080062']?.Value?.[0],

    archiveName: study['77770010']?.Value?.[0],
    archiveAETitle: study['77771027']?.Value?.[0],
    storageID: study['77771028']?.Value?.[0],
    storageSize: study['77771029']?.Value?.[0],
    storageStatus: study['7777102A']?.Value?.[0],
    createdTime: study['77771010']?.Value?.[0],
    updatedTime: study['77771011']?.Value?.[0],
    archivedTime: study['7777102D']?.Value?.[0],
    instanceAvailability: study['00080056']?.Value?.[0],
    retrieveAETitle: study['00080054']?.Value?.[0],
    url: study['00081190']?.Value?.[0],

    specificCharacterSet: study['00080005']?.Value?.[0],
    series: [],
  }
}

export interface MappedSeries {
  seriesInstanceUID: string
  studyInstanceUID: string
  modality: string
  modalitiesInStudy: string[]
  sOPClassUID: string
  url: string
  transferSyntaxUID: string
  patientName: string
  patientID: string
  issuerOfPatientID: string
  numberOfPatientRelatedStudies: number
  numberOfStudyRelatedSeries: number
  numberOfStudyRelatedInstances: number
  numberOfSeriesRelatedInstances: number
  archiveName: string
  createdTime: string
  updatedTime: string
  archivedTime: string
  retrievedTime: string
  storedTime: string
  archiveAETitle: string
  storageID: string
  storageSize: number
  storageStatus: number
  retrieveAETitle: string
  retrieveURL: string
  instanceAvailability: string
  instances: MappedInstance[]
}

export function mapDicomSeries(series: DicomSeries): MappedSeries {
  return {
    seriesInstanceUID: series['0020000E']?.Value?.[0] || '',
    studyInstanceUID: series['0020000D']?.Value?.[0] || '',
    modality: series['00080060']?.Value?.[0] || '',
    modalitiesInStudy: series['00080061']?.Value || [],
    sOPClassUID: series['00080062']?.Value?.[0] || '',
    url: series['00081190']?.Value?.[0] || '',
    transferSyntaxUID: series['00083002']?.Value?.[0] || '',
    patientName: series['00100010']?.Value?.[0]?.Alphabetic || '',
    patientID: series['00100020']?.Value?.[0] || '',
    issuerOfPatientID: series['00100021']?.Value?.[0] || '',
    numberOfPatientRelatedStudies: parseInt(
      series['00201200']?.Value?.[0] || '0',
    ),
    numberOfStudyRelatedSeries: parseInt(series['00201206']?.Value?.[0] || '0'),
    numberOfStudyRelatedInstances: parseInt(
      series['00201208']?.Value?.[0] || '0',
    ),
    numberOfSeriesRelatedInstances: parseInt(
      series['00201209']?.Value?.[0] || '0',
    ),
    archiveName: series['77770010']?.Value?.[0] || '',
    createdTime: series['77771010']?.Value?.[0] || '',
    updatedTime: series['77771011']?.Value?.[0] || '',
    archivedTime: series['7777102D']?.Value?.[0] || '',
    retrievedTime: series['7777106F']?.Value?.[0] || '',
    storedTime: series['77771031']?.Value?.[0] || '',
    archiveAETitle: series['77771027']?.Value?.[0] || '',
    storageID: series['77771028']?.Value?.[0] || '',
    storageSize: series['77771029']?.Value?.[0] || 0,
    storageStatus: series['7777102A']?.Value?.[0] || 0,
    retrieveAETitle: series['00080054']?.Value?.[0] || '',
    retrieveURL: series['7777106A']?.Value?.[0] || '',
    instanceAvailability: series['00080056']?.Value?.[0] || '',
    instances: [],
  }
}

export interface MappedInstance {
  specificCharacterSet?: string
  imageType?: string
  sopClassUid?: string
  sopInstanceUid?: string
  studyDate?: string
  studyTime?: string
  accessionNumber?: string
  retrieveAETitle?: string
  instanceAvailability?: string
  modality?: string
  modalitiesInStudy?: string[]
  manufacturer?: string
  institutionName?: string
  institutionAddress?: string
  referringPhysicianName?: string
  studyDescription?: string
  performingPhysicianName?: string
  url?: string
  transferSyntaxUID?: string
  patientName?: string
  patientID?: string
  issuerOfPatientID?: string
  patientBirthDate?: string
  patientSex?: string
  studyInstanceUID?: string
  seriesInstanceUID?: string
  studyID?: string
  seriesNumber?: string
  instanceNumber?: string
  numberOfPatientRelatedStudies?: number
  numberOfStudyRelatedSeries?: number
  numberOfStudyRelatedInstances?: number
  numberOfSeriesRelatedInstances?: number
  numberOfFrames?: number
  rows?: number
  columns?: number
  bitsAllocated?: number
  archiveName?: string
  createdTime?: string
  updatedTime?: string
  archivedTime?: string
  retrievedTime?: string
  storedTime?: string
  archiveAETitle?: string
  storageID?: string
  storageSize?: number
  storageStatus?: number
  archiveDescription?: string
  archiveUID?: string
  archiveSize?: number
  archiveStatus?: string
  retrieveURL?: string
}

export function mapDicomInstance(instance: DicomInstance): MappedInstance {
  return {
    specificCharacterSet: instance['00080005']?.Value?.[0],
    imageType: instance['00080008']?.Value?.[0],
    sopClassUid: instance['00080016']?.Value?.[0],
    sopInstanceUid: instance['00080018']?.Value?.[0],
    studyDate: instance['00080020']?.Value?.[0],
    studyTime: instance['00080030']?.Value?.[0],
    accessionNumber: instance['00080050']?.Value?.[0],
    retrieveAETitle: instance['00080054']?.Value?.[0],
    instanceAvailability: instance['00080056']?.Value?.[0],
    modality: instance['00080060']?.Value?.[0],
    modalitiesInStudy: instance['00080061']?.Value || [],
    manufacturer: instance['00080070']?.Value?.[0],
    institutionName: instance['00080080']?.Value?.[0],
    institutionAddress: instance['00080081']?.Value?.[0],
    referringPhysicianName: instance['00080090']?.Value?.[0],
    studyDescription: instance['00081030']?.Value?.[0],
    performingPhysicianName: instance['00081050']?.Value?.[0],
    url: instance['00081190']?.Value?.[0],
    transferSyntaxUID: instance['00083002']?.Value?.[0],
    patientName: instance['00100010']?.Value?.[0]?.Alphabetic,
    patientID: instance['00100020']?.Value?.[0],
    issuerOfPatientID: instance['00100021']?.Value?.[0],
    patientBirthDate: instance['00100030']?.Value?.[0],
    patientSex: instance['00100040']?.Value?.[0],
    studyInstanceUID: instance['0020000D']?.Value?.[0],
    seriesInstanceUID: instance['0020000E']?.Value?.[0],
    studyID: instance['00200010']?.Value?.[0],
    seriesNumber: instance['00200011']?.Value?.[0],
    instanceNumber: instance['00200013']?.Value?.[0],
    numberOfPatientRelatedStudies: parseInt(
      instance['00201200']?.Value?.[0] || '0',
    ),
    numberOfStudyRelatedSeries: parseInt(
      instance['00201206']?.Value?.[0] || '0',
    ),
    numberOfStudyRelatedInstances: parseInt(
      instance['00201208']?.Value?.[0] || '0',
    ),
    numberOfSeriesRelatedInstances: parseInt(
      instance['00201209']?.Value?.[0] || '0',
    ),
    numberOfFrames: parseInt(instance['00280008']?.Value?.[0] || '0'),
    rows: instance['00280010']?.Value?.[0],
    columns: instance['00280011']?.Value?.[0],
    bitsAllocated: instance['00280100']?.Value?.[0],
    archiveName: instance['77770010']?.Value?.[0],
    createdTime: instance['77771010']?.Value?.[0],
    updatedTime: instance['77771011']?.Value?.[0],
    archivedTime: instance['7777102D']?.Value?.[0],
    retrievedTime: instance['7777106F']?.Value?.[0],
    storedTime: instance['77771031']?.Value?.[0],
    archiveAETitle: instance['77771027']?.Value?.[0],
    storageID: instance['77771028']?.Value?.[0],
    storageSize: instance['77771029']?.Value?.[0],
    storageStatus: instance['7777102A']?.Value?.[0],
    archiveDescription: instance['77771051']?.Value?.[0],
    archiveUID: instance['77771052']?.Value?.[0],
    archiveSize: instance['77771053']?.Value?.[0],
    archiveStatus: instance['77771054']?.Value?.[0],
    retrieveURL: instance['77771069']?.Value?.[0],
  }
}

// Types for DICOM conversion
interface DicomConversionOptions {
  studyInstanceUID?: string
  seriesInstanceUID?: string
  filename?: string
  patientName?: string
  patientID?: string
  issuerOfPatientID?: string
  studyDate?: string
  studyTime?: string
  accessionNumber?: string
  studyDescription?: string
}

interface DicomTag {
  tag: [number, number]
  vr: string
  value: Uint8Array
}

/**
 * Converts a PDF buffer to a DICOM format blob
 */
export async function convertPdfToDicomBlob(
  pdfArrayBuffer: ArrayBuffer,
  options: DicomConversionOptions = {},
): Promise<Blob> {
  const pdfBytes = new Uint8Array(pdfArrayBuffer)
  const filename = options.filename || 'document.pdf'

  // Use the provided study UID (required) and generate new UIDs for series and SOP instance
  if (!options.studyInstanceUID) {
    throw new Error('Study Instance UID is required for PDF conversion')
  }

  // Use the provided UIDs or generate new ones
  const sopInstanceUID = generateDicomUID() // Always fresh
  const seriesInstanceUID = options.seriesInstanceUID || generateDicomUID()
  const studyInstanceUID = options.studyInstanceUID // Must use existing study UID

  // Helper to write a DICOM tag
  const writeTag = (group: number, element: number): number[] => [
    group & 0xff,
    (group >> 8) & 0xff,
    element & 0xff,
    (element >> 8) & 0xff,
  ]

  // Helper to write a VR (Value Representation) + length
  const writeVR = (vr: string, length: number): Uint8Array => {
    // DICOM has different encoding rules for different VR types
    if (['OB', 'OW', 'SQ', 'UN', 'UT'].includes(vr)) {
      // These VRs have a 2-byte VR, followed by 2 reserved bytes, followed by a 4-byte length
      const view = new Uint8Array(8)
      // Write VR
      view[0] = vr.charCodeAt(0)
      view[1] = vr.charCodeAt(1)
      // 2 reserved bytes (0)
      view[2] = 0
      view[3] = 0
      // 4-byte length (little endian)
      view[4] = length & 0xff
      view[5] = (length >> 8) & 0xff
      view[6] = (length >> 16) & 0xff
      view[7] = (length >> 24) & 0xff
      return view
    } else {
      // Standard VRs have a 2-byte VR followed by a 2-byte length
      const view = new Uint8Array(4)
      // Write VR
      view[0] = vr.charCodeAt(0)
      view[1] = vr.charCodeAt(1)
      // 2-byte length (little endian)
      view[2] = length & 0xff
      view[3] = (length >> 8) & 0xff
      return view
    }
  }

  // Define all the DICOM tags needed for an Encapsulated PDF
  const fields: DicomTag[] = [
    { tag: [0x0002, 0x0000], vr: 'UL', value: new Uint8Array([72, 0, 0, 0]) }, // File Meta Info Group Length
    { tag: [0x0002, 0x0001], vr: 'OB', value: new Uint8Array([0x00, 0x01]) }, // File Meta Info Version
    {
      tag: [0x0002, 0x0002],
      vr: 'UI',
      value: stringToBytes('1.2.840.10008.5.1.4.1.1.104.1'),
    }, // SOP Class UID (Encapsulated PDF)
    { tag: [0x0002, 0x0003], vr: 'UI', value: stringToBytes(sopInstanceUID) }, // Media Storage SOP Instance UID

    {
      tag: [0x0002, 0x0010],
      vr: 'UI',
      value: stringToBytes('1.2.840.10008.1.2.1'),
    }, // Transfer Syntax UID (Explicit VR Little Endian)

    // Required character set for international text
    { tag: [0x0008, 0x0005], vr: 'CS', value: stringToBytes('ISO_IR 192') }, // Specific Character Set (UTF-8)

    // Instance Creation information
    { tag: [0x0008, 0x0012], vr: 'DA', value: stringToBytes(getCurrentDate()) }, // Instance Creation Date
    { tag: [0x0008, 0x0013], vr: 'TM', value: stringToBytes(getCurrentTime()) }, // Instance Creation Time
    {
      tag: [0x0008, 0x0014],
      vr: 'UI',
      value: stringToBytes('2.25.22494752317116273610107671966225830014'),
    }, // Instance Creator UID (fixed for this application)

    // Content identification
    { tag: [0x0020, 0x0013], vr: 'IS', value: stringToBytes('1') }, // Instance Number
    { tag: [0x0008, 0x0023], vr: 'DA', value: stringToBytes(getCurrentDate()) }, // Content Date
    { tag: [0x0008, 0x0033], vr: 'TM', value: stringToBytes(getCurrentTime()) }, // Content Time

    // Study, Series, and Instance identification
    { tag: [0x0020, 0x000d], vr: 'UI', value: stringToBytes(studyInstanceUID) }, // Study Instance UID
    {
      tag: [0x0020, 0x000e],
      vr: 'UI',
      value: stringToBytes(seriesInstanceUID),
    }, // Series Instance UID
    {
      tag: [0x0008, 0x0016],
      vr: 'UI',
      value: stringToBytes('1.2.840.10008.5.1.4.1.1.104.1'),
    }, // SOP Class UID
    { tag: [0x0008, 0x0018], vr: 'UI', value: stringToBytes(sopInstanceUID) }, // SOP Instance UID

    // Basic metadata
    { tag: [0x0008, 0x0060], vr: 'CS', value: stringToBytes('DOC') }, // Modality
    {
      tag: [0x0008, 0x103e],
      vr: 'LO',
      value: stringToBytes('PDF Documents'),
    }, // Series Description
    { tag: [0x0020, 0x0011], vr: 'IS', value: stringToBytes('1') }, // Series Number
    { tag: [0x0020, 0x0013], vr: 'IS', value: stringToBytes('1') }, // Instance Number

    // Patient and study information
    ...(options.patientName
      ? [
          {
            tag: [0x0010, 0x0010] as [number, number],
            vr: 'PN',
            value: stringToBytes(options.patientName),
          },
        ]
      : []), // Patient Name
    ...(options.issuerOfPatientID
      ? [
          {
            tag: [0x0010, 0x0021] as [number, number],
            vr: 'LO',
            value: stringToBytes(options.issuerOfPatientID),
          },
        ]
      : []), // Patient ID
    ...(options.patientID
      ? [
          {
            tag: [0x0010, 0x0020] as [number, number],
            vr: 'LO',
            value: stringToBytes(options.patientID),
          },
        ]
      : []), // Patient ID
    ...(options.studyDate
      ? [
          {
            tag: [0x0008, 0x0020] as [number, number],
            vr: 'DA',
            value: stringToBytes(options.studyDate),
          },
        ]
      : []), // Study Date
    ...(options.studyTime
      ? [
          {
            tag: [0x0008, 0x0030] as [number, number],
            vr: 'TM',
            value: stringToBytes(options.studyTime),
          },
        ]
      : []), // Study Time
    ...(options.accessionNumber
      ? [
          {
            tag: [0x0008, 0x0050] as [number, number],
            vr: 'SH',
            value: stringToBytes(options.accessionNumber),
          },
        ]
      : []), // Accession Number
    ...(options.studyDescription
      ? [
          {
            tag: [0x0008, 0x1030] as [number, number],
            vr: 'LO',
            value: stringToBytes(options.studyDescription),
          },
        ]
      : []), // Study Description

    // PDF specific attributes
    { tag: [0x0008, 0x0070], vr: 'LO', value: stringToBytes('Clinic App') }, // Manufacturer
    {
      tag: [0x0042, 0x0010],
      vr: 'ST',
      value: stringToBytes('application/pdf'),
    }, // MIME Type
    { tag: [0x0042, 0x0011], vr: 'OB', value: pdfBytes }, // Encapsulated Document (the PDF)
    { tag: [0x0042, 0x0012], vr: 'LO', value: stringToBytes(filename) }, // Document Title
  ]

  const dicomParts: (Uint8Array | Blob)[] = []

  // DICOM 128-byte preamble + 'DICM'
  dicomParts.push(new Uint8Array(128).fill(0))
  dicomParts.push(new TextEncoder().encode('DICM'))

  // Add all fields to the DICOM
  for (const field of fields) {
    dicomParts.push(new Uint8Array(writeTag(...field.tag)))
    dicomParts.push(writeVR(field.vr, field.value.length))
    dicomParts.push(field.value)
  }

  return new Blob(dicomParts, { type: 'application/dicom' })
}

/**
 * Convert a string to bytes for DICOM format (null-terminated)
 */
function stringToBytes(str: string): Uint8Array {
  const enc = new TextEncoder()
  return enc.encode(str)
}

/**
 * Generate a unique DICOM UID using UUID
 */
function generateDicomUID(): string {
  const uuid = crypto.randomUUID().replace(/-/g, '')
  const uid = '2.25.' + BigInt('0x' + uuid).toString()
  return uid.slice(0, 64) // max UID length is 64 characters
}

/**
 * Generate a simple hash string from input
 */
export async function hashString(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  // Convert to hex and take first 10 characters
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 10)
}

/**
 * Get current date in DICOM format (YYYYMMDD)
 */
function getCurrentDate(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Get current time in DICOM format (HHMMSS.mmm)
 */
function getCurrentTime(): string {
  const date = new Date()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${hours}${minutes}${seconds}.${milliseconds}`
}
