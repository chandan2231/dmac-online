import AWS from 'aws-sdk'
import fs from 'fs'
import 'dotenv/config'

const {
  STORAGE_ACCESS_SECRET,
  STORAGE_ACCESS_KEY,
  STORAGE_REGION,
  STORAGE_SPACE_NAME
} = process.env

const s3 = new AWS.S3({
  accessKeyId: STORAGE_ACCESS_KEY,
  secretAccessKey: STORAGE_ACCESS_SECRET,
  region: STORAGE_REGION
})

const bucketName = STORAGE_SPACE_NAME

export function uploadFile(filePath) {
  // Read the file as a buffer
  const fileContent = fs.readFileSync(filePath)

  // Set the parameters for S3 upload
  const params = {
    Bucket: bucketName,
    Key: filePath,
    Body: fileContent,
    ACL: 'public-read'
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const responseData = {
          ...data,
          filename: data.Key,
          cdnUrl: data.Location
        }

        // Example response
        // {
        //     ETag: '"0ece9e7b286ef9e4979400372c9a312c"',
        //     Location: 'https://sample.blr1.digitaloceanspaces.com/1723881366910-7525-logo.jpg',
        //     key: '1723881366910-7525-logo.jpg',
        //     Key: '1723881366910-7525-logo.jpg',
        //     filename: '1723881366910-7525-logo.jpg',
        //     Bucket: 'sample',
        //     cdnUrl: 'https://sample.blr1.cdn.digitaloceanspaces.com/1723881366910-7525-logo.jpg'
        //   }

        resolve(responseData)
      }
    })
  })
}

export function deleteFile(filePath) {
  const params = {
    Bucket: bucketName,
    Key: filePath
  }

  // Return a promise for better handling in the calling code
  return new Promise((resolve, reject) => {
    // Delete the file from the S3 bucket
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
