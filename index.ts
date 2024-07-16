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
  },
  genIFn: ()=>{
    const contractName = cliArgs[1]
    const specialTypes = ["string","bytes","bytes32"]
    let rawData = fs.readFileSync(`artifacts/contracts/${contractName}.sol/${contractName}.json`)
    let data = JSON.parse(rawData.toString())
    const contractABI = data.abi;
    let fnInterfaces = ""
    for(let i=0; i < contractABI.length; i++){
      if(contractABI[i]?.name){
        fnInterfaces += `${contractABI[i].type} ${contractABI[i].name}(`
        const parameters = contractABI[i].inputs
        for(let p=0; p < parameters?.length; p++){
          fnInterfaces += `${parameters[p].type}`  
          if(specialTypes.indexOf(parameters[p].type) > -1 || parameters[p].type.indexOf("[]") > -1 ){
            fnInterfaces += ` calldata`
          }
          
          if(parameters[p]?.name?.length > 0){
            fnInterfaces += ` ${parameters[p].name}`
          }
          if(p < parameters.length-1){
            fnInterfaces += `, `
          }
        }
        let stateMutability = ""
        if(contractABI[i]?.stateMutability != "nonpayable"){
          stateMutability = contractABI[i].stateMutability 
        }
        fnInterfaces += `) external ${stateMutability}` 
        const outputs = contractABI[i].outputs
        if(outputs?.length > 0){
        fnInterfaces += ` returns (`
        for(let o=0; o < outputs?.length; o++){
          fnInterfaces += `${outputs[o].type}`
          if(specialTypes.indexOf(outputs[o].type) > -1 || outputs[o].type.indexOf("[]") > -1 ){
            fnInterfaces += ` memory`
          }
          if(outputs[o]?.name?.length > 0){
            fnInterfaces += ` ${outputs[o].name}`
          }
          if(o < outputs.length-1){
            fnInterfaces += `, `
          }
        }
        fnInterfaces += `)`

        }
        if(i < contractABI.length-1){
          fnInterfaces += `\n`
        }
      }
    }
    console.log(fnInterfaces)
  }
}

cliFunctions[cliArgs[0]]();
