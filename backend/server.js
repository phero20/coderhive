require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/coderhive'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

mongoose
	.connect(MONGO_URI)
	.then(() => {
		console.log('Connected to MongoDB')
		app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err)
		process.exit(1)
	})
