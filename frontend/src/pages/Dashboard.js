import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import '../css/Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRecords: 0,
    avgIntensity: 0,
    avgLikelihood: 0,
    avgRelevance: 0
  });
  const [filters, setFilters] = useState({
    end_year: '',
    topic: '',
    sector: '',
    region: '',
    country: '',
    pestle: '',
    source: '',
    swot: '',
    city: ''
  });

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  useEffect(() => {
    if (filteredData.length > 0) {
      updateStats();
    }
  }, [filteredData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/data`);
      const result = await response.json();
      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error('Error fetching data:', error);

      // this is mock data when api call gets failed mock data will gets worked
      const sampleData = generateSampleData();
      setData(sampleData);
      setFilteredData(sampleData);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const regions = ['Northern America', 'Europe', 'Asia', 'Africa', 'South America'];
    const topics = ['energy', 'technology', 'environment', 'economy', 'politics'];
    const sectors = ['Energy', 'Technology', 'Healthcare', 'Finance', 'Manufacturing'];
    const countries = ['United States', 'China', 'Germany', 'Japan', 'United Kingdom'];
    const pestles = ['Political', 'Economic', 'Social', 'Technological', 'Environmental'];
    const sources = ['EIA', 'Reuters', 'Bloomberg', 'BBC', 'CNN'];
    const swots = ['Strength', 'Weakness', 'Opportunity', 'Threat'];
    const cities = ['New York', 'London', 'Tokyo', 'Beijing', 'Berlin'];
    
    return Array.from({ length: 150 }, (_, i) => ({
      intensity: Math.floor(Math.random() * 10) + 1,
      likelihood: Math.floor(Math.random() * 5) + 1,
      relevance: Math.floor(Math.random() * 5) + 1,
      end_year: 2020 + Math.floor(Math.random() * 10),
      region: regions[Math.floor(Math.random() * regions.length)],
      topic: topics[Math.floor(Math.random() * topics.length)],
      sector: sectors[Math.floor(Math.random() * sectors.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      pestle: pestles[Math.floor(Math.random() * pestles.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      swot: swots[Math.floor(Math.random() * swots.length)],
      city: cities[Math.floor(Math.random() * cities.length)]
    }));
  };



  const applyFilters = () => {
    let filtered = data.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        return item[key] && item[key].toString().toLowerCase().includes(filters[key].toLowerCase());
      });
    });
    setFilteredData(filtered);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      end_year: '',
      topic: '',
      sector: '',
      region: '',
      country: '',
      pestle: '',
      source: '',
      swot: '',
      city: ''
    });
  };

  const getUniqueValues = (field) => {
    return [...new Set(data.map(item => item[field]).filter(Boolean))].sort();
  };

  const updateStats = () => {
    if (filteredData.length === 0) {
      setStats({ totalRecords: 0, avgIntensity: 0, avgLikelihood: 0, avgRelevance: 0 });
      return;
    }

    const totalRecords = filteredData.length;
    const avgIntensity = (filteredData.reduce((sum, item) => sum + (item.intensity || 0), 0) / totalRecords).toFixed(1);
    const avgLikelihood = (filteredData.reduce((sum, item) => sum + (item.likelihood || 0), 0) / totalRecords).toFixed(1);
    const avgRelevance = (filteredData.reduce((sum, item) => sum + (item.relevance || 0), 0) / totalRecords).toFixed(1);

    setStats({
      totalRecords,
      avgIntensity,
      avgLikelihood,
      avgRelevance
    });
  };

  const getIntensityByRegionData = () => {
    const regionData = {};
    filteredData.forEach(item => {
      if (item.region && item.intensity) {
        regionData[item.region] = (regionData[item.region] || 0) + item.intensity;
      }
    });

    return [{
      x: Object.keys(regionData),
      y: Object.values(regionData),
      type: 'bar',
      marker: {
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
        line: {
          color: 'rgba(255,255,255,0.8)',
          width: 2
        }
      },
      hovertemplate: '<b>%{x}</b><br>Total Intensity: %{y}<br><extra></extra>',
      textposition: 'auto',
      textfont: { color: 'white', size: 12, family: 'Segoe UI' }
    }];
  };

  const getLikelihoodTrendsData = () => {
    const yearData = {};
    filteredData.forEach(item => {
      if (item.end_year && item.likelihood) {
        if (!yearData[item.end_year]) {
          yearData[item.end_year] = { sum: 0, count: 0 };
        }
        yearData[item.end_year].sum += item.likelihood;
        yearData[item.end_year].count += 1;
      }
    });

    const years = Object.keys(yearData).sort();
    const avgLikelihood = years.map(year => yearData[year].sum / yearData[year].count);

    return [{
      x: years,
      y: avgLikelihood,
      type: 'scatter',
      mode: 'lines+markers',
      line: { 
        color: '#667eea', 
        width: 4,
        shape: 'spline',
        smoothing: 1.3
      },
      marker: { 
        size: 10, 
        color: '#764ba2',
        line: {
          color: 'white',
          width: 2
        }
      },
      fill: 'tonexty',
      fillcolor: 'rgba(102, 126, 234, 0.1)',
      hovertemplate: '<b>Year: %{x}</b><br>Avg Likelihood: %{y:.2f}<extra></extra>'
    }];
  };

  const getPestleData = () => {
    const pestleData = {};
    filteredData.forEach(item => {
      if (item.pestle) {
        pestleData[item.pestle] = (pestleData[item.pestle] || 0) + 1;
      }
    });

    return [{
      labels: Object.keys(pestleData),
      values: Object.values(pestleData),
      type: 'pie',
      hole: 0.5,
      marker: {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'],
        line: {
          color: 'white',
          width: 3
        }
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      textfont: { size: 12, family: 'Segoe UI', color: '#2D3748' },
      hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
      pull: 0.05
    }];
  };

  const getBubbleData = () => {
    const sectorData = {};
    filteredData.forEach(item => {
      if (item.sector && item.relevance && item.intensity) {
        if (!sectorData[item.sector]) {
          sectorData[item.sector] = { relevance: [], intensity: [], count: 0 };
        }
        sectorData[item.sector].relevance.push(item.relevance);
        sectorData[item.sector].intensity.push(item.intensity);
        sectorData[item.sector].count += 1;
      }
    });

    const sectors = Object.keys(sectorData);
    const x = sectors.map(sector => 
      sectorData[sector].relevance.reduce((a, b) => a + b, 0) / sectorData[sector].relevance.length
    );
    const y = sectors.map(sector => 
      sectorData[sector].intensity.reduce((a, b) => a + b, 0) / sectorData[sector].intensity.length
    );
    const sizes = sectors.map(sector => sectorData[sector].count * 15);

    return [{
      x: x,
      y: y,
      mode: 'markers+text',
      marker: {
        size: sizes,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'],
        opacity: 0.8,
        line: {
          color: 'white',
          width: 2
        }
      },
      text: sectors,
      textposition: 'middle center',
      textfont: { color: 'white', size: 10, family: 'Segoe UI' },
      hovertemplate: '<b>%{text}</b><br>Avg Relevance: %{x:.2f}<br>Avg Intensity: %{y:.2f}<extra></extra>'
    }];
  };

  const getHeatmapData = () => {
    const countries = [...new Set(filteredData.map(item => item.country).filter(Boolean))].slice(0, 10);
    const metrics = ['Intensity', 'Likelihood', 'Relevance'];
    
    const z = countries.map(country => {
      const countryData = filteredData.filter(item => item.country === country);
      return metrics.map(metric => {
        const field = metric.toLowerCase();
        const values = countryData.map(item => item[field]).filter(Boolean);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      });
    });

    return [{
      z: z,
      x: metrics,
      y: countries,
      type: 'heatmap',
      colorscale: [
        [0, '#1a365d'],
        [0.2, '#2c5282'],
        [0.4, '#3182ce'],
        [0.6, '#4299e1'],
        [0.8, '#63b3ed'],
        [1.0, '#90cdf4']
      ],
      hoverongaps: false,
      hovertemplate: '<b>%{y}</b><br>%{x}: %{z:.2f}<extra></extra>',
      showscale: true,
      colorbar: {
        title: 'Score',
        titlefont: { size: 12, family: 'Segoe UI' }
      }
    }];
  };

  const getRadarData = () => {
    const topics = [...new Set(filteredData.map(item => item.topic).filter(Boolean))].slice(0, 6);
    
    const avgIntensity = topics.map(topic => {
      const topicData = filteredData.filter(item => item.topic === topic);
      const intensities = topicData.map(item => item.intensity).filter(Boolean);
      return intensities.length > 0 ? intensities.reduce((a, b) => a + b, 0) / intensities.length : 0;
    });

    return [{
      type: 'scatterpolar',
      r: avgIntensity,
      theta: topics,
      fill: 'toself',
      fillcolor: 'rgba(102, 126, 234, 0.4)',
      line: { color: '#667eea', width: 3 },
      marker: { color: '#764ba2', size: 12, line: { color: 'white', width: 2 } },
      hovertemplate: '<b>%{theta}</b><br>Avg Intensity: %{r:.2f}<extra></extra>'
    }];
  };

  const commonLayout = {
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Segoe UI', size: 12, color: '#2D3748' },
    margin: { t: 40, r: 40, b: 60, l: 60 },
    showlegend: false,
    hoverlabel: {
      bgcolor: 'rgba(0,0,0,0.8)',
      bordercolor: 'white',
      font: { color: 'white', family: 'Segoe UI' }
    }
  };

  const config = { 
    responsive: true, 
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'chart',
      height: 500,
      width: 700,
      scale: 2
    }
  };

  const getScatterData = () => {
  return [
    {
      x: [1, 2, 3, 4, 5],
      y: [2, 3, 4, 5, 6],
      mode: 'markers',
      type: 'scatter',
      marker: { color: 'rgba(255, 99, 132, 0.8)', size: 12 },
      name: 'Example Series'
    }
  ];
};


const get3DScatterData = () => {
  const sample = filteredData.slice(0, 100);
  
  return [
    {
      x: sample.map(d => d.intensity),
      y: sample.map(d => d.likelihood),
      z: sample.map(d => d.relevance),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        size: 6,
        color: sample.map(d => d.intensity),
        colorscale: 'Viridis',
        opacity: 0.8
      },
      hovertemplate:
        'Intensity: %{x}<br>Likelihood: %{y}<br>Relevance: %{z}<extra></extra>',
    }
  ];
};

const get3DSurfaceData = () => {
  const sample = filteredData.slice(0, 100);

  // Create 2D grid data for X, Y, and Z
  const gridSize = Math.floor(Math.sqrt(sample.length));
  const zData = [];

  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      const index = i * gridSize + j;
      const value = sample[index] ? sample[index].relevance : null;
      row.push(value || 0); // fallback for missing data
    }
    zData.push(row);
  }

  return [
    {
      z: zData,
      type: 'surface',
      colorscale: 'Viridis',
      showscale: true,
      hovertemplate: 'Relevance: %{z}<extra></extra>',
    }
  ];
};

const getTreemapData = () => {
  const sample = filteredData.slice(0, 100);

  // Group by sector > topic
  const labels = [];
  const parents = [];
  const values = [];

  const sectorTopicMap = {};

  sample.forEach((item) => {
    const sector = item.sector || 'Unknown Sector';
    const topic = item.topic || 'Unknown Topic';
    const value = item.intensity || 1;

    // Add sector as parent if not already added
    if (!sectorTopicMap[sector]) {
      labels.push(sector);
      parents.push('');
      values.push(0); // placeholder for sector, not used for drawing size
      sectorTopicMap[sector] = new Set();
    }

    // Add topic under sector
    const label = `${sector} - ${topic}`;
    if (!labels.includes(label)) {
      labels.push(label);
      parents.push(sector);
      values.push(value);
      sectorTopicMap[sector].add(topic);
    }
  });

  return [
    {
      type: 'treemap',
      labels: labels,
      parents: parents,
      values: values,
      textinfo: 'label+value',
      hovertemplate: '%{label}<br>Intensity: %{value}<extra></extra>',
      marker: { colorscale: 'Blues' },
    },
  ];
};

const getSankeyData = () => {
  const sample = filteredData.slice(0, 100); // limit for performance

  const sources = [];
  const targets = [];
  const values = [];
  const labelSet = new Set();

  sample.forEach((item) => {
    const source = item.sector || 'Unknown Sector';
    const target = item.topic || 'Unknown Topic';
    const value = item.intensity || 1;

    sources.push(source);
    targets.push(target);
    values.push(value);

    labelSet.add(source);
    labelSet.add(target);
  });

  const labels = Array.from(labelSet);
  const labelToIndex = Object.fromEntries(labels.map((label, index) => [label, index]));

  return [
    {
      type: 'sankey',
      orientation: 'h',
      node: {
        pad: 15,
        thickness: 20,
        line: { color: '#fff', width: 0.5 },
        label: labels,
        color: labels.map(() => '#805AD5'),
      },
      link: {
        source: sources.map((s) => labelToIndex[s]),
        target: targets.map((t) => labelToIndex[t]),
        value: values,
        color: 'rgba(128,90,213,0.4)',
        hovertemplate:
          'From %{source.label} → %{target.label}<br>Intensity: %{value}<extra></extra>',
      },
    },
  ];
};





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 mx-auto mb-6"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
          <p className="text-purple-200">Preparing your data visualizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
              <span className="text-3xl">📊</span>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300 font-light">
              Advanced Data Visualization & Analytics Platform
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>

    

<div className="holo-card filters-panel">
  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
    <span className="mr-3">🔍</span>
    Data Filters
  </h2>
  <div className="filters-grid">
    {Object.keys(filters).map((filterKey, idx) => (
      <div key={filterKey} className="filter-card">
        <label>
          <span className="filter-label-icon">{idx % 2 === 0 ? "🔹" : "🔸"}</span>
          {filterKey.replace('_', ' ')}
        </label>
        <select
          value={filters[filterKey]}
          onChange={e => handleFilterChange(filterKey, e.target.value)}
        >
          <option value="">All {filterKey.replace('_', ' ')}</option>
          {getUniqueValues(filterKey).map(value => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>
    ))}
    <div className="filter-card" style={{alignSelf: "end"}}>
      <button onClick={clearAllFilters} className="button-glow" style={{width: "100%"}}>
        🔄 Clear All
      </button>
    </div>
  </div>
</div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { key: 'totalRecords', label: 'Total Records', icon: '📊', gradient: 'from-purple-500 to-indigo-600' },
              { key: 'avgIntensity', label: 'Avg Intensity', icon: '⚡', gradient: 'from-blue-500 to-cyan-500' },
              { key: 'avgLikelihood', label: 'Avg Likelihood', icon: '🎯', gradient: 'from-green-500 to-emerald-500' },
              { key: 'avgRelevance', label: 'Avg Relevance', icon: '🔥', gradient: 'from-orange-500 to-red-500' }
            ].map(stat => (
              <div key={stat.key} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{stats[stat.key]}</div>
                    <div className="text-sm opacity-90 font-medium">{stat.label}</div>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/50 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Intensity by Region Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">🌍</span>
                <h3 className="text-2xl font-bold text-white">Regional Intensity Analysis</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getIntensityByRegionData()}
                  layout={{
                    ...commonLayout,
                    title: { text: '', font: { size: 16, color: 'white' } },
                    xaxis: { 
                      title: 'Region', 
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    },
                    yaxis: { 
                      title: 'Total Intensity',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>

            {/* Likelihood Trends Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">📈</span>
                <h3 className="text-2xl font-bold text-white">Likelihood Trends</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getLikelihoodTrendsData()}
                  layout={{
                    ...commonLayout,
                    xaxis: { 
                      title: 'Year',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    },
                    yaxis: { 
                      title: 'Average Likelihood',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>

            {/* PESTLE Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">🎯</span>
                <h3 className="text-2xl font-bold text-white">PESTLE Distribution</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getPestleData()}
                  layout={{
                    ...commonLayout,
                    margin: { t: 20, r: 20, b: 20, l: 20 }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>

            {/* Bubble Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">🏭</span>
                <h3 className="text-2xl font-bold text-white">Sector Performance</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getBubbleData()}
                  layout={{
                    ...commonLayout,
                    xaxis: { 
                      title: 'Average Relevance',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    },
                    yaxis: { 
                      title: 'Average Intensity',
                      gridcolor: 'rgba(255,255,255,0.1)',
                      tickfont: { color: '#E2E8F0' }
                    }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>

            {/* Heatmap Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">🌐</span>
                <h3 className="text-2xl font-bold text-white">Country Performance Matrix</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getHeatmapData()}
                  layout={{
                    ...commonLayout,
                    xaxis: { 
                      title: 'Metrics',
                      tickfont: { color: '#E2E8F0' }
                    },
                    yaxis: { 
                      title: 'Countries',
                      tickfont: { color: '#E2E8F0' }
                    },
                    margin: { t: 20, r: 60, b: 60, l: 120 }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">📊</span>
                <h3 className="text-2xl font-bold text-white">Topic Analysis Radar</h3>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <Plot
                  data={getRadarData()}
                  layout={{
                    ...commonLayout,
                    polar: {
                      radialaxis: {
                        visible: true,
                        range: [0, 10],
                        tickfont: { color: '#E2E8F0' },
                        gridcolor: 'rgba(255,255,255,0.1)'
                      },
                      angularaxis: {
                        tickfont: { color: '#E2E8F0' }
                      }
                    },
                    margin: { t: 20, r: 20, b: 20, l: 20 }
                  }}
                  config={config}
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            </div>
         
             {/* scatter */}
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
  <div className="flex items-center mb-6">
    <span className="text-3xl mr-4">📈</span>
    <h3 className="text-2xl font-bold text-white">Sector vs Intensity Scatter</h3>
  </div>
  <div className="bg-white/5 rounded-2xl p-4">
    <Plot
      data={getScatterData()}
      layout={{
        ...commonLayout,
        xaxis: {
          title: { text: 'Sector', font: { color: '#E2E8F0' } },
          tickfont: { color: '#E2E8F0' },
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: {
          title: { text: 'Intensity', font: { color: '#E2E8F0' } },
          tickfont: { color: '#E2E8F0' },
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        margin: { t: 20, r: 20, b: 40, l: 50 }
      }}
      config={config}
      style={{ width: '100%', height: '400px' }}
    />
  </div>
</div>

{/* 3D Scatter Plot */}
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
  <div className="flex items-center mb-6">
    <span className="text-3xl mr-4">🔺</span>
    <h3 className="text-2xl font-bold text-white">3D Scatter Plot</h3>
  </div>
  <div className="bg-white/5 rounded-2xl p-4">
    <Plot
      data={get3DScatterData()}
      layout={{
        ...commonLayout,
        scene: {
          xaxis: { title: 'Intensity', tickfont: { color: '#E2E8F0' } },
          yaxis: { title: 'Likelihood', tickfont: { color: '#E2E8F0' } },
          zaxis: { title: 'Relevance', tickfont: { color: '#E2E8F0' } },
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
      }}
      config={config}
      style={{ width: '100%', height: '400px' }}
    />
  </div>
</div>



  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 mt-8">
  <div className="flex items-center mb-6">
    <span className="text-3xl mr-4">🌄</span>
    <h3 className="text-2xl font-bold text-white">3D Surface Plot</h3>
  </div>
  <div className="bg-white/5 rounded-2xl p-4">
    <Plot
      data={get3DSurfaceData()}
      layout={{
        ...commonLayout,
        scene: {
          zaxis: { title: 'Relevance', tickfont: { color: '#E2E8F0' } },
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
      }}
      config={config}
      style={{ width: '100%', height: '400px' }}
    />
  </div>
</div>


         <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
  <div className="flex items-center mb-6">
    <span className="text-3xl mr-4">🌲</span>
    <h3 className="text-2xl font-bold text-white">Treemap</h3>
  </div>
  <div className="bg-white/5 rounded-2xl p-4">
    <Plot
      data={getTreemapData()}
      layout={{
        ...commonLayout,
        margin: { t: 20, b: 20, l: 0, r: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
      }}
      config={config}
      style={{ width: '100%', height: '400px' }}
    />
  </div>
</div>

<div className="bg-gradient-to-br from-purple-900 via-black to-gray-900 border border-purple-800/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
  <div className="flex items-center mb-6">
    <span className="text-3xl mr-4">🔀</span>
    <h3 className="text-2xl font-bold text-white tracking-wide">Sankey Diagram</h3>
  </div>
  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
    <Plot
      data={getSankeyData()}
      layout={{
        ...commonLayout,
        margin: { t: 40, b: 20, l: 10, r: 10 },
        font: { size: 12, color: '#E2E8F0' },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
      }}
      config={config}
      style={{ width: '100%', height: '500px' }}
    />
  </div>
</div>



          </div>



          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <p className="text-gray-300 text-lg">
                {/* © 2024 Advanced Analytics Dashboard • Powered by React & Plotly.js */}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;