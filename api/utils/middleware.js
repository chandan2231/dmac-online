import multer from 'multer'
import jwt from 'jsonwebtoken'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'public/images')
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e3)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

export const upload = multer({ storage })

// Middleware to protect routes
export const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization']

  if (!token)
    return res
      .status(404)
      .json({ message: 'Access denied. No token provided.' })

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(404).json({ message: 'Invalid or expired token.' })

    req.user = user
    next()
  })
}
