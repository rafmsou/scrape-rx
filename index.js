
// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

const goodrx = require('./built/goodrx')
const lowermyrx = require('./built/lowermyrx')
const optumperks = require('./built/optumperks')
const rxsaver = require('./built/rxsaver')
const wellrx = require('./built/wellrx')

exports.entrypoint = (req, res) => {
  switch (req.path) {
    case '/goodrx':
      return goodrx.invoke(req, res)
    case '/lowermyrx':
      return lowermyrx.invoke(req, res)
    case '/optumperks':
      return optumperks.invoke(req, res)
    case '/rxsaver':
      return rxsaver.invoke(req, res)
    case '/wellrx':
      return wellrx.invoke(req, res)
    default:
      res.send('function not defined')
  }
}
