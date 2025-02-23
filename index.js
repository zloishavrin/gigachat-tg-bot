const TelegramBot = require('node-telegram-bot-api');
const GigaChat = require('gigachat-node').GigaChat;

// Ваш ключ от Telegram Bot API
const TG_API_TOKEN = "TG_API_KEY";
// Ваш ключ от GigaChat API
const GIGACHAT_API_TOKEN = "GIGACHAT_API_KEY";

const bot = new TelegramBot(TG_API_TOKEN, { polling: true });

// Инициализация класса GigaChat и передача объекта конфигурации в конструктор
const client = new GigaChat({
  clientSecretKey: GIGACHAT_API_TOKEN,
  isIgnoreTSL: true,
  isPersonal: true,
  autoRefreshToken: true
});

const main = async () => {
  // Получение токена GigaChat для аутентификации запросов
  await client.createToken();

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text.trim();

    try {
      // Отправка сообщения в GigaChat
      const response = await client.completion({
        model: "GigaChat:latest",
        messages: [{ role: "user", content: messageText }]
      });

      // Проверка на пустой ответ
      if (!response || !response.choices || response.choices.length === 0) {
        bot.sendMessage(chatId, 'Произошла ошибка при обработке запроса.');
        return;
      }

      const replyText = response.choices[0].message.content;

      // Отправка ответа пользователю
      bot.sendMessage(chatId, replyText);
    } 
    catch (error) {
      console.log(error);
      // Обработка ошибок при запросе к GigaChat
      bot.sendMessage(chatId, 'Произошла ошибка при общении с GigaChat. Попробуйте снова позже.');
    }
  });
}

main();