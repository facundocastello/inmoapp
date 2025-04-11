import { MappedStudy } from '../helper'

export interface DicomValue {
  vr: string
  Value?: any[]
}

export interface DicomStudy {
  '00080005': DicomValue // Specific Character Set
  '00080020': DicomValue // Study Date
  '00080030': DicomValue // Study Time
  '00080050': DicomValue // Accession Number
  '00080054': DicomValue // Retrieve AE Title
  '00080056': DicomValue // Instance Availability
  '00080061': DicomValue // Modality
  '00080062': DicomValue // SOP Class UID
  '00081030': DicomValue // Study Description
  '00081190': DicomValue // URL
  '00100010': DicomValue // Patient's Name
  '00100020': DicomValue // Patient ID
  '00100021': DicomValue // Issuer of Patient ID
  '00100030': DicomValue // Patient's Birth Date
  '00100040': DicomValue // Patient's Sex
  '0020000D': DicomValue // Study Instance UID
  '00200010': DicomValue // Study ID
  '00201200': DicomValue // Number of Patient Related Studies
  '00201206': DicomValue // Number of Study Related Series
  '00201208': DicomValue // Number of Study Related Instances
  '77770010': DicomValue // Archive Name
  '77771010': DicomValue // Created Time
  '77771011': DicomValue // Updated Time
  '77771020': DicomValue // Archived Time
  '77771021': DicomValue // Archived Time
  '77771022': DicomValue // Archived Time
  '77771027': DicomValue // Archive AE Title
  '77771028': DicomValue // Storage ID
  '77771029': DicomValue // Storage Size
  '7777102A': DicomValue // Storage Status
  '7777102D': DicomValue // Archived Time
}

export interface DicomSeries {
  '00080054': { vr: string; Value: string[] } // RetrieveAETitle
  '00080056': { vr: string; Value: string[] } // InstanceAvailability
  '00080060': { vr: string; Value: string[] } // Modality
  '00080061': { vr: string; Value: string[] } // ModalitiesInStudy
  '00080062': { vr: string; Value: string[] } // SOPClassUID
  '00081190': { vr: string; Value: string[] } // URL
  '00083002': { vr: string; Value: string[] } // TransferSyntaxUID
  '00100010': { vr: string; Value: { Alphabetic: string }[] } // PatientName
  '00100020': { vr: string; Value: string[] } // PatientID
  '00100021': { vr: string; Value: string[] } // IssuerOfPatientID
  '0020000D': { vr: string; Value: string[] } // StudyInstanceUID
  '0020000E': { vr: string; Value: string[] } // SeriesInstanceUID
  '00201200': { vr: string; Value: string[] } // NumberOfPatientRelatedStudies
  '00201206': { vr: string; Value: string[] } // NumberOfStudyRelatedSeries
  '00201208': { vr: string; Value: string[] } // NumberOfStudyRelatedInstances
  '00201209': { vr: string; Value: string[] } // NumberOfSeriesRelatedInstances
  '77770010': { vr: string; Value: string[] } // ArchiveName
  '77771010': { vr: string; Value: string[] } // CreatedTime
  '77771011': { vr: string; Value: string[] } // UpdatedTime
  '77771020': { vr: string; Value: string[] } // ArchivedTime
  '77771021': { vr: string; Value: string[] } // RetrievedTime
  '77771022': { vr: string; Value: string[] } // StoredTime
  '77771027': { vr: string; Value: string[] } // ArchiveAETitle
  '77771028': { vr: string; Value: string[] } // StorageID
  '77771029': { vr: string; Value: number[] } // StorageSize
  '7777102A': { vr: string; Value: number[] } // StorageStatus
  '7777102D': { vr: string; Value: string[] } // ArchivedTime
  '77771030': { vr: string; Value: string[] } // RetrievedTime
  '77771031': { vr: string; Value: string[] } // StoredTime
  '77771068': { vr: string; Value: string[] } // RetrieveAETitle
  '77771069': { vr: string; Value: string[] } // RetrieveURL
  '7777106A': { vr: string; Value: string[] } // RetrieveURL
  '7777106F': { vr: string; Value: string[] } // RetrievedTime
}

export interface StudyResponse {
  studies: MappedStudy[]
  total: number
  limit: number
  offset: number
}

export interface SeriesResponse {
  series: DicomSeries[]
  total: number
  limit: number
  offset: number
}

