const TelegramBot = require("node-telegram-bot-api");
const Instructions = require("./Instructions");
const VipInstructions = require("./VipInstructions");

class Bot {
  #bot;

  #executeInput = "✅Запустить✅";
  #helpInput = "❓Помощь";
  #infoInput = "📋Инфо";
  #inviteInput = "👤Пригласить друга";

  #projectName = process.env.PROJECT_NAME;
  #siteUrl = process.env.SITE_URL;
  #helpAccountUsername = process.env.HELP_ACCOUNT_USERNAME;
  #botUsername = process.env.TG_BOT_USERNAME;

  #helloText = `${this.#projectName} - новейшая платформа, созданная внутри Telegram, для анализа и получения 100% инструкций. Выполнение данных инструкций даст вам гарантированный доход от 5000 рублей в день. 

Важно! Перед началом работы следует ознакомиться с видео, нажав на кнопку «Инфо». В случае возникновения вопросов пишите мне по кнопке «Помощь».`;

  #executeTextStage1 = `⌛️Запущен поиск инструкции...`;
  #executeTextStage2 = `⚙️Анализ полученной информации...`;
  #executeTextStage3 = `♻️Запуск процесса инициализации алгоритма...`;
  #executeTextStage4 = `⚜️Аналитика завершена`;
  #executeTextFinish = `Инструкция найдена ✅`;

  #instructions;
  #vipInstructions;

  #helpText = `Аккаунт поддержки: @${this.#helpAccountUsername}`;
  #helpReplyMarkup = {
    reply_markup: {
      inline_keyboard: [[{text: "Написать поддержке", url: `https://t.me/${this.#helpAccountUsername}`}]],
    },
  };

  #infoText = `Обязательно ознакомьтесь с подробной инструкцией по работе с ботом, посмотрев видео ниже👇🏼👇🏼👇🏼`;
  #infoVideoTelegramId = "BAACAgIAAxkBAAMeZbTyl8PgOKFIWwNdDnvFhUoAATTJAAIIPgACMbnBSpdIK6YP8XUBNAQ";

