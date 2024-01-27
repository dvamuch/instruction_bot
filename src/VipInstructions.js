const {readdirSync, readFileSync} = require("fs");
const {join} = require("path");

class VipInstructions {

  #vipCodesToFiles = {
    "INDIA": "instruction1.txt",
    "CRAZY": "instruction2.txt",
    "LUCKY": "instruction3.txt",
    "APPLE": "instruction4.txt",
    "ORANGE": "instruction5.txt",
  };
  #instructionMap = new Map();
  #path = join(__dirname, "messages", "vip_instructions");

  constructor() {
    for (let vipCode in this.#vipCodesToFiles) {
      const vipCodeFile = this.#vipCodesToFiles[vipCode];
      this.#instructionMap.set(vipCode, readFileSync(join(this.#path, vipCodeFile)).toString());
    }
  }

  getVipInstructionMessage(vipCode) {
    return this.#instructionMap.get(vipCode);
  }
}

module.exports = VipInstructions;
