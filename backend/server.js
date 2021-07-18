import express from 'express'
import cors from 'cors'
import restaurants from './api/restaurants.route.js'

const app = express() // server

app.use(cors())
app.use(express.json()) // server can accept json as a part of the request

app.use('/api/v1/restaurants', restaurants) // route start with /api/v1/restaurants
app.use('*', (req, res) => res.status(404).json({ error: 'not found' }))

export default app
