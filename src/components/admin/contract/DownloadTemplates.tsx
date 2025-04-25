'use client'

import { ContractTemplate } from '@prisma/client'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { ContractWithRelations } from '@/lib/actions/tenant/contract'
import { useToast } from '@/lib/hooks/useToast'
import { replaceTemplateVariables } from '@/lib/utils/contract-template'
export default function DownloadTemplates({
  contractName,
  templates,
  contract,
}: {
  contractName: string
  templates: ContractTemplate[]
  contract: ContractWithRelations
}) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const generatePDF = async (template: ContractTemplate) => {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div')
    tempDiv.style.width = '210mm' // A4 width
    tempDiv.style.padding = '20mm'
    tempDiv.style.backgroundColor = '#ffffff'
    tempDiv.style.color = '#000000'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12pt'
    tempDiv.style.lineHeight = '1.5'
    console.log(replaceTemplateVariables(template.template, contract))
    // Add content
    const content = document.createElement('div')
    content.innerHTML =
      replaceTemplateVariables(template.template, contract) || ''
    content.style.whiteSpace = 'pre-wrap'
    tempDiv.appendChild(content)

    document.body.appendChild(tempDiv)

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16,
    })

    // Calculate content height
    const contentHeight = tempDiv.scrollHeight
    const pageHeight = 1123 // A4 height in pixels at 96 DPI
    const numPages = Math.ceil(contentHeight / pageHeight)

    // Split content into pages
    for (let i = 0; i < numPages; i++) {
      if (i > 0) {
        pdf.addPage()
      }

      // Create a canvas for each page
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: pageHeight,
        y: i * pageHeight,
        height: pageHeight,
        scrollY: i * pageHeight,
      })

      // Add the image to PDF
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight,
      )
    }

    // Clean up
    document.body.removeChild(tempDiv)

    return pdf.output('blob')
  }

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true)

      if (templates.length === 1) {
        // Single file - download directly
        const pdfBlob = await generatePDF(templates[0])
        const url = window.URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${contractName}-${templates[0].name}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // Multiple files - create zip
        const zip = new JSZip()

        for (const template of templates) {
          const pdfBlob = await generatePDF(template)
          zip.file(`${contractName}-${template.name}.pdf`, pdfBlob)
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = window.URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${contractName}-contracts.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      showToast(
        `Contract${templates.length > 1 ? 's' : ''} downloaded successfully`,
        'success',
      )
    } catch (error) {
      showToast('Failed to download contract', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDownloadPDF} disabled={isLoading}>
      {isLoading
        ? 'Downloading...'
        : `Download Contract${templates.length > 1 ? 's' : ''}`}
    </Button>
  )
}
