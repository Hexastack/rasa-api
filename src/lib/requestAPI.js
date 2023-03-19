import fetch from 'node-fetch';

export default function ({ baseUrl, headers, params }) {
  return async function ({ method = 'GET', uri, body = null, qs = {} }) {
    const url = `${baseUrl}${uri}?${new URLSearchParams({
      ...params,
      ...qs,
    })}`;
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null, 
      });
      
      const data = await response.json();

      if (response && response.status != '200') {
        const err = new Error(data.error || data.body);
        err.code = data.code;
        throw err;
      }
      
      return data;
    } catch(error) {
      console.error(`Rasa API : Request failed`, error)
      throw error;
    }
  };
};
