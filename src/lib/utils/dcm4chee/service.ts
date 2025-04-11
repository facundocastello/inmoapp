import dcmWebAppJson from './dcmWebApp.json'
import dcmWebAppWadoJson from './dcmWebAppWado.json'
import dicomNetworkAEJson from './dicomNetworkAE.json'
import {
  mapDicomInstance,
  mapDicomSeries,
  mapDicomStudy,
  MappedInstance,
} from './helper'
import { Dcm4cheeDevice, DcmWebApp, DicomNetworkAE } from './types/device'
import {
  DicomInstance,
  DicomSeries,
  DicomStudy,
  InstanceResponse,
  SeriesResponse,
  StudyResponse,
} from './types/study'

const DEFAULT_HOST = '137.184.181.70'
const DEFAULT_AET = 'DCM4CHEE'

export interface DicomFilter {
  PatientName?: string
  PatientID?: string
  AccessionNumber?: string
  StudyDate?: string
  Modality?: string
  fuzzymatching?: boolean
  orderby?: string
  orderdir?: 'asc' | 'desc'
  includefield?: string
}

export class Dcm4cheeService {
  private baseUrl: string
  private aet: string

  constructor(
    {
      host = DEFAULT_HOST,
      aet = DEFAULT_AET,
    }: {
      host?: string
      aet?: string
    } = {
      host: DEFAULT_HOST,
      aet: DEFAULT_AET,
    },
  ) {
    this.baseUrl = `http://${host}:8080/dcm4chee-arc`
    this.aet = aet
  }

  private getStudiesEndpoint(
    limit: number = 21,
    offset: number = 0,
    filters: DicomFilter = {},
  ): string {
    const params = new URLSearchParams()

    // Add pagination
    params.set('limit', limit.toString())
    params.set('offset', offset.toString())

    // Add includefield
    params.set('includefield', filters.includefield || 'all')

    // Add filters
    if (filters.PatientName) params.set('PatientName', filters.PatientName)
    if (filters.PatientID) params.set('PatientID', filters.PatientID)
    if (filters.AccessionNumber)
      params.set('AccessionNumber', filters.AccessionNumber)
    if (filters.StudyDate) params.set('StudyDate', filters.StudyDate)
    if (filters.Modality) params.set('Modality', filters.Modality)

    // Add fuzzy matching if specified
    if (filters.fuzzymatching) params.set('fuzzymatching', 'true')

    // Add sorting if specified
    if (filters.orderby)
      params.set(
        'orderby',
        (filters.orderdir || 'asc') === 'asc' ? '' : '-' + filters.orderby,
      )
    return `${this.baseUrl}/aets/${this.aet}/rs/studies?${params.toString()}`
  }

  private getDeviceEndpoint(deviceName: string = 'dcm4chee-arc'): string {
    return `${this.baseUrl}/devices/${deviceName}`
  }

  async pingService() {
    const response = await fetch(`${this.baseUrl}/ctrl/status`, {
      headers: {
        Accept: 'application/json',
      },
    })
    return response.ok
  }

