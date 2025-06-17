'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useFinMindData } from '../../lib/hooks/useFinMindData';

// Define an interface for the FinMind API monthly revenue data
interface FinMindMonthlyRevenueData {
  date: string;
  stock_id: string;
  revenue: number | string | null | undefined;
  revenue_month: number;
  revenue_year: number;
}

// Define an interface for the processed data for table display
interface TableDisplayData {
  yearMonth: string;
  monthlyRevenue: string;
  yoyGrowth: string;
}

// Define an interface for the processed data for chart display
interface ChartDisplayData {
  date: number;
  monthlyRevenue: number;
  yoyGrowth: number;
}

export default function FinancialDataPage() {
  const stockId = '2867'; // 三商壽的股票代碼
  const { data: finMindData, loading, error } = useFinMindData(stockId, '2019-01-01', new Date().toISOString().slice(0, 10));

  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly'); // Added state for view mode

  // Add console logs for debugging
  useEffect(() => {
    if (finMindData) {
      console.log("FinMind Raw Data:", finMindData);
    }
    console.log(`Rendering Chart: loading=${loading}, error=${error}, finMindData=${!!finMindData}, finMindData.length=${finMindData ? finMindData.length : 0}`);
  }, [finMindData, loading, error]);

  // Helper function to calculate Year-over-Year Growth (YoY)
  const calculateYoyGrowth = (currentItem: FinMindMonthlyRevenueData, allData: FinMindMonthlyRevenueData[]): number | null => {
    const currentRevenue = parseFloat(String(currentItem.revenue));
    if (isNaN(currentRevenue)) return null;

    const previousYearItem = allData.find(item =>
      item.revenue_year === currentItem.revenue_year - 1 &&
      item.revenue_month === currentItem.revenue_month
    );

    if (previousYearItem) {
      const previousYearRevenue = parseFloat(String(previousYearItem.revenue));
      if (!isNaN(previousYearRevenue) && previousYearRevenue !== 0) {
        return ((currentRevenue / previousYearRevenue) - 1) * 100;
      }
    }
    return null;
  };

  const processChartData = (data: FinMindMonthlyRevenueData[], mode: 'monthly' | 'yearly'): ChartDisplayData[] => {
    console.log(`processChartData called with mode: ${mode}, data length: ${data ? data.length : 0}`);
    if (!data || data.length === 0) {
      console.log("processChartData: No data received or data is empty.");
      return [];
    }

    if (mode === 'monthly') {
      const processedData = data
        .map(item => {
          const date = new Date(item.date as string);
          const parsedMonthlyRevenue = parseFloat(String(item.revenue)) / 1000; // Re-add: Convert to thousands (千元)
          const calculatedYoyGrowth = calculateYoyGrowth(item, data);

          return {
            date: date.getTime(),
            monthlyRevenue: !isNaN(parsedMonthlyRevenue) ? parsedMonthlyRevenue : 0,
            yoyGrowth: calculatedYoyGrowth != null ? calculatedYoyGrowth : 0,
          };
        })
        .sort((a, b) => a.date - b.date);
        console.log("processChartData - Monthly Mode Result (sample):");
        processedData.slice(0, 5).forEach(d => console.log(d)); // Log first 5
        processedData.slice(-5).forEach(d => console.log(d)); // Log last 5
        return processedData;
    } else { // 'yearly' mode
      const yearlyDataMap: { [year: number]: { totalRevenue: number; monthlyData: FinMindMonthlyRevenueData[] } } = {};

      data.forEach(item => {
        const year = item.revenue_year;
        const revenue = parseFloat(String(item.revenue)) / 1000; // Re-add: Convert to thousands (千元)

        if (!yearlyDataMap[year]) {
          yearlyDataMap[year] = { totalRevenue: 0, monthlyData: [] };
        }
        if (!isNaN(revenue)) {
          yearlyDataMap[year].totalRevenue += revenue;
        }
        yearlyDataMap[year].monthlyData.push(item);
      });

      const yearlyChartData: ChartDisplayData[] = [];
      const years = Object.keys(yearlyDataMap).map(Number).sort((a, b) => a - b);

      years.forEach(year => {
        const currentYearRevenue = yearlyDataMap[year].totalRevenue;
        let yearlyYoyGrowth: number | null = null;

        if (yearlyDataMap[year - 1]) {
          const previousYearRevenue = yearlyDataMap[year - 1].totalRevenue;
          if (previousYearRevenue !== 0) {
            yearlyYoyGrowth = ((currentYearRevenue / previousYearRevenue) - 1) * 100;
          }
        }

        yearlyChartData.push({
          date: new Date(year, 0, 1).getTime(), // Start of the year
          monthlyRevenue: currentYearRevenue, // Represents yearly total now
          yoyGrowth: yearlyYoyGrowth != null ? yearlyYoyGrowth : 0,
        });
      });

      // Filter to the last 5 years from the latest data point
      const latestDataYear = data.reduce((maxYear, item) => Math.max(maxYear, item.revenue_year), 0); // Find the latest year from the data
      const fiveYearsAgo = latestDataYear - 4; // Including current year for 5 years total if data exists

      const filteredAndSlicedData = yearlyChartData.filter(item => new Date(item.date).getFullYear() >= fiveYearsAgo)
                             .slice(-5); // Ensure only the last 5 are shown if more are filtered
      console.log("processChartData - Yearly Mode Result (sample):");
      filteredAndSlicedData.slice(0, 5).forEach(d => console.log(d)); // Log first 5
      filteredAndSlicedData.slice(-5).forEach(d => console.log(d)); // Log last 5
      return filteredAndSlicedData;
    }
  };

  // Process data for table and chart only when data is available
  const rawTableData: TableDisplayData[] = finMindData ? finMindData
    .map((item: FinMindMonthlyRevenueData) => {
      const parsedRevenue = parseFloat(String(item.revenue)) / 1000; // Re-add: Convert to thousands (千元) for table
      const calculatedYoyGrowth = calculateYoyGrowth(item, finMindData);

      return {
        yearMonth: `${item.revenue_year}${('0' + item.revenue_month).slice(-2)}`,
        monthlyRevenue: !isNaN(parsedRevenue) ? parsedRevenue.toLocaleString() : '--',
        yoyGrowth: calculatedYoyGrowth != null ? calculatedYoyGrowth.toFixed(2) : '--',
      };
    }).sort((a: TableDisplayData, b: TableDisplayData) => b.yearMonth.localeCompare(a.yearMonth)) : [];

  const chartData: ChartDisplayData[] = processChartData(finMindData || [], viewMode);

  useEffect(() => {
    console.log("Raw Table Data:", rawTableData);
    console.log("Chart Data:", chartData);
    console.log("Chart Data Length:", chartData.length);
  }, [rawTableData, chartData]);

  const formatMonthlyRevenue = (value: number) => {
    return value.toLocaleString(); // Only format with commas, no units here (unit handled by Typography at top)
  };

  const formatYoYGrowth = (value: number) => {
    return `${value}%`;
  };

  const formatXAxisTick = (tickItem: number, viewMode: 'monthly' | 'yearly') => {
    const date = new Date(tickItem);
    if (viewMode === 'monthly') {
      const year = date.getFullYear() % 100;
      const month = date.getMonth() + 1;
      return `${year < 10 ? '0' : ''}${year}${(month < 10 ? '0' : '')}${month}`; // YYMM format
    } else {
      return `${date.getFullYear()}`; // YYYY format
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          variant="outlined"
          placeholder="输入台 / 美股代号，查看公司价值"
          sx={{ width: '600px', bgcolor: 'white', borderRadius: 1 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Company Data Card */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          三商壽 (2867)
        </Typography>

        {/* Monthly Revenue Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
          <Button
            variant={viewMode === 'monthly' ? 'contained' : 'outlined'}
            disableElevation
            sx={{ minWidth: 100 }}
            onClick={() => setViewMode('monthly')}
          >
            每月营收
          </Button>
          <Button
            variant={viewMode === 'yearly' ? 'contained' : 'outlined'}
            disableElevation
            sx={{ minWidth: 80 }}
            onClick={() => setViewMode('yearly')}
          >
            近 5 年
          </Button>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 400, width: '100%', mb: 4 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>加载数据中...</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">加载数据失败: {error}</Typography>
            </Box>
          )}
          {!loading && !error && finMindData && finMindData.length > 0 && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <ComposedChart
                  data={chartData}
                  margin={{
                    top: 20, right: 30, left: 60, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    type="number"
                    scale="time"
                    tickFormatter={(tick) => formatXAxisTick(tick, viewMode)}
                    domain={['dataMin', 'dataMax']}
                    stroke="#ccc"
                    tickLine={false}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#ccc" tickFormatter={formatMonthlyRevenue} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ccc" tickFormatter={formatYoYGrowth} />
                  <Tooltip formatter={(value: number, name: string) => {
                    if (name === '每月营收') {
                      return [formatMonthlyRevenue(value), name]; // Removed '千元' from tooltip, as it's implicit by data scale
                    } else if (name === '单月营收年增率 (%)') {
                      return [formatYoYGrowth(value), name];
                    }
                    return [value, name];
                  }} />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ top: 0, right: 0 }} />
                  <Bar yAxisId="left" dataKey="monthlyRevenue" fill="#ffc658" name="每月营收" />
                  <Line yAxisId="right" type="monotone" dataKey="yoyGrowth" stroke="#DC3545" name="单月营收年增率 (%)" strokeWidth={2} />
                </ComposedChart>
                <Typography variant="caption" sx={{ position: 'absolute', top: 0, left: 0, ml: 2, mt: 1 }}>千元</Typography>
                <Typography variant="caption" sx={{ position: 'absolute', top: 0, right: 0, mr: 2, mt: 1 }}>%</Typography>
              </Box>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">暂无数据</Typography>
            </Box>
          )}
        </Box>

        {/* Detailed Data Section */}
        <Button variant="contained" disableElevation sx={{ mb: 2 }}>详细数据</Button>
        <TableContainer component={Card} sx={{ borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>年度月份</TableCell>
                {rawTableData.map((data: TableDisplayData, index: number) => (
                  <TableCell key={index} align="right">{data.yearMonth}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>每月营收</TableCell>
                {rawTableData.map((data: TableDisplayData, index: number) => (
                  <TableCell key={index} align="right">{data.monthlyRevenue}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>单月营收年增率 (%)</TableCell>
                {rawTableData.map((data: TableDisplayData, index: number) => (
                  <TableCell key={index} align="right">{data.yoyGrowth}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'right', color: 'text.secondary', fontSize: '0.8rem', mt: 4 }}>
        <Typography variant="caption" display="block">图表单位：千元，数据来自公开资讯观测站</Typography>
        <Typography variant="caption" display="block">网页图表欢迎转贴引用，请注明出处为财报狗</Typography>
      </Box>
    </Box>
  );
} 