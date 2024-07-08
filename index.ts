#! /usr/bin/env node
import { exec } from "child_process";
import File from "./models/File";
import fs from "fs";
const cliArgs = process.argv.slice(2)

function splitStringOnCapital(inputString: string): string[] {
  return inputString.split(/(?=[A-Z])/);
}

const cliFunctions: any = {
  genABI: () => {
    const contracts = File.getFilesFromDirectory("./artifacts/contracts/", ".sol")
    let rawSoleasy = fs.readFileSync(`./soleasy.json`)
    let soleasy = JSON.parse(rawSoleasy.toString())
    for (let s = 0; s < soleasy.length; s++) {
      let contractsAbis: { [key: string]: any } = {}
      for (let i = 0; i < contracts.length; i++) {
        const contractName = contracts[i].substring(0, contracts[i].length - 4)
        if (soleasy[s].contracts.indexOf(contractName) > -1) {
          let rawData = fs.readFileSync(`./artifacts/contracts/${contractName}.sol/${contractName}.json`)
          let contractData = JSON.parse(rawData.toString())
          contractsAbis[soleasy[s].abiName[soleasy[s].contracts.indexOf(contractName)]] = contractData.abi
        }
      }
      File.createDir("./out")
      File.generateFile(`./out/${soleasy[s].name}.json`, JSON.stringify(contractsAbis, null, 2))
    }
  },
  genABIAll: () => {
    const contracts = File.getFilesFromDirectory("./artifacts/contracts/", ".sol")
    let contractsAbis: { [key: string]: any } = {}
    for (let i = 0; i < contracts.length; i++) {
      const contractName = contracts[i].substring(0, contracts[i].length - 4)
      console.log(contractName)
      let rawData = fs.readFileSync(`./artifacts/contracts/${contractName}.sol/${contractName}.json`)
      let contractData = JSON.parse(rawData.toString())
      let contractNameFormated = splitStringOnCapital(contractName).join("_").toUpperCase()
      contractsAbis[`${contractNameFormated}_ABI`] = contractData.abi
    }
    File.createDir("./out")
    File.generateFile("./out/contracts.json", JSON.stringify(contractsAbis, null, 2))
  },
  compile: () => {
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
  },
  genSigs: () =>{
    const contractName = cliArgs[1]
    const dataType = cliArgs?.[2]
    let rawData = fs.readFileSync(`artifacts/contracts/${contractName}.sol/${contractName}.dbg.json`)
    let buildDataPath = JSON.parse(rawData.toString())
    let rawBuildData = fs.readFileSync(`artifacts/${buildDataPath.buildInfo.slice(6, buildDataPath.buildInfo.length)}`)
    const buildData = JSON.parse(rawBuildData.toString())
    let output = buildData.output.contracts[`contracts/${contractName}.sol`][contractName]
    if(dataType?.toLowerCase() == "json"){
      console.log(output.evm.methodIdentifiers)
    }else{
      const fnSigs = output.evm.methodIdentifiers
      const fnSigsKeys = Object.keys(fnSigs)
      const fnSigsValues = Object.values(fnSigs)
      let textFnSigs = ""
      for(let i=0;i<fnSigsKeys.length;i++){
        textFnSigs += `${fnSigsKeys[i]}: ${fnSigsValues[i]}${i < fnSigsKeys.length -1 ? "\n" : ""}`
      }
      console.log(textFnSigs)
    }
  }
}

cliFunctions[cliArgs[0]]();
