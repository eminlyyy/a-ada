const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/', async(req, res) => {
    const browser = await puppeteer.launch({
        headless: false,
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    const { username, password, crns } = req.body;

    await page.setViewport({
        width: 1536,
        height: 754
    });

    await page.goto('https://reg-prod.ec.ada.edu.az/StudentRegistrationSsb/ssb/term/termSelection?mode=registration');

    await page.waitForSelector('#registerLink');

    await Promise.all([
        page.waitForNavigation,
        page.click('#registerLink')
    ]);

    await page.waitForSelector('#username');

    await page.type('#username', username);
    await page.type('#password', password);

    await Promise.all([
        page.waitForNavigation(),
        page.click('button')
    ]);

    await page.waitForSelector('.select2-choice');
    await page.click('.select2-choice');
    await page.waitForSelector('.select2-result');
    await page.click('.select2-result');

    await Promise.all([
        page.waitForNavigation(),
        page.click('#term-go')
    ]);

    await page.waitForSelector('#enterCRNs-tab');
    await page.click('#enterCRNs-tab');

    await page.waitForSelector('#txt_crn1');
    await page.type('#txt_crn1', `${crns[0]}`);

    if (crns.length > 1) {
        for (let i = 0; i < crns.length - 1; i++) {
            await page.click('#addAnotherCRN');
            await page.waitForSelector(`#txt_crn${i + 2}`);
    
            await page.type(`#txt_crn${i + 2}`, `${crns[i + 1]}`);
        }
    }

    await page.click('#addCRNbutton');

    await page.waitForSelector('#saveButton');
    await page.click('#saveButton', {
        delay: 1000
    });

    res.status(200).json({ message: 'ok' });

    // await browser.close();
})

app.listen(process.env.PORT || 4000);