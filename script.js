"use strict";
console.log("hi");

const plotMap = (dataset) => {
  const height = 400;
  const width = 1200;
  const margin = { top: 40, right: 50, bottom: 100, left: 120 };

  const monthArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const months = dataset.map((m) => {
    return m.month;
  });
  const years = dataset.map((y) => {
    return y.year;
  });
  const variance = dataset.map((vari) => {
    return vari.variance;
  });

  const svg = d3
    .select("#scatterPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "graph-svg-component")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  ///////////////////////////////////
  // Build X scales and axis:
  ///////////////////////////////////

  const xAxisScale = d3
    .scaleBand()
    .range([0, width])
    .domain(years)
    .padding(0.01);
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(
      d3.axisBottom(xAxisScale).tickValues(
        xAxisScale.domain().filter(function (year) {
          // set ticks to years divisible by 10
          return year % 10 === 0;
        })
      )
    );

  ///////////////////////////////////
  // Build Y scales and axis:
  ///////////////////////////////////

  const yAxisScale = d3
    .scaleBand()
    .range([height, 0])
    .domain(months)
    .padding(0.0);
  svg
    .append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(yAxisScale).tickFormat((d) => monthArray[d - 1]));

  ///////////////////////////////////
  // Build color scale
  ///////////////////////////////////

  const myColor = d3
    .scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([d3.max(variance), d3.min(variance)]);

  ///////////////////////////////////
  // Legend
  ///////////////////////////////////

  var legend = d3
    .legendColor()
    .orient("horizontal")
    .scale(myColor)
    .shapePadding(20)
    .ascending(true)
    .title("Temperature Variance (°C)");
  svg
    .append("g")
    .attr("position", "absolute")
    .attr("id", "legend")
    .attr("transform", `translate(0,${height + 40})`)
    .call(legend);

  // const legend = Legend(
  //   d3.scaleSequential(
  //     [d3.max(variance), d3.min(variance)],
  //     d3.interpolateRdYlBu
  //   ),
  //   {
  //     title: "Temerature Variance (°C)",
  //   }
  // );

  ///////////////////////////////////
  //tooltip and functions
  ///////////////////////////////////

  const tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const mouseover = function (d) {
    tooltip.style("opacity", 1);
    d3.select(this).style("stroke", "black").style("opacity", 0.8);
  };
  const mousemove = function (d, data) {
    tooltip
      .html(
        `${monthArray[data.month - 1]}, ${
          data.year
        } <br> Temperature variance: ${data.variance}&#176;C`
      )
      .style("left", d3.pointer(d)[0] + 70 + "px")
      .style("top", d3.pointer(d)[1] + "px")
      .attr("data-year", data.year);
  };
  const mouseleave = function (d) {
    tooltip.style("opacity", 0);
    d3.select(this).style("stroke", "none").style("opacity", 1);
  };

  ///////////////////////////////////
  //adding cells
  ///////////////////////////////////

  svg
    .selectAll()
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => d.variance)
    .attr("x", (d) => xAxisScale(d.year))
    .attr("y", (d) => yAxisScale(d.month))
    .attr("width", (d) => xAxisScale.bandwidth())
    .attr("height", (d) => yAxisScale.bandwidth())
    .style("fill", (d) => myColor(d.variance))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
};

///////////////////////////////////
//fetching data and running main function
///////////////////////////////////

async function fetchData() {
  const res = await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  );
  const data = await res.json();
  console.log(data.monthlyVariance);
  plotMap(data.monthlyVariance);
}

fetchData();
