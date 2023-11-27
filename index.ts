#! /usr/bin/env node
import { exec } from "child_process";
import File from "./models/File";

const cliFunctions:any = {
  genABI: ()=>{
    console.log(File.getFilesFromDirectory("./artifacts/contracts/",".sol"))
  },
  compile: ()=>{
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
    }
}

const cliArgs = process.argv.slice(2)
cliFunctions[cliArgs[0]]();
