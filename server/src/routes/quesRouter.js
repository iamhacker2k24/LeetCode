
const express = require("express");
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug } = require("../controlers/QuesControllers");
const quesRouter = express.Router();

quesRouter.post("/createques", createQues)
quesRouter.post("/editques/:id", editQues)
quesRouter.delete("/deleteques", deleteQues)
quesRouter.get("/getallques", getAllques) //only get all quesions
quesRouter.get("/getOneques/:id", getOneques) //only specific question details ok
quesRouter.get("/getquesbyslung/:slug", getOnequesBySlug) //only specific question details ok



module.exports = { quesRouter }