  #inviteText1 = `Как это работает?

Вы приглашаете друга, который начинает работать в моëм проекте. Вы скидываете мне скриншоты, подтверждающие, что приглашенный вами друг начал работу и я даю вам код для получения VIP инструкции с помощью которой вы заработаете от 27.000₽.`;
  #inviteUrlText = `Вас приглашают в проект ${this.#projectName}. ⚡️Зарабатывай с нами уже сегодня`;

  #vipInstructionWelcomeText = "Введите код для активации VIP инструкции:";
  #wrongCipInstructionText = "Вип-инструкция неправильная! Попробуйте ещё раз или нажмите отмена ниже.";
  #isWaitingVipCodeInput = new Map();
  #vipReplyMarkup = {
    reply_markup: {
      inline_keyboard: [[{text: "Перейти на сайт", url: this.#siteUrl}]],
    },
  };
  #cancelVipReplyMarkup = {
    reply_markup: {
      inline_keyboard: [[{text: "Отмена", callback_data: "cancel-vip-code"}]],
    },
  };

  #instructionReplyMarkup = {
    reply_markup: {
      inline_keyboard: [
        [{text: "Получить VIP инструкцию", callback_data: "insert-vip-code"}],
        [{text: "Перейти на сайт", url: this.#siteUrl}],
      ],
    },
  };
  #menuReplyMarkup = {
    reply_markup: {
      keyboard: [
        [{text: this.#executeInput}],
        [{text: this.#helpInput}, {text: this.#infoInput}],
        [{text: this.#inviteInput}],
      ],
      resize_keyboard: true,
      is_persistent: true,
    },
  };


  constructor() {
    this.#bot = new TelegramBot(process.env.TG_BOT_KEY, {polling: true});
    this.#instructions = new Instructions();
    this.#vipInstructions = new VipInstructions();
  }


  start() {
    console.log("Бот запустился.");

    this.#bot.on("message", async (context) => {
      try {
        if (this.#isWaitingVipCodeInput[context.from.id]) {
          await this.#checkVipCode(context);
          return;
        }

        if (context.text.match(/^\/start \d+$/)) {
          console.log(`Реферальная ссылка от ${context.text.match(/^\/start (\d+)$/)[1]} для ${context.from.id}.`);
          await this.sendHelloText(context);
          return;
        }

        switch (context?.text) {
          case "/start":
            await this.sendHelloText(context);
            break;
          case this.#executeInput:
            await this.#sendExecute(context);
            break;
          case this.#helpInput:
            await this.#sendHelp(context);
            break;
          case this.#infoInput:
            await this.#sendInfo(context);
            break;
          case this.#inviteInput:
            await this.#sendInvite(context);
            break;
          default:
            // do nothing
            break;
        }
      } catch (e) {
        console.log("Возникла ошибка:");
        console.log(e.toString());
      }
    });

    this.#bot.on("callback_query", async (context) => {
      const {message, data, from} = context;

      if (data === "insert-vip-code") {
        await this.#bot.sendMessage(from.id, this.#vipInstructionWelcomeText, this.#cancelVipReplyMarkup);
        this.#isWaitingVipCodeInput[from.id] = true;
        return;
      }
      if (data === "cancel-vip-code") {
        await this.#bot.editMessageReplyMarkup({}, {chat_id: from.id, message_id: message.message_id});
        this.#isWaitingVipCodeInput[from.id] = false;
        return;
      }
    });
  }


  async sendHelloText(context) {
    await this.#bot.sendMessage(context.chat.id, this.#helloText, this.#menuReplyMarkup);
  }

  async #sendExecute(context) {
    const chatId = context.chat.id;

    const {message_id: messageId} = await this.#bot.sendMessage(chatId, this.#executeTextStage1);

    setTimeout(() => this.#editExecuteMessageToStage2(chatId, messageId), 10000);
  }

  async #editExecuteMessageToStage2(chatId, messageId) {
    await this.#bot.editMessageText(this.#executeTextStage2, {chat_id: chatId, message_id: messageId});
    setTimeout(() => this.#editExecuteMessageToStage3(chatId, messageId), 3000);
  };

  async #editExecuteMessageToStage3(chatId, messageId) {
    await this.#bot.editMessageText(this.#executeTextStage3, {chat_id: chatId, message_id: messageId});
    setTimeout(() => this.#editExecuteMessageToStage4(chatId, messageId), 3000);
  };

  async #editExecuteMessageToStage4(chatId, messageId) {
    await this.#bot.editMessageText(this.#executeTextStage4, {chat_id: chatId, message_id: messageId});
    await this.#sendExecuteFinish(chatId);
  };

  async #sendExecuteFinish(chatId) {
    await this.#bot.sendMessage(chatId, this.#executeTextFinish);
    await this.#sendInstruction(chatId);
  };

  async #sendInstruction(chatId) {
    await this.#bot.sendMessage(chatId, this.#instructions.getInstructionMessage(chatId), this.#instructionReplyMarkup);
  }

  async #sendInfo(context) {
    await this.#bot.sendMessage(context.chat.id, this.#infoText);
    await this.#bot.sendVideo(context.chat.id, this.#infoVideoTelegramId);
  }

  async #sendHelp(context) {
    await this.#bot.sendMessage(context.chat.id, this.#helpText, this.#helpReplyMarkup);
  }

  async #sendInvite(context) {
    await this.#bot.sendMessage(context.chat.id, this.#inviteText1);

    const inviteLink = `t.me/${this.#botUsername}?start=${context.from.id}`;
    const inviteText2 = `Ваша перcональная ссылка для приглашения:

${inviteLink}

Чтобы отправить её друзьям, нажмите кнопку ниже 👇`;
    const inviteTextMarkup = {
      reply_markup: {
        inline_keyboard: [[{
          text: "✅Нажмите, что бы пригласить друзей",
          url: `tg://msg_url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(this.#inviteUrlText)}`,
        }]],
      },
    };

    await this.#bot.sendMessage(context.chat.id, inviteText2, inviteTextMarkup);
  }

  async #checkVipCode(context) {
    const vipInstruction = this.#vipInstructions.getVipInstructionMessage(context.text);
    if (vipInstruction) {
      await this.#bot.sendMessage(context.chat.id, vipInstruction, this.#vipReplyMarkup);
    } else {
      await this.#bot.sendMessage(context.chat.id, this.#wrongCipInstructionText, this.#cancelVipReplyMarkup);
    }
  }
}

module.exports = Bot;
