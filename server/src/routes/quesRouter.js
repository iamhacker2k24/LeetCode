const express = require("express");
const quesRouter = express.Router();
const { CheckRole } = require("../middleWare/checkRole")
const { createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid } = require("../controlers/QuesControllers");


quesRouter.post("/createques", CheckRole("admin"), createQues) //admin only 
quesRouter.post("/editques/:id", CheckRole("admin"), editQues) //admin only 
quesRouter.delete("/deleteques", CheckRole("admin"), deleteQues)  //admin only 





quesRouter.get("/getallques", CheckRole("user"), getAllques) //only get all quesions
quesRouter.get("/getOneques/:id", CheckRole("user"), getOneques) //only specific question details ok
quesRouter.get("/getquesbyslung/:slug", CheckRole("user"), getOnequesBySlug) //only specific question details ok




//create test case  
quesRouter.post("/createtestCse", CheckRole("admin"), CreateTestCse);
quesRouter.post("/createtestcase", CheckRole("admin"), CreateTestCse);
quesRouter.put("/edittestcase/:id", CheckRole("admin"), editTestCase);
quesRouter.post("/edittestcase", CheckRole("admin"), editTestCase);
quesRouter.delete("/deletetestcase/:id", CheckRole("admin"), deleteTestCase);
quesRouter.delete("/deletetestcase", CheckRole("admin"), deleteTestCase);
quesRouter.get("/gettestcasebyid/:id", CheckRole("admin"), getTestCaseByid); //get testCase by question id 



//create code template
quesRouter.post("/createcodetemplate/:id", CheckRole("admin"), createCodeTemplate);
quesRouter.post("/createcodetemplate", CheckRole("admin"), createCodeTemplate);
quesRouter.put("/editcodetemplate/:id", CheckRole("admin"), editCodeTemplate);
quesRouter.delete("/deletecodetemplate/:id", CheckRole("admin"), deleteCodeTemplate);
quesRouter.get("/getcodetemplatebyid/:id", CheckRole("admin"), getCodeTemplateByid);





module.exports = { quesRouter }