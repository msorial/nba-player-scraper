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
        await page.waitForSelector('[data-th="Pre-Draft Team"]');

        // Extract data from elements with data-th attribute equal to "Player"
        const yearData = await page.evaluate((year) => {
            const playerElements =
                document.querySelectorAll('[data-th="Player"]');
            const preDraftTeamElements = document.querySelectorAll(
                '[data-th="Pre-Draft Team"]',
            );
            const dataArr = [];

            playerElements.forEach((playerElement, index) => {
                const playerName = playerElement.textContent.trim();
                const preDraftTeam =
                    preDraftTeamElements[index].textContent.trim();

                // Store the data in an object and push it to the array
                const item = {
                    player: playerName,
                    predraftTeam: preDraftTeam,
                    seasons: [(year - 1).toString()], // Convert the year to a string before adding to the array
                };

                dataArr.push(item);
            });

            return dataArr;
        }, year);

        // Combine common player names
        yearData.forEach((item) => {
            const existingPlayer = data.find(
                (d) =>
                    d.player === item.player &&
                    d.predraftTeam === item.predraftTeam,
            );

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
