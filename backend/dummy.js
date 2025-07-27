import React, { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    end_year: "",
    topic: "",
    sector: "",
    region: "",
    pestle: "",
    source: "",
    swot: "",
    country: "",
    city: ""
  });

  const fetchData = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await axios.get(`http://localhost:5000/api/filter?${query}`);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const uniqueValues = (key) => [...new Set(data.map((item) => item[key]).filter(Boolean))];

  return (
    <div className="container">
      <h2>Blackcoffer Visualization Dashboard</h2>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.keys(filters).map((key) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="">{key.toUpperCase()}</option>
            {uniqueValues(key).map((val, i) => (
              <option key={i} value={val}>{val}</option>
            ))}
          </select>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Plot
          data={[
            {
              x: data.map((d) => d.country),
              y: data.map((d) => d.intensity),
              type: "bar",
              marker: { color: "rgba(0, 123, 255, 0.6)" }
            }
          ]}
          layout={{ title: "Intensity by Country", responsive: true }}
        />

        {/* Line Chart */}
        <Plot
          data={[
            {
              x: data.map((d) => d.end_year),
              y: data.map((d) => d.likelihood),
              type: "scatter",
              mode: "lines+markers",
              marker: { color: "rgba(40, 167, 69, 0.6)" }
            }
          ]}
          layout={{ title: "Likelihood Over Years", responsive: true }}
        />

        {/* Pie Chart */}
        <Plot
          data={[
            {
              values: uniqueValues("topic").map(
                (topic) => data.filter((d) => d.topic === topic).length
              ),
              labels: uniqueValues("topic"),
              type: "pie"
            }
          ]}
          layout={{ title: "Distribution by Topic", responsive: true }}
        />

        {/* Heatmap or another creative chart */}
        <Plot
          data={[
            {
              z: data.map((d) => d.relevance),
              x: data.map((d) => d.region),
              y: data.map((d) => d.country),
              type: "heatmap",
              colorscale: "Viridis"
            }
          ]}
          layout={{ title: "Relevance Heatmap", responsive: true }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
