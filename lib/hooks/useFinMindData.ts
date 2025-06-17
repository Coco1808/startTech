import { useState, useEffect } from 'react';

interface FinMindDataResponse {
  msg: string;
  status: number;
  data: any[]; // Adjust this type based on actual API response
}

interface FinMindQueryParams {
  dataset: string;
  data_id: string;
  start_date?: string;
  end_date?: string;
  token?: string; // Optional token for higher usage limits
}

const API_BASE_URL = 'https://api.finmindtrade.com/api/v4/data';

export function useFinMindData(dataId: string, startDate?: string, endDate?: string, dataset: string = 'TaiwanStockMonthRevenue', token?: string) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const urlParams = new URLSearchParams();
        urlParams.append('dataset', dataset);
        urlParams.append('data_id', dataId);
        if (startDate) urlParams.append('start_date', startDate);
        if (endDate) urlParams.append('end_date', endDate);
        if (token) urlParams.append('token', token);

        const url = `${API_BASE_URL}?${urlParams.toString()}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: FinMindDataResponse = await response.json();

        if (result.status === 200 && result.data) {
          console.log("useFinMindData: Data fetched successfully, attempting to set state:", result.data);
          setData(result.data);
          console.log("useFinMindData: Data successfully set in state.");
        } else {
          setError(result.msg || 'Failed to fetch data');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataId, startDate, endDate, dataset, token]);

  return { data, loading, error };
} 