import dcmWebAppJson from './dcmWebApp.json'
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

  private getStudiesEndpoint(limit: number = 21, offset: number = 0): string {
    return `${this.baseUrl}/aets/${this.aet}/rs/studies?limit=${limit}&includefield=all&offset=${offset}`
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
    }: {
      limit: number
      offset: number
    } = {
      limit: 10,
      offset: 0,
    },
  ): Promise<StudyResponse> {
    try {
      const response = await fetch(this.getStudiesEndpoint(limit, offset))

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

      // Update device info with new AE and web app
      deviceInfo.dicomNetworkAE.push(newNetworkAE as DicomNetworkAE)
      deviceInfo.dcmDevice.dcmWebApp.push(newWebApp as DcmWebApp)

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
      // const studyResponse = await fetch(
      //   `${this.baseUrl}/aets/${this.aet}/rs/studies`,
      //   {
      //     headers: {
      //       Accept: 'application/json',
      //     },
      //   },
      // )

      // if (!studyResponse.ok) {
      //   throw new Error(`Failed to fetch study: ${studyResponse.statusText}`)
      // }

      // const studyData: DicomStudy = await studyResponse.json()
      // const mappedStudy = mapDicomStudy(studyData)

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
      const allInstances = instancesResults.flat()

      return {
        // study: mappedStudy,
        series: mappedSeries,
        instances: allInstances,
      }
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
        throw new Error(
          `Failed to upload: ${res.status} ${res.statusText} - ${errorText}`,
        )
      }

      const result = await res.json()
      return result
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }
}

interface PaginationOptions {
  limit?: number
  offset?: number
}
