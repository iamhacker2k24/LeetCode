
const { OnlineCompiler } = require("onlinecompiler")

const client = new OnlineCompiler({
    apiKey: process.env.ONLINECOMPILER_API_KEY
}); // reads ONLINECOMPILER_API_KEY


const main = async () => {
    const judged = await client.runTests({
        compiler: 'python-3.14',
        code: 'a, b = map(int, input().split())\nprint(a + b)',
        tests: [
            { input: '1 2', expected_output: '3' },
            { input: '10 20', expected_output: '40', hidden: true },
        ],
    });
    console.log(judged); // accepted 100
}

module.exports = main;
main();