export interface DicomInstance {
  '00080005': { vr: string; Value: string[] } // Specific Character Set
  '00080008': { vr: string; Value: string[] } // Image Type
  '00080016': { vr: string; Value: string[] } // SOP Class UID
  '00080018': { vr: string; Value: string[] } // SOP Instance UID
  '00080020': { vr: string; Value: string[] } // Study Date
  '00080030': { vr: string; Value: string[] } // Study Time
  '00080050': { vr: string; Value?: string[] } // Accession Number
  '00080054': { vr: string; Value: string[] } // Retrieve AE Title
  '00080056': { vr: string; Value: string[] } // Instance Availability
  '00080060': { vr: string; Value: string[] } // Modality
  '00080061': { vr: string; Value: string[] } // Modalities in Study
  '00080062': { vr: string; Value: string[] } // SOP Class UID
  '00080070': { vr: string; Value?: string[] } // Manufacturer
  '00080080': { vr: string; Value: string[] } // Institution Name
  '00080081': { vr: string; Value?: string[] } // Institution Address
  '00080090': { vr: string; Value?: string[] } // Referring Physician's Name
  '00081030': { vr: string; Value?: string[] } // Study Description
  '00081050': { vr: string; Value?: string[] } // Performing Physician's Name
  '00081190': { vr: string; Value: string[] } // URL
  '00083002': { vr: string; Value: string[] } // Transfer Syntax UID
  '00100010': { vr: string; Value: { Alphabetic: string }[] } // Patient's Name
  '00100020': { vr: string; Value: string[] } // Patient ID
  '00100021': { vr: string; Value: string[] } // Issuer of Patient ID
  '00100030': { vr: string; Value?: string[] } // Patient's Birth Date
  '00100040': { vr: string; Value: string[] } // Patient's Sex
  '0020000D': { vr: string; Value: string[] } // Study Instance UID
  '0020000E': { vr: string; Value: string[] } // Series Instance UID
  '00200010': { vr: string; Value: string[] } // Study ID
  '00200011': { vr: string; Value: string[] } // Series Number
  '00200013': { vr: string; Value: string[] } // Instance Number
  '00201200': { vr: string; Value: string[] } // Number of Patient Related Studies
  '00201206': { vr: string; Value: string[] } // Number of Study Related Series
  '00201208': { vr: string; Value: string[] } // Number of Study Related Instances
  '00201209': { vr: string; Value: string[] } // Number of Series Related Instances
  '00280008': { vr: string; Value: string[] } // Number of Frames
  '00280010': { vr: string; Value: number[] } // Rows
  '00280011': { vr: string; Value: number[] } // Columns
  '00280100': { vr: string; Value: number[] } // Bits Allocated
  '77770010': { vr: string; Value: string[] } // Archive Name
  '77771010': { vr: string; Value: string[] } // Created Time
  '77771011': { vr: string; Value: string[] } // Updated Time
  '77771020': { vr: string; Value: string[] } // Archived Time
  '77771021': { vr: string; Value: string[] } // Retrieved Time
  '77771022': { vr: string; Value: string[] } // Stored Time
  '77771027': { vr: string; Value: string[] } // Archive AE Title
  '77771028': { vr: string; Value: string[] } // Storage ID
  '77771029': { vr: string; Value: number[] } // Storage Size
  '7777102A': { vr: string; Value: number[] } // Storage Status
  '7777102D': { vr: string; Value: string[] } // Archived Time
  '77771030': { vr: string; Value: string[] } // Retrieved Time
  '77771031': { vr: string; Value: string[] } // Stored Time
  '77771040': { vr: string; Value: string[] } // Archived Time
  '77771041': { vr: string; Value: string[] } // Retrieved Time
  '77771050': { vr: string; Value: string[] } // Archive Name
  '77771051': { vr: string; Value: string[] } // Archive Description
  '77771052': { vr: string; Value: string[] } // Archive UID
  '77771053': { vr: string; Value: number[] } // Archive Size
  '77771054': { vr: string; Value: string[] } // Archive Status
  '77771068': { vr: string; Value: string[] } // Retrieve AE Title
  '77771069': { vr: string; Value: string[] } // Retrieve URL
  '7777106A': { vr: string; Value: string[] } // Retrieve URL
  '7777106F': { vr: string; Value: string[] } // Retrieved Time
}

export interface InstanceResponse {
  offset: number
  limit: number
  total: number
  instances: DicomInstance[]
}
