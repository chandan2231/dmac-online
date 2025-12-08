import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'
import xss from 'xss-clean'
import languageRoutes from './routes/language.js'
import questionarRoutes from './routes/questionar.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import googleAuth from './routes/googleAuth.js'
import expertRoutes from './routes/expert.js'
import theraistRoutes from './routes/therapist.js'
import patientRoutes from './routes/patient.js'

import researchRoutes from './routes/researchInfo.js'
import protocolRoutes from './routes/protocol.js'
import continuinReviewRoutes from './routes/continuinReview.js'
import eventAndRequest from './routes/eventAndRequest.js'
import communication from './routes/communication.js'
import payment from './routes/payment.js'
import externalMonitor from './routes/externalMonitor.js'
import reviewRoutes from './routes/reviews.js'

dotenv.config({ path: `.env`, override: true })
const app = express()

// Security Middlewares
app.use(helmet()) // Set security headers
app.use(hpp()) // Prevent HTTP Parameter Pollution
app.use(xss()) // Sanitize user input

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api', limiter)

// Body Parser & Cookie Parser
app.use(bodyParser.json({ limit: '10kb' })) // Limit body size
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }))
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// CORS Configuration
const allowedOrigins = ['http://18.220.202.114', 'http://localhost:3010']
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.use('/api/language', languageRoutes)
app.use('/api/questionar', questionarRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/google', googleAuth)
app.use('/api/expert', expertRoutes)
app.use('/api/therapist', theraistRoutes)
app.use('/api/patient', patientRoutes)

app.use('/api/researchInfo', researchRoutes)
app.use('/api/protocol', protocolRoutes)
app.use('/api/continuinReview', continuinReviewRoutes)
app.use('/api/eventAndRequest', eventAndRequest)
app.use('/api/communication', communication)
app.use('/api/payment', payment)
app.use('/api/externalMonitor', externalMonitor)
app.use('/api/reviews', reviewRoutes)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: 500,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// PORT setup based on environment
let PORT = 8010 // default dev port
if (process.env.NODE_ENV === 'localhost') PORT = 8800
if (process.env.NODE_ENV === 'production') PORT = 8000

// Listen on 0.0.0.0 so it is accessible from outside
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`)
})
