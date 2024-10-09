import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js'; 
import {
    getStories,
    getStoryById,
    createStory,
    deleteStory,
    likeStory,
    dislikeStory,
    loveStory,
    updateStory
} from '../controllers/storyController.js';


const router = Router();

// Route to create a new story
router.post('/create', authMiddleware, createStory);

// Route to delete a story by ID
router.delete('/delete/:id', authMiddleware, deleteStory);

// Route to get all stories
router.get('/', getStories);

// Route to get a story by ID
router.get('/:id', getStoryById); // Separate route for getting a specific story by ID


// Route to like a story
router.post('/like/:id', authMiddleware, likeStory);

// Route to dislike a story
router.post('/dislike/:id', authMiddleware, dislikeStory);

// Route to "love" a story
router.post('/love/:id', authMiddleware, loveStory);

// Route to get story choices
router.get('/choices/:id', authMiddleware, getStoryById);

// Route to update a story
router.put('/edit/:id',authMiddleware, updateStory);

export default router;
