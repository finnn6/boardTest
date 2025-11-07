import ky from 'ky'

const api = ky.create({
  prefixUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  // headers: {
  //   'Content-Type': 'application/json'
  // },
  timeout: 10000,
  retry: 0,
  hooks: {
    beforeRequest: [
      request => {
        const token = localStorage.getItem('access_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ],
  }
})

export default api