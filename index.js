const puppeteer = require('puppeteer');
const {executablePath} = require('puppeteer');
const fs = require('fs');

const scrapePlayers = async () => {
    let year = 1980;
    const data = [];

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
        ignoreHTTPSErrors: true,
        executablePath: executablePath(),
    });

    while (year <= 2024) {
        const page = await browser.newPage();

        await page.goto(`https://basketball.realgm.com/nba/players/${year}`);

        // Wait for the elements to load
        await page.waitForSelector('[data-th="Player"]');

        // Extract data from elements with data-th attribute equal to "Player"
        const yearData = await page.evaluate((year) => {
            const elements = document.querySelectorAll('[data-th="Player"]');
            const dataArr = [];

            elements.forEach((element) => {
                const textContent = element.textContent.trim();

                // Store the data in an object and push it to the array
                const item = {
                    player: textContent,
                    seasons: [year - 1], // Subtract 1 from the year before adding to the array
                };
                dataArr.push(item);
            });

            return dataArr;
        }, year);

        // Combine common player names
        yearData.forEach((item) => {
            const existingPlayer = data.find((d) => d.player === item.player);

            if (existingPlayer) {
                existingPlayer.seasons.push(...item.seasons);
            } else {
                data.push(item);
            }
        });

        year++;
        await page.close();
    }

    // Close the browser
    await browser.close();

    // Save the scraped data to a file
    fs.writeFileSync('scraped_data.json', JSON.stringify(data, null, 2));

    console.log('Data saved to scraped_data.json');
};

scrapePlayers();
