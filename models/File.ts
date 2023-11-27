import fs from "fs";
export default class File {
  static createDir(dir: string) {
    var folder = dir;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder,{recursive: true});
    }
  }
  static getFilesFromDirectory(folder: string, extension: string) {
    let files: string[] = []
    fs.readdirSync(folder).forEach((file: string) => {
      let extPosition = file.lastIndexOf(".")
      if (extPosition >= 0 && file.substring(extPosition, file.length) == extension) {
        files.push(file);
      }
    });
    return files;
  }
  static fileExists(filePath: string) {
    return fs.existsSync(filePath);
  }
  static generateFile(filePath: string, content: any) {
    fs.writeFile(filePath, content, (err: any) => {
      if (err) {
        console.log('Error writing file', err)
      }
    })
  }
  static move(oldPath:string,newPath:string){
  fs.rename(oldPath, newPath, function (err: any) {
    if (err) throw err
    })
  }
}
