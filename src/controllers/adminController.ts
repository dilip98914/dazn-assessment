import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

/**
 * Handles the admin login by verifying the provided keys and generating a JWT token for the admin user.
 * The function compares the provided keys (`key` and `secret`) with the environment variables 
 * (`ADMIN_ACCESS_KEY` and `ADMIN_SECRET_KEY`). If they match, a JWT access token is generated
 * with an expiration time of 1 hour.
 * 
 * @param {Request} req - Express request object containing the `key` and `secret` in the body.
 * @param {Response} res - Express response object used to send the result back to the client.
 * 
 * @returns {Promise<Response>} - Returns a response with a success message and the generated JWT token if authentication is successful.
 * If the provided keys do not match, or if an error occurs, an appropriate error message is returned.
 */
export const loginAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    // Destructuring `key` and `secret` from the request body
    let { key, secret } = req.body;

    // Checking if the provided keys match the expected values stored in environment variables
    if (key === process.env.ADMIN_ACCESS_KEY && secret === process.env.ADMIN_SECRET_KEY) {
      // Generating a JWT token with an expiry of 1 hour
      const secret=process.env.SECRET_KEY;
      const accessToken = await jwt.sign(
        { key, role: 'admin' }, // Payload: Including `key` and role
        secret || 'secret', // Secret key for signing the JWT (ideally this should come from env variables)
        { expiresIn: '1h' } // Setting the expiration time of the token to 1 hour
      );

      // Returning a success response with the generated JWT token
      return res.status(200).send({
        success: true,
        data: accessToken,
        message: 'Successfully logged in!'
      });
    } else {
      // If the keys don't match, return a 401 Unauthorized response
      return res.status(401).send({
        success: false,
        data: null,
        message: 'Invalid credentials'
      });
    }
  } catch (err) {
    // Catching any unexpected errors and returning a 500 Internal Server Error response
    console.error(err);
    return res.status(500).send({
      success: false,
      data: null,
      message: 'Something went wrong!'
    });
  }
};
