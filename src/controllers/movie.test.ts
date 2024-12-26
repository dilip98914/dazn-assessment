import request from 'supertest';
import app from '../app';

jest.mock('redis', () => {
  return {
    createClient: () => ({
      connect: jest.fn().mockResolvedValue(undefined),  // Mock connect
      get: jest.fn().mockResolvedValue(null),  // Mock get
      setEx: jest.fn().mockResolvedValue(undefined),  // Mock setEx
      del: jest.fn().mockResolvedValue(undefined),  // Mock del
      on: jest.fn(),  // Mock 'on' for error handling
    }),
  };
});

describe('Movies API', () => {
  // Test for fetching movies with pagination
  it('should fetch movies with pagination', async () => {
    // Mock the Redis get method to simulate a cache miss and return empty data
    const mockMovies = [
      { title: 'Inception', genre: 'Sci-Fi', rating: 8.8, streamingLink: 'http://example.com' },
      { title: 'The Dark Knight', genre: 'Action', rating: 9.0, streamingLink: 'http://example.com' }
    ];

    // Set the mocked response in Redis
    const redisClient = require('redis').createClient();
    redisClient.get.mockResolvedValueOnce(null); // Simulate cache miss

    // Mock the movie model or database method to return the data
    const response = await request(app).get('/movies?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // Ensure correct pagination (limit)
    expect(response.body).toEqual(mockMovies); // Ensure the movies returned match the mock
  });

  // Test for searching movies
  it('should search movies by query', async () => {
    // Mock the Redis get method to simulate a cache miss and return empty data
    const mockMovies = [
      { title: 'Inception', genre: 'Sci-Fi', rating: 8.8, streamingLink: 'http://example.com' }
    ];

    const redisClient = require('redis').createClient();
    redisClient.get.mockResolvedValueOnce(null); // Simulate cache miss

    // Simulate search for 'action' genre or title
    const response = await request(app).get('/movies/search?q=action&page=1&limit=2');
    
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0); // Ensure we get some results
  });

  // Test for adding a new movie
  it('should add a new movie', async () => {
    const newMovie = { title: 'Inception', genre: 'Sci-Fi', rating: 8.8, streamingLink: 'http://example.com' };

    // Make the POST request
    const response = await request(app)
      .post('/movies')
      .send(newMovie);

    expect(response.status).toBe(201); // Ensure the movie was created
    expect(response.body.title).toBe('Inception'); // Check if title matches
    expect(response.body.genre).toBe('Sci-Fi'); // Check genre
  });

  // Test for updating a movie
  it('should update a movie', async () => {
    const movieId = 'existingMovieId';
    const updatedMovie = { title: 'Inception Updated', genre: 'Sci-Fi', rating: 9, streamingLink: 'http://newlink.com' };

    // Make the PUT request
    const response = await request(app)
      .put(`/movies/${movieId}`)
      .send(updatedMovie);

    expect(response.status).toBe(200); // Ensure the movie was updated
    expect(response.body.title).toBe('Inception Updated'); // Ensure the updated title
  });

  // Test for deleting a movie
  it('should delete a movie', async () => {
    const movieId = 'existingMovieId';

    // Make the DELETE request
    const response = await request(app)
      .delete(`/movies/${movieId}`);

    expect(response.status).toBe(200); // Ensure the movie was deleted
    expect(response.body.message).toBe('Movie deleted successfully'); // Ensure success message
  });
});
