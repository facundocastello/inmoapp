export interface Dcm4cheeDevice {
  dicomDeviceName: string
  dicomManufacturer: string
  dicomManufacturerModelName: string
  dicomSoftwareVersion: string[]
  dicomPrimaryDeviceType: string[]
  dicomVendorData: boolean
  dicomInstalled: boolean
  dicomNetworkConnection: DicomNetworkConnection[]
  dicomNetworkAE: DicomNetworkAE[]
  dcmDevice: DcmDevice
}

export interface DicomNetworkConnection {
  cn: string
  dicomHostname: string
  dicomPort?: number
  dicomTLSCipherSuite?: string[]
  dcmNetworkConnection: {
    dcmProtocol?: string
    dcmTCPConnectTimeout?: number
    dcmResponseTimeout?: number
    dcmIdleTimeout?: number
    dcmBindAddress?: string
    dcmClientBindAddress?: string
    [key: string]: any
  }
}

export interface DicomNetworkAE {
  dicomAETitle: string
  dicomDescription: string
  dicomAssociationInitiator: boolean
  dicomAssociationAcceptor: boolean
  dicomNetworkConnectionReference: string[]
  dicomTransferCapability: DicomTransferCapability[]
  dcmNetworkAE: {
    dcmArchiveNetworkAE: DcmArchiveNetworkAE
  }
}

export interface DcmDevice {
  dcmTrustStoreURL?: string
  dcmTrustStoreType?: string
  dcmTrustStorePin?: string
  dcmKeyStoreURL?: string
  dcmKeyStoreType?: string
  dcmKeyStorePin?: string
  dcmKeyStoreKeyPin?: string
  dcmWebApp: DcmWebApp[]
  dcmAuditLogger?: any[]
  hl7Application?: any[]
  dcmArchiveDevice: DcmArchiveDevice
}

export interface DcmWebApp {
  dcmWebAppName: string
  dicomDescription: string
  dcmWebServicePath: string
  dcmWebServiceClass: string[]
  dicomAETitle?: string
  dcmProperty?: string[]
  dicomNetworkConnectionReference: string[]
}

export interface DcmArchiveDevice {
  dcmFuzzyAlgorithmClass?: string
  dcmBulkDataDescriptorID?: string
  dcmDeleteUPSPollingInterval?: string
  dcmDeleteUPSCompletedDelay?: string
  dcmDeleteUPSCanceledDelay?: string
  dcmOverwritePolicy?: string
  dcmHideSPSWithStatusFromMWL?: string[]
  dcmHideSPSWithStatusFromMWLRS?: string[]
  dcmQidoMaxNumberOfResults?: number
  dcmStorage?: DcmStorage[]
  [key: string]: any // For other optional fields
}

export interface DcmStorage {
  dcmStorageID: string
  dcmURI: string
  dcmStoragePathFormat?: string
  dcmCheckMountFilePath?: string
  dcmDigestAlgorithm?: string
}

export interface DicomTransferCapability {
  cn: string
  dicomSOPClass: string
  dicomTransferRole: 'SCP' | 'SCU'
  dicomTransferSyntax: string[]
  dcmTransferCapability?: {
    dcmRelationalQueries?: boolean
    dcmCombinedDateTimeMatching?: boolean
    dcmFuzzySemanticMatching?: boolean
    dcmTimezoneQueryAdjustment?: boolean
  }
}

export interface DcmArchiveNetworkAE {
  dcmObjectStorageID?: string[]
  dcmStoreAccessControlID?: string
  dcmAccessControlID?: string[]
  dcmQueryRetrieveViewID: string
  dcmExportRule: any[]
  dcmExportPriorsRule: any[]
  dcmMPPSForwardRule: any[]
  dcmArchiveCompressionRule: any[]
  dcmStoreAccessControlIDRule: any[]
  dcmArchiveAttributeCoercion: any[]
  dcmArchiveAttributeCoercion2: DcmArchiveAttributeCoercion2[]
  dcmStudyRetentionPolicy: any[]
  dcmRSForwardRule: any[]
  dcmUPSOnStore: any[]
  dcmUPSOnUPSCompleted: any[]
}

export interface DcmArchiveAttributeCoercion2 {
  cn: string
  dcmDIMSE: string
  dicomTransferRole: string
  dcmProperty?: string[]
  dcmURI: string
  dcmMergeAttribute?: string[]
  dcmSOPClass?: string[]
}
