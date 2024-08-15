#! /usr/bin/env node
import { exec } from "child_process";
import File from "./models/File";
import fs from "fs";
import { ethers } from "ethers";
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
    const ext = cliArgs[2]
    if(ext == "json"){
      let rawData = fs.readFileSync(`artifacts/contracts/${contractName}.sol/${contractName}.json`)
      let artifact = JSON.parse(rawData.toString())
      let contractInterface = new ethers.Interface(artifact.abi) 
      for(let i=0; i < contractInterface.fragments.length;i++){
        if(contractInterface.fragments[i].type != "constructor"){
          console.log(`${contractInterface.fragments[i].format()}:${ethers.id(contractInterface.fragments[i].format()).substring(0,10)}`)
        }
      }
    }else if(ext == "sol"){
      let contractContent = fs.readFileSync(`contracts/${contractName}.sol`,'utf-8')
      let open = false
      let openStruct = false
      let functions: string[] = []
      let structs: string[] = []
      let functionItem: string = ""
      let structItem: string = ""
      let specialTypes: {[key: string]:string} = {}
      contractContent.split(/r?\n/).forEach((line:string)=>{
        if(line.indexOf("struct") > -1){
          openStruct = true
          structItem += line
        }else if(openStruct == true){
          structItem += line
        }
        if(structItem.indexOf("struct ") > -1 && structItem.indexOf("}") > -1){
          structs.push(structItem)
        }
        if(openStruct == true && structItem.indexOf("}") > -1){
          structItem = ""
          openStruct = false
        }
        if(line.indexOf("function")>-1){
          open = true
          functionItem += line
        }else if(open == true){
          functionItem += line
        }
        if(functionItem.indexOf("function") > -1 && functionItem.indexOf(")") > -1){
          functions.push(functionItem)
        }
        if(open && line.indexOf(")") > -1){
          functionItem = ""
          open = false
        }
      })
      for(let s=0; s < structs.length;s++){
        const structBracket = structs[s].split("{")
        const structName = structBracket[0].replace("struct","").replaceAll(" ","")
        const structPropertiesRaw = structBracket[1].replace("}","").split(";")
        let structAsTuple = "("
        for(let p=0; p < structPropertiesRaw.length; p++){
          let wsRegex = /^\s+/g
          let structPropertyType = structPropertiesRaw[p].replace(wsRegex,"")
          structPropertyType = structPropertyType.slice(0,structPropertyType.indexOf(" "))
          structAsTuple += `${structPropertyType},`
        }
        structAsTuple = `${structAsTuple.substring(0,structAsTuple.length-2)})`
        specialTypes[structName] = structAsTuple 
      }
      for(let f=0; f < functions.length;f++){
        const functionRaw = functions[f].split("(")
        const functionName = functionRaw[0].replace("function","").replaceAll(" ","")
        const functionParamsRaw = functionRaw[1].replace(")","").split(",")
        let functionParams = "("
        for(let p=0; p < functionParamsRaw.length; p++){
          let wsRegex = /^\s+/g
          let functionParamType = functionParamsRaw[p].replace(wsRegex,"")
          functionParamType = functionParamType.slice(0,functionParamType.indexOf(" "))
          if(Object.keys(specialTypes).indexOf(functionParamType) > -1){
            functionParams += `${specialTypes[functionParamType]},`
          }else{
            functionParams += `${functionParamType},`
          }
        }
        functionParams = `${functionParams.substring(0,functionParams.length-1)})`
        const functionVerbSig = `${functionName}${functionParams}`
        console.log(`${functionVerbSig}: ${ethers.id(functionVerbSig).substring(0,10)}`)
      }
    }else{
      console.log("Invalid extension valid ones are json and sol")
    }
  },
  genIFn: ()=>{
    const contractName = cliArgs[1]
    const specialTypesCalldata = ["string"]
    const specialTypesMemory = ["bytes","bytes[]"]
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
          if(contractABI[i].type == "function"){
            if(specialTypesMemory.indexOf(parameters[p].type) > -1){
              fnInterfaces += ` memory`
            }else if(specialTypesCalldata.indexOf(parameters[p].type) > -1 
            || parameters[p].type.indexOf("[]") > -1){
              fnInterfaces += ` calldata`
            }
          }
          
          if(parameters[p]?.name?.length > 0){
            fnInterfaces += ` ${parameters[p].name}`
          }
          if(p < parameters.length-1){
            fnInterfaces += `, `
          }
        }
        let stateMutability = ""
        if(contractABI[i]?.stateMutability != null
           && contractABI[i]?.stateMutability != "nonpayable"){
          stateMutability = " "+contractABI[i].stateMutability 
        }
        fnInterfaces += `)` 
        if(contractABI[i].type == "function"){
          fnInterfaces += ` external${stateMutability}` 
        }
        const outputs = contractABI[i].outputs
        if(outputs?.length > 0){
        fnInterfaces += ` returns (`
        for(let o=0; o < outputs?.length; o++){
          fnInterfaces += `${outputs[o].type}`
          if(specialTypesCalldata.indexOf(outputs[o].type) > -1 || outputs[o].type.indexOf("[]") > -1 ){
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
        fnInterfaces += `;`
        if(i < contractABI.length-1){
          fnInterfaces += `\n`
        }
      }
    }
    console.log(fnInterfaces)
  }
}

cliFunctions[cliArgs[0]]();
