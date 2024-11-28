import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
const token = '7832125182:AAGSHl8ObEMPLwHemK9Ee8lyBsjDZ8YwFak';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Process the incoming message here
    if (messageText === '/start') {
        bot.sendMessage(chatId, 'Welcome to the WeekForecast bot!');
    }

    if (messageText === '/city') {
        axios
            .get('https://simplemaps.com/static/data/country-cities/lt/lt.json')
            .then((response) => {
                const options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: response.data.map((city, i) => [
                            { text: JSON.stringify(city), callback_data: i },
                        ]),
                    }),
                };
                bot.sendMessage(chatId, 'Select Lithuanian city:', options);
            });
    }
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    let text;

    if (action === '1') {
        text = msg.reply_markup.inline_keyboard[+action][0].text;
    }

    bot.editMessageText(text, opts);
});
