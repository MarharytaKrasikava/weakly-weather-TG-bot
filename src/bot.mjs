import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
const token = '7832125182:AAGSHl8ObEMPLwHemK9Ee8lyBsjDZ8YwFak';
const bot = new TelegramBot(token, { polling: true });

const weatherApiKey = '6b9e27820e794e649b7103756242811';
const weatherApiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&days=3`;
let Q;

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
    };

    const city = msg.reply_markup.inline_keyboard[+action][0].text;

    console.log(city);

    axios.get(`${weatherApiUrl}&${Q || `q=${city}`}`).then((response) => {
        console.log(response.data.forecast);
        bot.editMessageText(
            JSON.stringify(
                response.data.forecast.forecastday.map(
                    ({
                        date,
                        day: {
                            maxtemp_c,
                            mintemp_c,
                            maxwind_mph,
                            daily_will_it_rain,
                        },
                    }) => ({
                        date,
                        maximal_temperature: maxtemp_c,
                        minimal_temperature: mintemp_c,
                        maximal_wind_mph: maxwind_mph,
                        rain_possibility: daily_will_it_rain,
                    })
                )
            ),
            opts
        );
    });
});
