const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const bodyParser = require('body-parser');

const token = "807164513:AAGNeT5NSDJiCKuxua37BHYg9wiLMcxMIDM";
const appUrl = "https://botpars.herokuapp.com";

const setWebhook = url => axios.get(`https://api.telegram.org/bot${token}/setWebhook?url=${url}`);
const sendMessage = (chatId, text) => axios.get(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`);
const parseWeather = async (date) => {
    const {
        window: { document },
    } = await JSDOM.fromURL('https://ua.sinoptik.ua/погода-киев', {
        resources: 'usable',
        runScripts: 'dangerously',
    });
    const tabs = Array.from(document.querySelectorAll('.main'));
    const tab = tabs.filter(el => el.querySelector('.day-link').getAttribute('data-link').includes(date))[0];
    return tab ? tab.querySelector('.temperature').textContent || tab[0] == null : 'no info';
};

const app = express();
app.use(bodyParser.json());
app.post('/telegram', (req, res) => {
    const {
        text,
        chat: { id },
    } = req.body.message;
    parseWeather(text).then(
        weather => sendMessage(id, weather),
        () => sendMessage(id, 'error'),
    );
    res.send();
});
app.get('*', (_req, res) => {
    res.send('Hello from Express.js!');
});
app.listen(process.env.PORT || 3000, () => {
    setWebhook(`${appUrl}/telegram`);
});
