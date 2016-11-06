// export const apiUrl = 'http://192.168.56.1:3000/api';
export const apiUrl = 'http://192.168.56.1:3000/api';
export const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
export const authHeaders = (token) => ({...headers, 'Authorization': `Bearer ${token}`});
