const express = require('express')
const Warehouse = require('../models/warehouse')
const auth = require('../middleware/auth')
const supplierAuth = require('../middleware/supplierAuth')
const geocode = require('../utils/geocode')
const wareHousesValidity = require('../utils/warehousesValidity')

const router = new express.Router()

//Create a new warehouse for a supplier
router.post('/warehouses', auth, supplierAuth, async (req, res) => {
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

//Get all the warehouses of authenticated supplier
router.get('/warehouses', auth, supplierAuth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'warehouses'
        }).execPopulate()
        res.send(req.user.warehouses)
    } catch (e) {
        res.status(500).send()
    }
})

//Check validate of all warehouses of authenticated supplier
router.get('/warehouses/validity', auth, supplierAuth, async (req, res) => {
    try {
        const dueDates = await wareHousesValidity(req.user, req.query.format)
        res.send(dueDates)
    } catch (e) {
        res.status(500).send()
    }
})

//Delete a particular warehouse by id
router.delete('/warehouses/:id', auth, supplierAuth, async (req, res) => {
    try {
        const warehouse = await Warehouse.findByIdAndDelete(req.params.id)
        if (!warehouse) {
            return res.status(404).send()
        }
        res.status(200).send()
    } catch (e) {
        res.status(400).send()
    }
})

//Modify certain attributes of the warehouse
router.patch('/warehouses/:id', auth, supplierAuth, async (req, res) => {
    const allowedUpdates = ['name', 'size', 'leasePeriod', 'rent', 'owner']
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidUpdate) {
        return res.status(400).send()
    }
    try {
        const warehouse = await Warehouse.findById(req.params.id)
        updates.forEach((update) => {
            warehouse[update] = req.body[update]
        })
        await warehouse.save()
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router