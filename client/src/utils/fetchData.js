/**
 * Fetches data from a given URL using the Fetch API.
 *
 * @async
 * @param {string} url - the url to fetch data from
 * @param {object} options - fetch options
 * @return {Promise<object>} - the fetched data as a JS object
 */
const fetchData = async (url, options = {}) => {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    // backend errors look like {error: {message, status}}
    const message = json?.error?.message ?? json?.message;
    throw new Error(message || `Error ${response.status} occurred`);
  }
  return json;
};

export {fetchData};
