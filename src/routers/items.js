const express = require('express')
const Item = require('../models/item')
const auth = require('../middleware/auth')
const Warehouse = require('../models/warehouse')

const router = new express.Router()

router.post('/items', auth, async (req, res) => {
    if (!req.user.supplier) {
        return res.status(400).send()
    }
    const item = new Item(req.body)
    try {
        const warehouse = await Warehouse.findOne({ name: req.body.locatedAt, owner: req.user._id })
        if (!warehouse) {
            return res.status(404).send()
        }
        item.locatedAt = warehouse._id
        const existingItem = await Item.findOne({ name: item.name, category: item.category, locatedAt: item.locatedAt })
        if (existingItem) {
            existingItem.quantity += item.quantity
            await existingItem.save()
            return res.status(200).send(existingItem)
        }
        item.barcode = await item.generateBarCode()
        await item.save()
        res.status(201).send(item)
    } catch (e) {
        res.status(400).send()
    }
})

router.get('/items/:id/barcode', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
        if (!item) {
            return res.status(404).send()
        }
        res.setHeader('Content-Type', 'image/png')
        res.send(item.barcode)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router