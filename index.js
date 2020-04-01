
const goodrx = require('./built/goodrx')

exports.entrypoint = (req, res) => {
  switch (req.path) {
    case '/goodrx':
      return goodrx.invoke(req, res)
    default:
      res.send('function not defined')
  }
}
