const express = require('express')
const Warehouse = require('../models/warehouse')
const auth = require('../middleware/auth')
const geocode = require('../utils/geocode')

const router = new express.Router()

router.post('/warehouses', auth, async (req, res) => {
    geocode(req.body.location, async (error, data) => {
        if (error) {
            throw error
        }
        const warehouse = new Warehouse(req.body)
        warehouse.location.latitude = data.latitude
        warehouse.location.longitude = data.longitude
        warehouse.owner = req.user._id
        await warehouse.save((error) => {
            res.status(400).send()
        })
        res.status(201).send()
    })
})

router.get('/warehouses', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'warehouses'
        }).execPopulate()
        res.send(req.user.warehouses)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router