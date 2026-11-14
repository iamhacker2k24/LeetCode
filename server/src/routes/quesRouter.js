
const express = require("express");
const { createQues, editQues, deleteQues } = require("../controlers/QuesControllers");
const quesRouter = express.Router();

quesRouter.post("/createques", createQues)
quesRouter.post("/editques", editQues)
quesRouter.post("/deleteques", deleteQues)

module.exports = { quesRouter }