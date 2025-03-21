const chromium = require("@sparticuz/chromium-min");
const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;


async function pegandoDadosSteam(nomeDeUsuario) {
    let steamId;
    const browser = await puppeteer.launch({
        executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),
        args: [
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--single-process',
            '--no-zygote',
        ]
    });
    const page = await browser.newPage();

    try {
        await page.goto(`https://steamcommunity.com/search/users/#text=${nomeDeUsuario}`);
        await page.waitForSelector('.searchPersonaName', { timeout: 3000 });

        const element = await page.$('.searchPersonaName');
        if (element) {
            const profileLink = await element.getProperty('href');
            const link = await profileLink.jsonValue();
            steamId = link.split('/').pop();
            return { username: nomeDeUsuario, steamId };
        } else {
            return { error: "Usuário não encontrado" };
        }
    } catch (err) {
        return { error: "Erro ao buscar usuário", details: err.message };
    } finally {
        await browser.close();
    }
}

app.get("/steam/:username", async (req, res) => {
    const result = await pegandoDadosSteam(req.params.username);
    res.json(result);
    console.log("Usuario encontrado com sucesso!");
});

app.get("/", async (req, res) => {
    console.log("Pingou");
    res.send("<h1>Digite /steam/NOMEDOUSUARIO para pegar um id</h1>");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
