
## Getting started
Install soleasy globaly to use in any projects
`npm install -g soleasy`
or Install it locally 
`npm install soleasy`

The tutorial will explain running globally but if you want to run it locally just use **npx** before **soleasy** like:
`npx soleasy
## Basic commands

## genABI
If your project uses [hardhat](https://www.npmjs.com/package/hardhat), after compile you can use genABI to get specific ABIs, on `soleasy.json` file in the root of your project. as the following example:
```json
[
  {
    "name": "file",
    "contracts": ["StateMutability","Lock"],
    "abiName": ["STATE_MUTABILITY_ABI","LOCK_ABI"]
  },
  {
    "name": "file2",
    "contracts":["HelloWorld","FurnitureDegen"],
    "abiName":["HELLO_WORLD_ABI","FURNITURE_DEGEN_ABI"]
  }
]
```

This will generate `file.json` and `file2.json` on `out` directory in the root of your project, with the contracts `StateMutability` and `Lock` in the first file with these respective properties `STATE_MUTABILITY_ABI` and `LOCK_ABI`, and with the contracts `HelloWorld` and `FurnitureDegen`in the second file  with these respective properties `HELLO_WORLD_ABI`and `FURNITURE_DEGEN_ABI`.
## genABIAll
If your project uses [hardhat](https://www.npmjs.com/package/hardhat), after compile you can use genABIAll to get all ABIs of your compile contracts, and save in a file called `contracts.json` in the `out` in your project root.
## compile
`soleasy compile`
Will compile using [surya](https://www.npmjs.com/package/surya) and parse to JSON.
## More about the development
[Video with developement process](https://www.youtube.com/playlist?list=PLbWtSW17vSe7a6ZPTghUbSJZM8rijBprr)
