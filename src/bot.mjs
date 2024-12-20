import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

let Q;

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText === '/start') {
        axios
            .get('https://simplemaps.com/static/data/country-cities/lt/lt.json')
            .then((response) => {
                const options = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: response.data.map(
                            ({ city, lat, lng }, i) => {
                                Q = `q=${lat},${lng}`;
                                return [
                                    {
                                        text: city,
                                        callback_data: i,
                                    },
                                ];
                            }
                        ),
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
        parse_mode: 'HTML',
    };
    const city = msg.reply_markup.inline_keyboard[+action][0].text;
    const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&days=7`;

    axios.get(`${weatherApiUrl}&${Q || `q=${city}`}`).then((response) => {
        bot.editMessageText(
            `Here's your 7 days forecast for ${city}
                ${response.data.forecast.forecastday
                    .map(
                        ({
                            date,
                            day: {
                                maxtemp_c,
                                mintemp_c,
                                maxwind_kph,
                                daily_will_it_rain,
                            },
                        }) =>
                            `
                            <b>Date</b>: ${date}
                            <b>Maximal temperature</b>: ${maxtemp_c}
                            <b>Minimal temperature</b>: ${mintemp_c}
                            <b>Maximal wind, m/s</b>: ${Math.round(
                                (+maxwind_kph * 1000) / 3600
                            )}
                            <b>Rain possibility</b>: ${
                                +daily_will_it_rain ? 'Yes' : 'No'
                            }
                            `
                    )
                    .join('')}`,
            opts
        );
    });
});
