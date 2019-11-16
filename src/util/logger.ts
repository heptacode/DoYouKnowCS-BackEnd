import * as chalk from "chalk";
import * as moment from "moment";
import "moment-timezone";
moment.tz.setDefault("Asia/Seoul");

class logger {
  public getTsp(): string {
    return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  }
  // Error
  public e(str: string) {
    console.log(`[${this.getTsp()}] ${chalk.red(str)}`);
  }
  // Warning
  public w(str: string) {
    console.log(`[${this.getTsp()}] ${chalk.yellow(str)}`);
  }
  // Info
  public i(str: string) {
    console.log(`[${this.getTsp()}] ${chalk.cyan(str)}`);
  }
  // Success
  public s(str: string) {
    console.log(`[${this.getTsp()}] ${chalk.green(str)}`);
  }
  // Verbose
  public v(str: string) {
    console.log(`[${this.getTsp()}] ${chalk.white(str)}`);
  }
  // Custom
  public c(obj: object) {
    let str = ``;
    Object.keys(obj).forEach(key => {
      if (key == "e") str += `${chalk.red(obj[key])} `;
      else if (key == "w") str += `${chalk.yellow(obj[key])} `;
      else if (key == "i") str += `${chalk.cyan(obj[key])} `;
      else if (key == "s") str += `${chalk.green(obj[key])} `;
      else if (key == "v") str += `${chalk.white(obj[key])} `;
    });
    console.log(`[${this.getTsp()}] ${str}`);
  }
}
export default new logger();
