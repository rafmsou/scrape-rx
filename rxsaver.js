
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const devices = require('puppeteer/DeviceDescriptors');

puppeteer.launch({ headless: true })
.then(async browser => {
  const page = await browser.newPage()
  await page.goto('https://rxsaver.retailmenot.com')

  try {
    await page.type('input[type="search"]', 'metform')
    await page.waitForSelector('.ant-select-dropdown-menu')
    await page.waitFor(500)

    await Promise.all([
      page.waitForNavigation(),
      page.click('.ant-select-dropdown-menu > li'),
    ])

    await page.waitForSelector('.zip-code a')
    await page.click('.zip-code a')
    await page.waitForSelector('input.zip-code-input-search')
    await page.type('input.zip-code-input-search', '91329')
    await page.click('.zip-code button')

    await page.waitForSelector('.results-list')
    const results = await page.$$eval(
      '.results-list div',
      divs => divs.map(div => {
        const pharmacy = div.querySelector('.pharmacy-name')
        return pharmacy ? pharmacy.innerText : null
      })
    )

    console.log(results);

    await browser.close()
  } catch (error) {
    console.error(error)
    await browser.close()
  }
})
