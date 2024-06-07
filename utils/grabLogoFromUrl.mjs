import puppeteer from 'puppeteer';
import fs from 'fs';
import https from 'https';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getLogoFromWebsite() {
rl.question('Please enter a website: ', async (siteName) => {
    console.log('grabLogoFromSiteName', siteName);
    console.log('We are looking for your logos, please wait a moment...');
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    const site = await page.goto(`https://www.${siteName}.com`, { waitUntil: 'networkidle0', timeout: 60000 });
    if (site.status() === 200) {
        const logo = await page.evaluate(() => {
            const img = document.querySelector('img[class*="logo"]');
            return img ? img.src : null;
        });
        if (!logo) {
            console.log('No logo found, please try again');
            logo = await page.evaluate(() => {
                const favicon = document.querySelector('link[rel="icon"]');
                return favicon ? favicon.href : null;
            });
        }
        if (logo) {
        console.log('Logo:', logo);
        const file = fs.createWriteStream('logo.jpg');
        https.get(logo, (response) => {
            response.pipe(file);
        });
        console.log('Your logo is ready, please check the logo.jpg file');
    } else {
        console.log('No logos found, please try again');
    }
} else {
    await browser.close();
}
});
}

getLogoFromWebsite();

rl.on('close', () => {
    console.log('Bye!');
    process.exit(0);
});






