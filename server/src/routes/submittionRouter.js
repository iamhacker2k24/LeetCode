const express = require("express");
const { subMitques, runQues, runQuesWithTestCase, likeQues, isStar } = require("../controlers/queSubmition");
const submittionRouter = express.Router();






submittionRouter.post("/submitques", subMitques)




module.exports = { submittionRouter }
