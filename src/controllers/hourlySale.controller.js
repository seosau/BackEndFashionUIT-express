const hourlySale = require('../models/hourlySale.model')

class HourlySale {
    async index(req, res, next) {
        try {
            const {day} = req.params;

            const hourlySales = await hourlySale.find({ saleDay: new Date(day) });
            res.status(200).json(hourlySales);
        }
        catch (error) {
            res.status(500).json({ error: "Đã có lỗi xảy ra" });
        }
    }

    async store(req, res, next) {
        try {
            const { productId, saleHour, saleDay, discountPercent } = req.body;

            const existedSale = await hourlySale.findOne({ productId, saleHour, saleDay: new Date(saleDay) })
            if (existedSale) {
                return res.status(400).json({error: "Đã tồn tại"})
            }
            const newSale = await new hourlySale({ productId: productId, saleHour, saleDay: new Date(saleDay), discountPercent })
            
            newSale
                .save()
                .then(() => {
                    console.log("Tạo sản phẩm thành công");
                    res.status(201).json({ success: "Tạo sản phẩm thành công" });
                })
                .catch((err) => {
                    console.error("Lỗi khi tạo sản phẩm:", err);
                    res.status(500).json({ error: "Đã xảy ra lỗi khi tạo sản phẩm" });
                })
        }
        catch (error) {
            res.status(500).json({ error: "Đã có lỗi xảy ra" });
        }
    }

    async delete(req, res, next) {
        try {
            
        }
        catch (error) {
            res.status(500).json({ error: "Đã có lỗi xảy ra" });
        }
    }
}

module.exports = new HourlySale();