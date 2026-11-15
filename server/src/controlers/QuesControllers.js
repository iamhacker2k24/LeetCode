const codeTemplateSchema = require("../model/CodeTemplateschema");
const Question = require("../model/createQues");
const counter = require("../model/quesIdcounter");
const testCase = require("../model/testCase");

const createQues = async (req, res) => {
    try {
        const {
            title,
            slug,
            description,
            difficulty,
            topics,
            constraints,
            examples,
            companies,
            hints,
            isPremium
        } = req.body;

        //find last question id 

        const result = await counter.findOneAndUpdate(
            { name: "questionId" },
            { $inc: { sequence: 1 } },
            {
                new: true,
                upsert: true
            }
        );

        const questionId = result.sequence;

        if (!title || !description || !difficulty) {
            return res.status(400).json({
                success: false,
                message: " title, description and difficulty are required"
            });
        }
        // Check duplicate slug
        if (slug) {
            const existingQuestion = await Question.findOne({ slug });
            if (existingQuestion) {
                return res.status(409).json({
                    success: false,
                    message: "Question already exists"
                });
            }
        }
        // Create question
        const question = await Question.create({
            questionId,
            title,
            slug: slug.trim().toLowerCase(),
            description,
            difficulty,
            topics,
            constraints,
            examples,
            companies,
            hints,
            isPremium
        });

        return res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: question
        });
    } catch (error) {
        console.error("Create Question Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const editQues = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const UpdateStatus = await Question.findByIdAndUpdate(id,
            { $set: req.body },
            {
                new: true,
                runValidators: true
            }
        )

        return res.status(200).json({
            success: true,
            UpdateStatus
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


const deleteQues = async (req, res) => {
    try {
        const { quesSlug } = req.body;
        // console.log(quesSlug)

        const data = await Question.findOneAndDelete({ slug: quesSlug.trim().toLowerCase() })
        // console.log(data)
        if (!data) {
            return res.status(200).json({
                success: true,
                message: "wrong slung"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Question delted successfully"
        });
    } catch (error) {
        console.error("delete Question Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}


const getAllques = async (req, res) => {
    try {
        const allQues = await Question.find({}).select("title isPremium _id questionId slug difficulty");
        return res.status(200).json({
            success: true,
            data: allQues
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const getOneques = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(typeof Number(id))
        const data = await Question.findOne({ questionId: Number(id) })
        if (!data) {
            console.log(data)
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}
const getOnequesBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        console.log(slug)
        const data = await Question.findOne({ slug }).select("-questionId");
        if (!data) {
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


const CreateTestCse = (req, res) => {
    try {

    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


const editTestCase = (req, res) => {
    try {

    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}
const deleteTestCase = (req, res) => {
    try {

    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}
const getTestCaseByid = async (req, res) => {
    try {
        const { id } = req.params
        const data = await testCase.find({ questionId: Number(id), isSample: true }).select("-_id -testCaseId -order ")
        if (!data) {
            return res.status(400).json({
                success: false,
                message: "question id wrong"
            });
        }
        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}

const createCodeTemplate = (req, res) => {
    try {
        const { id } = req.parms;


    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

}



const editCodeTemplate = (req, res) => {
    try {

    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}

const deleteCodeTemplate = (req, res) => {
    try {

    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}

const getCodeTemplateByid = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const data = await codeTemplateSchema.findOne({ questionId: Number(id) });
        if (!data) {
            return res.status(400).json({
                success: false,
                message: "question id wrong"
            });
        }
        return res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("getAll ques error ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}




module.exports = {
    createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid
}