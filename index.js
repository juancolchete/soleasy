#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
console.log("Made Solidity easy");
(0, child_process_1.exec)(`npx surya parse contract/test.sol --json true`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    let contractData = JSON.parse(stdout);
    console.log(contractData);
});
