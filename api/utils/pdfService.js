import html_to_pdf from 'html-pdf-node'
import fs from 'fs'
import path from 'path'

export async function generatePdfBufferFromHTML(file, customOptions = {}) {
  let options = {
    format: 'A4',
    margin: {
      top: '40px',
      bottom: '60px',
      left: '40px',
      right: '40px'
    },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    ...customOptions
  }
  return await html_to_pdf.generatePdf(file, options)
}

export async function generatePdfFromHTML(file, protocolId, protocolType, customOptions = {}) {
  let pdfBuffer = await generatePdfBufferFromHTML(file, customOptions)
  let directoryPath = path.join('public', 'pdf')
  let formattedProtocolType = protocolType.toLowerCase().replace(/\s+/g, '_')
  let timestamp = Date.now()
  let fileName = `${formattedProtocolType}_${protocolId}_${timestamp}.pdf`
  let filePath = path.join(directoryPath, fileName)
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true })
  }
  await new Promise((resolve, reject) => {
    fs.writeFile(filePath, pdfBuffer, (err) => {
      if (err) {
        console.log(err)
        return reject(err)
      }
      console.log('PDF saved to ' + filePath)
      resolve()
    })
  })

  return filePath
}