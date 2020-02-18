const express = require('express')
const Item = require('../models/item')
const auth = require('../middleware/auth')
const Warehouse = require('../models/warehouse')
const Transaction = require('../models/transaction')

const router = new express.Router()

//Create a new item
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

//Get the item barcode
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

//Search for an item
router.get('/items', async (req, res) => {
    try {
        const itemKeys = Object.keys(req.query)
        itemKeys.forEach((itemKey) => {
            req.query[itemKey] = req.query[itemKey].toLowerCase()
        })
        const items = await Item.find(req.query)
        if (items.length === 0) {
            return res.status(404).send()
        }
        res.send(items)
    } catch (e) {
        res.status(400).send()
    }
})

//Checkout from cart
router.post('/items/checkout', auth, async (req, res) => {
    try {
        req.body.forEach(async (reqItem) => {
            const item = await Item.findOne(reqItem)
            if (!item) {
                return res.status(404).send()
            }
            if (item.quantity == 0) {
                return res.status(400).send()
            }
            if (reqItem.quantity) {
                item.quantity = item.quantity - reqItem.quantity
            } else {
                reqItem.quantity = 1
                item.quantity = item.quantity -1
            }
            const warehouse = await Warehouse.findById(item.locatedAt)
            const warehouseJSON = warehouse.toJSON()
            const locatedAt = warehouseJSON.location
            const transaction = new Transaction({
                item: item._id,
                buyer: req.user._id,
                status: 'Order recieved',
                locatedAt,
                quantity: reqItem.quantity
            }) 
            await item.save()
            await transaction.save()
            res.status(200).send()
        })
    } catch (e) {
        res.status(400).send()
    } 
})

//Track purchased items
router.get('/items/me', auth, async (req, res) => {
    try {
        await req.user.populate({
            path: 'items'
        }).execPopulate()
        res.send(req.user.items)
    } catch (e) {
        res.status(500).send()
    }
})

//Cancel an order
router.post('/items/me/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
        if (transaction.status == "Cancelled") {
            return res.send(transaction)
        }
        const item = await Item.findById(transaction.item)
        item.quantity = item.quantity + transaction.quantity
        transaction.status = "Cancelled"
        await transaction.save()
        await item.save()
        res.send(transaction)
    } catch (e) {
        res.status(400).send()
    }
})

module.exports = router