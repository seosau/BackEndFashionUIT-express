const locationModel = require('../models/location.model');

class LocationController {
    async getLocation(req, res, next) {
        try {
            const location = await locationModel.find();
            
            if (location.length === 0) {
                res.status(404).json({ message: 'Không tìm thấy địa điểm nào.' });
            } else {
                res.status(200).json(location);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new LocationController();