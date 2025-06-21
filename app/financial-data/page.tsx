'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Card, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, InputAdornment, CircularProgress, MenuItem, Select, FormControl, InputLabel, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PERIOD_OPTIONS = [
  { label: '近 1 年', value: 12 },
  { label: '近 3 年', value: 36 },
  { label: '近 5 年', value: 60 },
  //{ label: '全部', value: 9999 },
];

export default function FinancialDataPage() {
  const [allStocks, setAllStocks] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any | null>({ stock_id: '2867', stock_name: '三商壽' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(PERIOD_OPTIONS[2].value); // 默认近5年
  const [showYoyLine, setShowYoyLine] = useState(true);

  // 获取所有股票列表
  useEffect(() => {
    fetch('https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo')
      .then(res => res.json())
      .then(res => {
        if (res.status === 200 && Array.isArray(res.data)) {
          // 关键：去重，防止 'duplicate key' 报错
          const uniqueStocks = Array.from(new Map(res.data.map((item: any) => [item.stock_id, item])).values());
          setAllStocks(uniqueStocks);
        }
      });
  }, []);

  // 根据选择的股票获取营收数据
  useEffect(() => {
    if (!selectedStock?.stock_id) return;

    setLoading(true);
    setError(null);
    fetch(`https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockMonthRevenue&data_id=${selectedStock.stock_id}&start_date=2015-01-01`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200 && Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]); // 清空旧数据
          setError(res.msg || '请求营收数据失败');
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedStock]);

  // 处理图表和表格数据
  const processed = React.useMemo(() => {
    if (!data.length) return { chartData: [], tableData: [] };
    const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const chartData = sorted.map((item, idx, arr) => {
      const date = new Date(item.date);
      const revenue = parseFloat(item.revenue);
      const lastYear = date.getFullYear() - 1;
      const lastYearMonth = arr.find(d => {
        const dDate = new Date(d.date);
        return dDate.getFullYear() === lastYear && dDate.getMonth() === date.getMonth();
      });
      const lastYearRevenue = lastYearMonth ? parseFloat(lastYearMonth.revenue) : null;
      let yoy = null;
      if (lastYearRevenue && lastYearRevenue !== 0) {
        yoy = ((revenue / lastYearRevenue - 1) * 100);
      }
      return {
        date: item.date,
        yearMonth: `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}`,
        revenue,
        yoy,
      };
    });
    const filtered = chartData.slice(-period);
    const tableData = filtered.map(d => ({
      yearMonth: d.yearMonth,
      revenue: d.revenue ? d.revenue.toLocaleString() : '--',
      yoy: d.yoy !== null && d.yoy !== undefined ? d.yoy.toFixed(2) : '--',
    }));
    return { chartData: filtered, tableData };
  }, [data, period]);

  return (
    <Box sx={{ p: 4, bgcolor: '#f0f2f5', minHeight: '100vh' }}>
      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Autocomplete
          options={allStocks}
          getOptionLabel={(option) => `${option.stock_id} ${option.stock_name}` || ''}
          value={selectedStock}
          onChange={(event, newValue) => {
            setSelectedStock(newValue);
          }}
          isOptionEqualToValue={(option, value) => option.stock_id === value.stock_id}
          renderInput={(params) => (
            <TextField {...params} label="输入台 / 美股代号，查看公司价值" variant="outlined" />
          )}
          sx={{ width: '600px', bgcolor: 'white', borderRadius: 1 }}
          noOptionsText="无此股票"
        />
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 3, marginBottom:'10px', backgroundColor:'#fff', padding:'15px 20px',borderRadius: 2 }}>
          {selectedStock ? `${selectedStock.stock_name} (${selectedStock.stock_id})` : '请选择股票'}
        </Typography>
      {/* Company Data Card */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: 3 }}>
        

        {/* Monthly Revenue Section + 下拉选单 + 切换按钮 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Button
              variant={!showYoyLine ? "contained" : "outlined"}
              disableElevation
              onClick={() => setShowYoyLine(false)}
              sx={{ mr: 1 }}
            >
              每月营收
            </Button>
            <Button
              variant={showYoyLine ? "contained" : "outlined"}
              disableElevation
              onClick={() => setShowYoyLine(true)}
            >
              全部
            </Button>
          </Box>
          <FormControl size="small">
            <InputLabel>区间</InputLabel>
            <Select
              value={period}
              label="区间"
              onChange={e => setPeriod(Number(e.target.value))}
              sx={{ minWidth: 100 }}
            >
              {PERIOD_OPTIONS.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Chart */}
        <Box sx={{ height: 400, width: '100%', mb: 4, bgcolor: '#fff', borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={processed.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="yearMonth" tick={{ fontSize: 14 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#ffc658"
                  tickFormatter={v => (typeof v === 'number' && !isNaN(v) ? v.toLocaleString() : '')}
                  label={{ value: '千元', angle: 0, position: 'top', fontSize: 16, offset: 10, dy: 10 }}
                  tick={{ fontSize: 14 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#c44d58"
                  domain={[4, 13]}
                  tickFormatter={v => (typeof v === 'number' && !isNaN(v) ? v.toFixed(1) + '%' : '')}
                  label={{ value: '%', angle: 90, position: 'insideRight', fontSize: 16 }}
                  tick={{ fontSize: 14 }}
                />
                <Tooltip formatter={(value, name) => {
                  if (name === '每月营收') return [Number(value).toLocaleString(), name];
                  if (name === '单月营收年增率 (%)') return [`${Number(value).toFixed(2)}%`, name];
                  return [value, name];
                }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#ffc658" name="每月营收" barSize={16} />
                {showYoyLine && (
                  <Line yAxisId="right" type="monotone" dataKey="yoy" stroke="#c44d58" strokeWidth={3} dot={false} name="单月营收年增率 (%)" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </Box>

        {/* Data Table */}
        <Button variant="contained" disableElevation sx={{ mb: 2 }}>详细数据</Button>
        <TableContainer component={Card} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>年度月份</TableCell>
                <TableCell align="right">每月营收</TableCell>
                <TableCell align="right">单月营收年增率 (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processed.tableData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.yearMonth}</TableCell>
                  <TableCell align="right">{row.revenue}</TableCell>
                  <TableCell align="right">{row.yoy}</TableCell>
                </TableRow>
              ))}
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
