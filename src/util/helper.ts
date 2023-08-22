import path from "path";
import * as fs from "fs";

export default class Helper {
  static createFolder(folder: string): string {
    const directory = path.join(process.cwd(), folder);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory);
    }
    return directory;
  }
}
