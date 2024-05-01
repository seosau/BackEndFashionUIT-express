const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cart.controller");

router.post("/add", cartController.store);
router.delete("/remove", cartController.delete);
router.put("/updateQuantity", cartController.updateQuantity);
router.get("/get", cartController.index);
router.delete("/destroy", cartController.deleteAll)
router.delete('/delete-many', cartController.deleteMany)
module.exports = router;
