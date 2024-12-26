import { createClient } from 'redis';

const client = createClient();
import dotenv from "dotenv";
dotenv.config();

// Initialize Redis client and handle connection error
client.on('error', (err) => {
  console.error('Redis error:', err);
});

async function initializeRedis() {
  try {
    await client.connect(); // Ensure the client is connected
    console.log('Redis connected successfully');
  } catch (err) {
    console.error('Error connecting to Redis:', err);
  }
}
initializeRedis()

const { CACHE_TTL } = process.env;  // Get cache TTL from environment variables

/**
 * Retrieves data from Redis cache
 * @param {string} key - The key to fetch data from Redis
 * @returns {Promise<any>} - A promise that resolves with the cached data or null if not found
 */
const getFromCache = async (key: string): Promise<any> => {
  try {
    const data = await client.get(key);
    // Parse the data if found, otherwise return null
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error fetching from Redis:', err);
    throw err;  // Throw error to propagate it up the call stack
  }
};

/**
 * Sets data in Redis cache with a Time-To-Live (TTL)
 * @param {string} key - The key under which the data should be stored
 * @param {any} value - The data to be stored in the cache
 * @returns {Promise<void>} - A promise that resolves when the data is successfully set in the cache
 */
const setInCache = async (key: string, value: any): Promise<void> => {
  try {
    console.log('aaaaaaa',CACHE_TTL)
    // Set the key-value pair with TTL from environment variables
    await client.setEx(key, Number(CACHE_TTL), JSON.stringify(value));
  } catch (err) {
    console.error('Error setting to Redis:', err);
    throw err;  // Throw error to propagate it up the call stack
  }
};

/**
 * Deletes a key from Redis cache
 * @param {string} key - The key to be deleted from Redis
 * @returns {Promise<void>} - A promise that resolves when the key is deleted from the cache
 */
const deleteFromCache = async (key: string): Promise<void> => {
  try {
    // Delete the key from Redis cache
    await client.del(key);
  } catch (err) {
    console.error('Error deleting from Redis:', err);
    throw err;  // Throw error to propagate it up the call stack
  }
};

// Export the Redis client and helper functions to be used in other parts of the application
export { client, getFromCache, setInCache, deleteFromCache };
