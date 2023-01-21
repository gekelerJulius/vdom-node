const Plotly = require("plotly.js");

export function usePlotly() {
  Plotly.apply(self, arguments);
}

module.exports = usePlotly;
module.exports.newPlot = Plotly.newPlot;
