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
