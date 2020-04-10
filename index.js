
const goodrx = require('./built/goodrx')
const lowermyrx = require('./built/lowermyrx')

exports.entrypoint = (req, res) => {
  switch (req.path) {
    case '/goodrx':
      return goodrx.invoke(req, res)
    case '/lowermyrx':
      return lowermyrx.invoke(req, res)
    default:
      res.send('function not defined')
  }
}
