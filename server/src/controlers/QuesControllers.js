const codeTemplateSchema = require("../model/CodeTemplateschema");
const Question = require("../model/createQues");
const counter = require("../model/quesIdcounter");
const testCase = require("../model/testCase");
const testCaseCounter = require("../model/testCaseCounter");

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


const editQues = async (req, res) => {  // this will works on based on slung ok 
    try {
        const { slug } = req.body
        const UpdateStatus = await Question.findOneAndUpdate({ slug },
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
        console.error("ques error ", error.message);
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
            return res.status(404).json({
                success: false,
                message: "question not found "
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


const CreateTestCse = async (req, res) => {
    try {
        // Support either a single test case object or an array of test cases ({ testCases: [...] } or [...])
        const rawItems = Array.isArray(req.body)
            ? req.body
            : (Array.isArray(req.body.testCases) ? req.body.testCases : [req.body]);

        if (!rawItems || rawItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No test case data provided"
            });
        }

        const createdTestCases = [];

        for (const item of rawItems) {
            const { questionId, questionSlug, input, expectedOutput, explanation, isHidden, isSample } = item;

            if (!input || expectedOutput === undefined || expectedOutput === null) {
                return res.status(400).json({
                    success: false,
                    message: "Input and expectedOutput are required for each test case"
                });
            }

            // Find question to ensure it exists and get questionId + slug
            let ques = null;
            if (questionId !== undefined && questionId !== null && !isNaN(Number(questionId))) {
                ques = await Question.findOne({ questionId: Number(questionId) });
            } else if (questionSlug) {
                ques = await Question.findOne({ slug: questionSlug.trim().toLowerCase() });
            }

            if (!ques) {
                return res.status(404).json({
                    success: false,
                    message: `Question with id ${questionId || questionSlug} not found`
                });
            }

            // Generate auto-incrementing testCaseId using testCaseCounter
            const counterDoc = await testCaseCounter.findOneAndUpdate(
                { name: "testCaseId" },
                { $inc: { sequence: 1 } },
                { new: true, upsert: true }
            );
            const testCaseId = counterDoc.sequence;

            // Auto-calculate order if not provided
            let order = item.order;
            if (!order || isNaN(Number(order))) {
                const currentCount = await testCase.countDocuments({ questionId: ques.questionId });
                order = currentCount + 1;
            }

            const isHiddenVal = Boolean(isHidden);
            const isSampleVal = isSample !== undefined ? Boolean(isSample) : !isHiddenVal;

            const newTc = await testCase.create({
                testCaseId,
                questionId: ques.questionId,
                questionSlug: ques.slug,
                order: Number(order),
                input: String(input).trim(),
                expectedOutput: String(expectedOutput).trim(),
                explanation: explanation ? String(explanation).trim() : "",
                isHidden: isHiddenVal,
                isSample: isSampleVal
            });

            createdTestCases.push(newTc);
        }

        return res.status(201).json({
            success: true,
            message: createdTestCases.length === 1
                ? "Test case created successfully"
                : `${createdTestCases.length} test cases created successfully`,
            data: createdTestCases.length === 1 ? createdTestCases[0] : createdTestCases
        });

    } catch (error) {
        console.error("CreateTestCse Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error creating test case: ${error.message}`
        });
    }
};

const editTestCase = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.body.testCaseId || req.body._id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test case ID is required"
            });
        }

        const query = !isNaN(Number(id))
            ? { testCaseId: Number(id) }
            : { _id: id };

        const allowedFields = ["input", "expectedOutput", "explanation", "order", "isHidden", "isSample"];
        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const updated = await testCase.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Test case not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Test case updated successfully",
            data: updated
        });

    } catch (error) {
        console.error("editTestCase Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error updating test case: ${error.message}`
        });
    }
};

const deleteTestCase = async (req, res) => {
    try {
        const id = req.params.id
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Test case ID is required"
            });
        }

        const query = !isNaN(Number(id))
            ? { testCaseId: Number(id) }
            : { _id: id };

        const deleted = await testCase.findOneAndDelete(query);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Test case not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Test case deleted successfully"
        });

    } catch (error) {
        console.error("deleteTestCase Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error deleting test case: ${error.message}`
        });
    }
};

