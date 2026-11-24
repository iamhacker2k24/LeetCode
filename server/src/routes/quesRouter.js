const express = require("express");
const quesRouter = express.Router();
const { CheckRole } = require("../middleWare/checkRole")
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid } = require("../controlers/QuesControllers");
const { middleWare } = require("../middleWare/middleWare");

quesRouter.post("/createques", middleWare, CheckRole("admin", "owner"), createQues);
quesRouter.post("/editques/:id", middleWare, CheckRole("admin", "owner"), editQues);
quesRouter.delete("/deleteques", middleWare, CheckRole("admin", "owner"), deleteQues);



quesRouter.get("/getallques", getAllques);
quesRouter.get("/getOneques/:id", getOneques);
quesRouter.get("/getquesbyslung/:slug", getOnequesBySlug);
quesRouter.get("/gettestcasebyid/:id", getTestCaseByid);
quesRouter.get("/getcodetemplatebyid/:id", getCodeTemplateByid);


//create test case  
quesRouter.post("/createtestCse", middleWare, CheckRole("admin", "owner"), CreateTestCse);
quesRouter.put("/edittestcase/:id", middleWare, CheckRole("admin", "owner"), editTestCase);
quesRouter.delete("/deletetestcase/:id", middleWare, CheckRole("admin", "owner"), deleteTestCase);


//create code template
quesRouter.post("/createcodetemplate/:id", middleWare, CheckRole("admin", "owner"), createCodeTemplate);
quesRouter.put("/editcodetemplate/:id", middleWare, CheckRole("admin", "owner"), editCodeTemplate);
quesRouter.delete("/deletecodetemplate/:id", middleWare, CheckRole("admin", "owner"), deleteCodeTemplate);


module.exports = { quesRouter }