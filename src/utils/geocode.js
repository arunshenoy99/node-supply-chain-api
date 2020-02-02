const request = require('request')

const geocode = (address, cb) => {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=' + process.env.MAPBOX_ACCESS_TOKEN
    request({ url, json: true }, (error, { body }) => {
        if (error) {
            cb(new Error('Unable to connect to geolocation service'), undefined)
        } else if (body.features.length === 0) {
            cb(new Error('Unable to find given location'), undefined)
        } else {
            cb(undefined, {
                latitude: body.features[0].center[1],
                longitude: body.features[0].center[0]
            })
        }
    })
}

module.exports = geocode