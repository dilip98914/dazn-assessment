import { Request, Response } from "express";
import movieModel from "../models/movieModel";
import { getFromCache, setInCache, deleteFromCache } from "../utils/redis";

/**
 * Get all movies
 * This function checks if the movies data is cached. If it is, it returns the cached data,
 * otherwise, it fetches the data from the database, caches it, and then returns it.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const getMovies = async (req: Request, res: Response): Promise<any> => {
  try {
    const cachedMovies = await getFromCache('movies');
    if (cachedMovies) return res.json(cachedMovies);

    const movies = await movieModel.find();
    await setInCache('movies', movies);
    res.json(movies);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch movies', details: (err as any).message });
  }
};

/**
 * Search for movies by title or genre
 * This function checks if the search query results are cached. If they are, it returns the cached results,
 * otherwise, it queries the database, caches the results, and returns them.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const searchMovies = async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query.q?.toString();
    if (!query) return res.status(400).json({ error: 'Query parameter required' });

    const cacheKey = `search:${query}`;
    const cachedMovies = await getFromCache(cacheKey);
    if (cachedMovies) return res.json(cachedMovies);

    const movies = await movieModel.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { genre: new RegExp(query, 'i') },
      ],
    });

    await setInCache(cacheKey, movies);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search movies', details: (err as any).message });
  }
};

/**
 * Add a new movie to the database
 * This function creates a new movie record, saves it to the database, and invalidates the cache.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const addMovie = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, genre, rating, streamingLink } = req.body;
    if(!title || !genre || !rating || !streamingLink) return res.status(400).json({success:false,message:'one or more fields are missing!'});
    const movieCreated = new movieModel({ title, genre, rating, streamingLink });
    await movieCreated.save();

    await deleteFromCache('movies'); // Invalidate the cache

    res.status(201).json(movieCreated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie', success:false });
  }
};

/**
 * Update an existing movie
 * This function updates an existing movie by its ID, then invalidates the cache for the movie list and specific search cache.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const updateMovie = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, genre, rating, streamingLink } = req.body;

    const movieUpdated = await movieModel.findByIdAndUpdate(
      id,
      { title, genre, rating, streamingLink },
      { new: true }
    );

    if (!movieUpdated) return res.status(404).json({ error: 'Movie not found' });

    await deleteFromCache('movies'); // Invalidate the cache
    const cacheKey = `search:${title}`;
    await deleteFromCache(cacheKey); // Invalidate specific search cache

    res.json(movieUpdated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update movie', details: (err as any).message });
  }
};

/**
 * Delete a movie by its ID
 * This function deletes the movie record from the database and invalidates the cache.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteMovie = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const movieDeleted = await movieModel.findByIdAndDelete(id);
    if (!movieDeleted) return res.status(404).json({ error: 'Movie not found' });

    await deleteFromCache('movies'); // Invalidate the cache

    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie', details: (err as any).message });
  }
};
