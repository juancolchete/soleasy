"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class File {
    static createDir(dir) {
        var folder = dir;
        if (!fs_1.default.existsSync(folder)) {
            fs_1.default.mkdirSync(folder, { recursive: true });
        }
    }
    static getFilesFromDirectory(folder, extension) {
        let files = [];
        fs_1.default.readdirSync(folder).forEach((file) => {
            let extPosition = file.lastIndexOf(".");
            if (extPosition >= 0 && file.substring(extPosition, file.length) == extension) {
                files.push(file);
            }
        });
        return files;
    }
    static fileExists(filePath) {
        return fs_1.default.existsSync(filePath);
    }
    static generateFile(filePath, content) {
        fs_1.default.writeFile(filePath, content, (err) => {
            if (err) {
                console.log('Error writing file', err);
            }
        });
    }
    static move(oldPath, newPath) {
        fs_1.default.rename(oldPath, newPath, function (err) {
            if (err)
                throw err;
        });
    }
}
exports.default = File;
