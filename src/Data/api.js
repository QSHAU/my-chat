import axios from 'axios';

const api = axios.create({
	baseURL: "http://172.120.0.29:1337/api/",
	withCredentials: false,
});

api.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
	return config;
});

api.interceptors.response.use(
	(config) => {
		return config;
	},
	async (err) => {
		const originalRequest = err.config;
		if (err?.response?.status == 401 && err?.config && !err?.config?._isRetry) {
			originalRequest._isRetry = true;
			try {
				
				const response = await axios.post(`http://172.120.0.29:1337/api/auth/refresh`, { refreshToken: localStorage.getItem('refreshToken')});
                if(response.data.access_token) localStorage.setItem('token', response.data.access_token);
				return api.request(originalRequest);
			} catch (error) {
				console.log("You aren't authorizated");
			}
		}
		throw err;
	}
);

export default api;