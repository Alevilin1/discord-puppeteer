const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

async function pegandoDadosSteam(nomeDeUsuario) {
    let steamId;
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
