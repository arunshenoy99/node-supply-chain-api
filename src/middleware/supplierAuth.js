const supplierAuth = (req, res, next) => {
    if (!req.user.supplier) {
        return res.status(400).send({ error: 'Not a supplier' })
    }
    next()
}

module.exports = supplierAuth