import express from 'express'
import authRoutes from './routes/auth.js'
import researchRoutes from './routes/researchInfo.js'
import protocolRoutes from './routes/protocol.js'
import continuinReviewRoutes from './routes/continuinReview.js'
import adminRoutes from './routes/admin.js'
import eventAndRequest from './routes/eventAndRequest.js'
import communication from './routes/communication.js'
import payment from './routes/payment.js'
import externalMonitor from './routes/externalMonitor.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'

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
if (process.env.NODE_ENV === 'localhost') {
  app.use(cors({ origin: 'http://localhost:3010' }))
} else if (process.env.NODE_ENV === 'development') {
  const allowedOrigins = ['https://dev.irbhub.org']
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false
  }
  app.use(cors({ origin: ['https://dev.irbhub.org'] }))
  app.use(cors(corsOptions))
} else {
  const allowedOrigins = ['https://app.irbhub.org']
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false
  }
  app.use(cors({ origin: ['https://app.irbhub.org'] }))
  app.use(cors(corsOptions))
}

app.use('/api/auth', authRoutes)
app.use('/api/researchInfo', researchRoutes)
app.use('/api/protocol', protocolRoutes)
app.use('/api/continuinReview', continuinReviewRoutes)
app.use('/api/eventAndRequest', eventAndRequest)
app.use('/api/communication', communication)
app.use('/api/admin', adminRoutes)
app.use('/api/payment', payment)
app.use('/api/externalMonitor', externalMonitor)

if (process.env.NODE_ENV === 'localhost') {
  app.listen(8800, () => {
    console.log('API Working!')
  })
} else if (process.env.NODE_ENV === 'development') {
  app.listen(8010, () => {
    console.log('Dev API Working!')
  })
} else {
  app.listen(8000, () => {
    console.log('Dev API Working!')
  })
}
