import express from "express";
import {getMovies,searchMovies,addMovie,updateMovie,deleteMovie} from "../controllers/movieController";
import { authenticate,authorizeAdmin } from "../middlewares/authentication";
const router = express.Router();

router.post(
  "/movies",
  authenticate,
  authorizeAdmin,
  addMovie
);
router.get("/movies", getMovies);
router.get("/search",  searchMovies);
router.put("/movies/:id", authenticate,authorizeAdmin, updateMovie);
router.delete("/movies/:id", authenticate,authorizeAdmin, deleteMovie);


export default router;
