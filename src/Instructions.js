const {readdirSync, readFileSync} = require("fs");
const {join} = require("path");

class Instructions {

  #instructionList = [];
  #path = join(__dirname, "messages", "instructions");

  constructor() {
    readdirSync(this.#path, {withFileTypes: true}).forEach(file => {
      this.#instructionList.push(readFileSync(join(this.#path, file.name)).toString());
    });
  }

  getInstructionMessage(chatId) {
    return this.#instructionList[chatId % this.#instructionList.length];
  }
}

module.exports = Instructions;
