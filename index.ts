#! /usr/bin/env node
import { exec } from "child_process";

console.log("Made Solidity easy")

exec(`npx surya parse contract/test.sol --json true`, (error: any, stdout: string, stderr: any) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  let contractData = JSON.parse(stdout);
  console.log(contractData)
});
