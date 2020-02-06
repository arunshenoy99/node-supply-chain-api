const Warehouse = require('../models/warehouse')
const moment = require('moment')

const warehousesValidity = async (user, format) => {
    if (!format) {
        format = 'days'
    }
    const dueDates = []
    const warehouses = await Warehouse.find({ owner: user._id })
    if (warehouses.length == 0) {
        throw new Error('You do not own any warehouses')
    }
    warehouses.forEach((warehouse) => {
        if (warehouse.leasePeriod) {
            const dueDate = { name: warehouse.name, validity:moment(warehouse.leasePeriod).diff(moment(), format), leaseExpired: false  }
            if (dueDate.validity < 0) {
                dueDate.leaseExpired = true
            }
            dueDates.push(dueDate)
        }
    })
    return dueDates
}

module.exports = warehousesValidity