  async getStudies(
    {
      limit = 10,
      offset = 0,
      filters = {},
    }: {
      limit?: number
      offset?: number
      filters?: DicomFilter
    } = {
      limit: 10,
      offset: 0,
      filters: {},
    },
  ): Promise<StudyResponse> {
    try {
      const response = await fetch(
        this.getStudiesEndpoint(limit, offset, filters),
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      if (response.statusText === 'No Content') {
        return {
          studies: [],
          total: 0,
          limit,
          offset,
        }
      }
      const studies = await response.json()

      return {
        studies: studies.map((study: DicomStudy) => mapDicomStudy(study)),
        total: studies.length,
        limit,
        offset,
      }
    } catch (error) {
      console.error('Error fetching studies:', error)
      throw error
    }
  }

  async getDeviceInfo(
    deviceName: string = 'dcm4chee-arc',
  ): Promise<Dcm4cheeDevice> {
    try {
      const response = await fetch(this.getDeviceEndpoint(deviceName))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching device info:', error)
      throw error
    }
  }

  async createAETitle(
    aetitle: string,
    description: string,
  ): Promise<Dcm4cheeDevice | { error: string }> {
    try {
      // Get current device info
      const deviceInfo = await this.getDeviceInfo()

      // Create new network AE
      const newNetworkAE = dicomNetworkAEJson
      newNetworkAE.dicomAETitle = aetitle
      newNetworkAE.dicomDescription = description
      newNetworkAE.dcmNetworkAE.dcmArchiveNetworkAE.dcmStoreAccessControlID =
        aetitle
      newNetworkAE.dcmNetworkAE.dcmArchiveNetworkAE.dcmAccessControlID = [
        aetitle,
      ]
      if (deviceInfo.dicomNetworkAE.some((ae) => ae.dicomAETitle === aetitle)) {
        return { error: 'AE title already exists' }
      }
      // Create new web app
      const newWebApp = dcmWebAppJson
      newWebApp.dcmWebAppName = aetitle
      newWebApp.dicomDescription = description
      newWebApp.dcmWebServicePath = `/dcm4chee-arc/aets/${aetitle}/rs`
      newWebApp.dicomAETitle = aetitle

      const newWebAppWado = dcmWebAppWadoJson
      newWebAppWado.dcmWebAppName = aetitle + '-wado'
      newWebAppWado.dicomDescription = description
      newWebAppWado.dcmWebServicePath = `/dcm4chee-arc/aets/${aetitle}/wado`
      newWebAppWado.dicomAETitle = aetitle

      // Update device info with new AE and web app
      deviceInfo.dicomNetworkAE.push(newNetworkAE as DicomNetworkAE)
      deviceInfo.dcmDevice.dcmWebApp.push(newWebApp as DcmWebApp)
      deviceInfo.dcmDevice.dcmWebApp.push(newWebAppWado as DcmWebApp)

      // Send PUT request to update device
      const response = await fetch(this.getDeviceEndpoint(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(deviceInfo),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Reload the service to apply changes
      await this.reload()

      // Get the updated device info to return
      return await this.getDeviceInfo()
    } catch (error) {
      console.error('Error creating AE title:', error)
      throw error
    }
  }

  async reload(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/ctrl/reload`, {
        method: 'POST',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {}
  }

  // Helper method to get a specific study by UID
  async getStudyByUIDWithSeriesAndInstances(studyUID: string) {
    try {
      // First, get the study details
      const studyResponse = await fetch(
        `${this.baseUrl}/aets/${this.aet}/rs/studies?StudyInstanceUID=${studyUID}&includefield=all`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!studyResponse.ok) {
        throw new Error(`Failed to fetch study: ${studyResponse.statusText}`)
      }

      const studyData: DicomStudy = await studyResponse.json()
      const mappedStudy = mapDicomStudy(studyData)

      // Then, get all series for this study
      const seriesResponse = await fetch(
        `${this.baseUrl}/aets/${this.aet}/rs/studies/${studyUID}/series?includefield=all`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!seriesResponse.ok) {
        throw new Error(`Failed to fetch series: ${seriesResponse.statusText}`)
      }
      const seriesData: DicomSeries[] = await seriesResponse.json()
      const mappedSeries = seriesData.map(mapDicomSeries)

      // Finally, get all instances for each series
      const instancesPromises = mappedSeries.map(async (series) => {
        const instancesResponse = await fetch(
          `${this.baseUrl}/aets/${this.aet}/rs/studies/${studyUID}/series/${series.seriesInstanceUID}/instances?includefield=all`,
          {
            headers: {
              Accept: 'application/json',
            },
          },
        )

        if (!instancesResponse.ok) {
          throw new Error(
            `Failed to fetch instances: ${instancesResponse.statusText}`,
          )
        }
        const instancesData: DicomInstance[] = await instancesResponse.json()
        return instancesData.map(mapDicomInstance)
      })

      const instancesResults = await Promise.all(instancesPromises)
      mappedSeries.forEach((series, index) => {
        series.instances = instancesResults[index]
      })
      mappedStudy.series = mappedSeries
      return mappedStudy
    } catch (error) {
      console.error('Error fetching study with series and instances:', error)
      throw error
    }
  }

  async getSeries(
    studyUID: string,
    {
      limit = 21,
      offset = 0,
    }: {
      limit?: number
      offset?: number
    } = {},
  ): Promise<SeriesResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/aets/${this.aet}/rs/studies/${studyUID}/series?limit=${limit}&includefield=all&offset=${offset}&orderby=SeriesNumber`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const series = await response.json()

      return {
        series,
        total: series.length,
        limit,
        offset,
      }
    } catch (error) {
      console.error('Error fetching series:', error)
      throw error
    }
  }

  async getInstances(
    studyUID: string,
    seriesUID: string,
    options: PaginationOptions = {},
  ): Promise<{
    instances: MappedInstance[]
    total: number
    limit: number
    offset: number
  }> {
    const { limit = 20, offset = 0 } = options

    const response = await fetch(
      `${this.baseUrl}/studies/${studyUID}/series/${seriesUID}/instances?limit=${limit}&offset=${offset}&includefield=all&orderby=InstanceNumber`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch instances: ${response.statusText}`)
    }

    const data: InstanceResponse = await response.json()
    return {
      instances: data.instances.map(mapDicomInstance),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    }
  }

  async uploadDicom(dicomFile: File): Promise<any> {
    const boundary = '6551438599173662' // same as in curl example
    const dicomArrayBuffer = await dicomFile.arrayBuffer()

    const headers = {
      Accept: 'application/dicom+json',
      'Content-Type': `multipart/related; type="application/dicom"; boundary=${boundary}`,
    }

    const preamble = `--${boundary}\r\nContent-Type: application/dicom\r\nContent-Disposition: form-data; name="file"; filename="${dicomFile.name}"\r\n\r\n`
    const postamble = `\r\n--${boundary}--`

    const encoder = new TextEncoder()
    const preambleBuffer = encoder.encode(preamble)
    const postambleBuffer = encoder.encode(postamble)

    // Concatenate all parts (preamble + dicom + postamble)
    const fullBody = new Uint8Array(
      preambleBuffer.byteLength +
        dicomArrayBuffer.byteLength +
        postambleBuffer.byteLength,
    )

    fullBody.set(preambleBuffer, 0)
    fullBody.set(new Uint8Array(dicomArrayBuffer), preambleBuffer.byteLength)
    fullBody.set(
      postambleBuffer,
      preambleBuffer.byteLength + dicomArrayBuffer.byteLength,
    )

    try {
      const res = await fetch(`${this.baseUrl}/aets/${this.aet}/rs/studies`, {
        method: 'POST',
        headers,
        body: fullBody,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error(`Failed to upload: `, res)
        return { error: errorText }
      }

      const result = await res.json()
      return result
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }

  // Add getter methods for baseUrl and aet
  getBaseUrl(): string {
    return this.baseUrl
  }

  getAET(): string {
    return this.aet
  }

  async uploadPdfToDicom(
    pdfFile: File,
    studyInstanceUID: string,
  ): Promise<any> {
    try {
      // Query the study using the studies endpoint with a filter instead of direct access
      const studyResponse = await fetch(
        `${this.baseUrl}/aets/${this.aet}/rs/studies?StudyInstanceUID=${studyInstanceUID}&includefield=all`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!studyResponse.ok) {
        throw new Error(`Failed to fetch study: ${studyResponse.statusText}`)
      }

      const studyData: DicomStudy[] = await studyResponse.json()

      if (!studyData || studyData.length === 0) {
        throw new Error(`Study with UID ${studyInstanceUID} not found`)
      }

      const study = studyData[0]

      // Create a deterministic series UID for PDF documents in this study

      // Create a deterministic series UID for PDF documents in this study
      // By using a hash of the study UID with a fixed suffix, we ensure all PDFs
      // for the same study share the same series
      const pdfSeriesHash = await hashString(
        studyInstanceUID + '-pdf-documents',
      )
      const pdfSeriesInstanceUID = `${studyInstanceUID}.${pdfSeriesHash}`

      // Create a unique SOP Instance UID for this specific PDF
      const sopInstanceUID = generateDicomUID()

      // Create a DICOM file from the PDF that's associated with the given study
      const dicomBlob = await convertPdfToDicomBlob(
        await pdfFile.arrayBuffer(),
        {
          studyInstanceUID,
          seriesInstanceUID: pdfSeriesInstanceUID,
          sopInstanceUID,
          filename: pdfFile.name,
          patientName: study['00100010']?.Value?.[0]?.Alphabetic,
          issuerOfPatientID: study['00100021']?.Value?.[0],
          patientID: study['00100020']?.Value?.[0],
          studyDate: study['00080020']?.Value?.[0],
          studyTime: study['00080030']?.Value?.[0],
          accessionNumber: study['00080050']?.Value?.[0],
          studyDescription: study['00081030']?.Value?.[0],
        },
      )

      // Upload the converted DICOM file
      const result = await this.uploadDicom(
        new File([dicomBlob], `${pdfFile.name}.dcm`, {
          type: 'application/dicom',
        }),
      )

      if (result && typeof result === 'object' && 'error' in result) {
        console.error('Upload error:', result.error)
        return result
      }

      return result
    } catch (error) {
      console.error('Error converting PDF to DICOM:', error)
      throw error
    }
  }
}

// Types for DICOM conversion
interface DicomConversionOptions {
  studyInstanceUID?: string
  seriesInstanceUID?: string
  sopInstanceUID?: string
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
async function convertPdfToDicomBlob(
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
  const sopInstanceUID = options.sopInstanceUID || generateDicomUID() // Always fresh
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
async function hashString(text: string): Promise<string> {
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

interface PaginationOptions {
  limit?: number
  offset?: number
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
