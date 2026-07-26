import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Access token sẽ được gắn vào đây (in-memory, không dùng localStorage) khi
// module Auth (Giai đoạn 2) hoàn thành — xem docs/PROJECT_OVERVIEW.md mục 6.
// axiosClient.interceptors.request.use(...)
// axiosClient.interceptors.response.use(...)

export default axiosClient
