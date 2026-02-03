import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import languageRoutes from './routes/language.js'
import questionarRoutes from './routes/questionar.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import googleAuth from './routes/googleAuth.js'
import expertRoutes from './routes/expert.js'
import theraistRoutes from './routes/therapist.js'
import patientRoutes from './routes/patient.js'
import payment from './routes/payment.js'
import reviewRoutes from './routes/reviews.js'
import consentRoutes from './routes/consent.js'
import countryAdminRoutes from './routes/countryAdmin.js'
import partnerRoutes from './routes/partner.js'
import partnerPortalRoutes from './routes/partnerPortal.js'

dotenv.config({ path: `.env`, override: true })
const app = express()

// middlewares
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.use(cookieParser())

const allowedOrigins = ['https://dev.retainmemory.com', 'http://localhost:3010'] // add localhost for dev
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

app.use('/api/language', languageRoutes)
app.use('/api/questionar', questionarRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/country-admin', countryAdminRoutes)
app.use('/api/google', googleAuth)
app.use('/api/expert', expertRoutes)
app.use('/api/therapist', theraistRoutes)
app.use('/api/patient', patientRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payment', payment)
app.use('/api/consent', consentRoutes)
app.use('/api/partner', partnerRoutes)
app.use('/api/partner-portal', partnerPortalRoutes)

// PORT setup based on environment
let PORT = 8010 // default dev port
if (process.env.NODE_ENV === 'localhost') PORT = 8800
if (process.env.NODE_ENV === 'production') PORT = 8000

// Listen on 0.0.0.0 so it is accessible from outside
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API running on port ${PORT}`)
})
