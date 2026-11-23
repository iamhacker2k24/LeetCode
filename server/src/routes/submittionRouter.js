const express = require("express");
const { runQues, runQuesWithTestCase, subMitques, likeQues, isStar } = require("../controlers/queSubmition");
const { userMiddleWare } = require("../middleWare/userMiddleWare");
const submittionRouter = express.Router();



submittionRouter.post("/runques/:id", userMiddleWare, runQues) //default test case 
submittionRouter.post("/runquesWithtestCase/:id", userMiddleWare, runQuesWithTestCase) //test case given by user 
submittionRouter.post("/submitques/:id", userMiddleWare, subMitques)
submittionRouter.post("/likeques/:id", userMiddleWare, likeQues)
submittionRouter.get("/isstar/:id", userMiddleWare, isStar)



module.exports = { submittionRouter }
