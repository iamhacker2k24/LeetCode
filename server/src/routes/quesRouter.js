const express = require("express");
const quesRouter = express.Router();
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid } = require("../controlers/QuesControllers");
const { userMiddleWare } = require("../middleWare/userMiddleWare");


quesRouter.post("/createques", createQues) //admin only 
quesRouter.post("/editques/:id", editQues) //admin only 
quesRouter.delete("/deleteques", deleteQues)  //admin only 





quesRouter.get("/getallques", userMiddleWare, getAllques) //only get all quesions
quesRouter.get("/getOneques/:id", getOneques) //only specific question details ok
quesRouter.get("/getquesbyslung/:slug", getOnequesBySlug) //only specific question details ok




//create test case  
quesRouter.post("/createtestCse", CreateTestCse);
quesRouter.post("/createtestcase", CreateTestCse);
quesRouter.put("/edittestcase/:id", editTestCase);
quesRouter.post("/edittestcase", editTestCase);
quesRouter.delete("/deletetestcase/:id", deleteTestCase);
quesRouter.delete("/deletetestcase", deleteTestCase);
quesRouter.get("/gettestcasebyid/:id", getTestCaseByid); //get testCase by question id 



//create code template
quesRouter.post("/createcodetemplate/:id", createCodeTemplate);
quesRouter.post("/createcodetemplate", createCodeTemplate);
quesRouter.put("/editcodetemplate/:id", editCodeTemplate);
quesRouter.delete("/deletecodetemplate/:id", deleteCodeTemplate);
quesRouter.get("/getcodetemplatebyid/:id", getCodeTemplateByid);





module.exports = { quesRouter }