const getTestCaseByid = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        const query = !isNaN(numericId)
            ? { questionId: numericId }
            : { questionSlug: id.toLowerCase().trim() };

        // Support ?all=true to fetch all test cases (for judging/admin), default to samples
        const filter = { ...query };
        if (req.query.all !== "true") {
            filter.isSample = true;
        }

        const data = await testCase.find(filter).sort({ order: 1 });
        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No test cases found for this question",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error("getTestCaseByid Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const createCodeTemplate = async (req, res) => {
    try {
        const id = req.params.id
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "A valid numeric questionId is required"
            });
        }

        const questionId = Number(id);

        // Verify the question exists
        const ques = await Question.findOne({ questionId });
        if (!ques) {
            return res.status(404).json({
                success: false,
                message: `Question with id ${questionId} not found`
            });
        }

        // Extract templates with clean fallback defaults matching client expectations
        const python = req.body.python || req.body.pythonTemplate || "class Solution:\n    def solve(self, input):\n        pass";
        const cpp = req.body.cpp || req.body.cppTemplate || "class Solution {\npublic:\n    void solve() {\n        \n    }\n};";
        const java = req.body.java || req.body.javaTemplate || "class Solution {\n    public void solve() {\n        \n    }\n};";
        const C = req.body.C || req.body.c || req.body.cTemplate || "void solve() {\n    \n}";

        // Upsert to handle both creation and re-saving
        const template = await codeTemplateSchema.findOneAndUpdate(
            { questionId },
            {
                $set: {
                    questionId,
                    python,
                    cpp,
                    java,
                    C
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(201).json({
            success: true,
            message: "Code template created successfully",
            data: template
        });

    } catch (error) {
        console.error("createCodeTemplate Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error creating code template: ${error.message}`
        });
    }
};

const editCodeTemplate = async (req, res) => {
    try {
        const id = req.params.id || req.body.questionId || req.body.id;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "A valid numeric questionId is required"
            });
        }

        const questionId = Number(id);
        const updateFields = {};

        if (req.body.python || req.body.pythonTemplate) updateFields.python = req.body.python || req.body.pythonTemplate;
        if (req.body.cpp || req.body.cppTemplate) updateFields.cpp = req.body.cpp || req.body.cppTemplate;
        if (req.body.java || req.body.javaTemplate) updateFields.java = req.body.java || req.body.javaTemplate;
        if (req.body.C || req.body.c || req.body.cTemplate) updateFields.C = req.body.C || req.body.c || req.body.cTemplate;

        const updated = await codeTemplateSchema.findOneAndUpdate(
            { questionId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: `Code template for question #${questionId} not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Code template updated successfully",
            data: updated
        });

    } catch (error) {
        console.error("editCodeTemplate Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error updating code template: ${error.message}`
        });
    }
};

const deleteCodeTemplate = async (req, res) => {
    try {
        const id = req.params.id || req.body.questionId || req.body.id;
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "A valid numeric questionId is required"
            });
        }

        const questionId = Number(id);
        const deleted = await codeTemplateSchema.findOneAndDelete({ questionId });
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: `Code template for question #${questionId} not found`
            });
        }

        return res.status(200).json({
            success: true,
            message: "Code template deleted successfully"
        });

    } catch (error) {
        console.error("deleteCodeTemplate Error:", error);
        return res.status(500).json({
            success: false,
            message: `Error deleting code template: ${error.message}`
        });
    }
};

const getCodeTemplateByid = async (req, res) => {
    try {
        const { id } = req.params;
        let questionId = Number(id);

        // If a slug was passed instead of numeric id, resolve it
        if (isNaN(questionId)) {
            const ques = await Question.findOne({ slug: id.toLowerCase().trim() });
            if (ques) {
                questionId = ques.questionId;
            }
        }

        const data = await codeTemplateSchema.findOne({ questionId });
        if (!data) {
            return res.status(404).json({
                success: false,
                message: `Code template for question #${id} not found`
            });
        }

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("getCodeTemplateByid Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};




module.exports = {
    createQues, editQues, deleteQues, getAllques, getOneques, getOnequesBySlug,
    CreateTestCse, editTestCase, deleteTestCase, getTestCaseByid, createCodeTemplate,
    editCodeTemplate, deleteCodeTemplate, getCodeTemplateByid
}