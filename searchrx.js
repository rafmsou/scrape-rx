
const drugs = require('./drugs.json')

exports.helloWorld = (req, res) => {
  const term = req.query.q
  const matchedDrugs = drugs.filter(
    d => d.toLowerCase().startsWith(term.toLowerCase())
  )
  res.send(matchedDrugs);
};
