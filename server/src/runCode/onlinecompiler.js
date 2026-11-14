import { OnlineCompiler } from 'onlinecompiler';

const client = new OnlineCompiler(); // reads ONLINECOMPILER_API_KEY

const result = await client.run({
    compiler: 'python-3.14',
    code: 'name = input()\nprint(f"Hello, {name}!")',
    input: 'World',
});
console.log(result.output); // Hello, World!

const judged = await client.runTests({
    compiler: 'python-3.14',
    code: 'a, b = map(int, input().split())\nprint(a + b)',
    tests: [
        { input: '1 2', expected_output: '3' },
        { input: '10 20', expected_output: '30', hidden: true },
    ],
});
console.log(judged.verdict, judged.score); // accepted 100