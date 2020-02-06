const express = require('express')
const Item = require('../models/item')
const auth = require('../middleware/auth')
const Warehouse = require('../models/warehouse')

const router = new express.Router()

router.post('/items', auth, async (req, res) => {
    const item = new Item(req.body)
    try {
        const warehouse = await Warehouse.findOne({name: req.body.locatedAt})
        if (!warehouse) {
            return res.status(404).send()
        }
        item.locatedAt = warehouse._id
        const existingItem = await Item.findOne({ name: item.name, category: item.category, locatedAt: item.locatedAt })
        if (existingItem) {
            existingItem.quantity += item.quantity
            console.log(existingItem)
            await existingItem.save()
            return res.status(200).send(existingItem)
        }
        item.barcode = await item.generateBarCode()
        await item.save()
        res.status(201).send({ item })
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router