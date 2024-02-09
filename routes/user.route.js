const express = require('express');
const { addUser, addStation, addTrain, getAllStations, getWallet, addWalletBalance, purchaseTicket, planningRoutes } = require('../controllers/user.controller');
const router = express.Router();


router.post("/users", addUser);
router.post("/stations", addStation)
router.post("/trains", addTrain)
router.get("/stations", getAllStations)
router.get("/wallets/:user_id", getWallet)
router.put("/wallets/:user_id", addWalletBalance)
router.post("/tickets", purchaseTicket)
router.get("/routes", planningRoutes)



module.exports = router