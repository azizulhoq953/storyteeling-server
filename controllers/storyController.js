import Story from '../models/Story.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';
export const createStory = async (req, res) => {
    const { title, content, choices } = req.body;

    // Validate required fields
    if (!title || !content || !choices || !Array.isArray(choices)) {
        return res.status(400).json({ error: 'Title, content, and choices (array) are required' });
    }


    console.log('Received data:', { title, content, choices });

    try {
        
        const formattedChoices = choices.map(choice => {
            if (!choice.optionText || !choice.pathContent) {
                throw new Error('Each choice must have both "optionText" and "pathContent"');
            }
            return {
                optionText: choice.optionText,
                pathContent: choice.pathContent
            };
        });

        // Create the new story document
        const newStory = new Story({
            title,
            content,
            choices: formattedChoices,
            author: req.user.id
        });

        // Save the new story in the database
        await newStory.save();

        res.status(201).json(newStory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateStory = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStory = await Story.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedStory) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.json(updatedStory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating the story', error });
    }
};




// Delete Story
export const deleteStory = async (req, res) => {
    const { id } = req.params;
    try {
        await Story.findByIdAndDelete(id);
        res.json({ message: 'Story deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Get Stories
export const getStories = async (req, res) => {
    try {
        const stories = await Story.find().populate('author');
        res.json(stories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// storyController.js
export const getStoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story.findById(id);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        res.status(200).json(story);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching story' });
    }
};


// new

export const likeStory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const story = await Story.findById(id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

        // Check if the user has already liked the story
        if (!story.lovedBy.includes(userId)) {
            story.likes += 1;
            story.lovedBy.push(userId);
            await story.save();
        }

        res.json({ likes: story.likes });
    } catch (error) {
        console.error('Error liking story:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const dislikeStory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const story = await Story.findById(id);
        if (!story) return res.status(404).json({ message: 'Story not found' });

    
        if (!story.dislikes.includes(userId)) {
            story.dislikes.push(userId);
            await story.save();
        }

        res.json({ dislikes: story.dislikes.length });
        // res.json({ dislikes: story.dislikes});
    } catch (error) {
        console.error('Error disliking story:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const loveStory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Assuming user ID is available from authMiddleware

        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        const hasLoved = story.lovedBy.includes(userId);
        
        if (hasLoved) {
            // User has already loved the story, so remove love
            story.lovedBy = story.lovedBy.filter(user => user.toString() !== userId);
            story.likes = Math.max(story.likes - 1, 0); // Ensure likes don't go below 0
        } else {
            // User has not loved the story yet, so add love
            story.lovedBy.push(userId);
            story.likes += 1;
        }

        await story.save();

        res.status(200).json({
            loves: story.likes,
            lovedByUser: !hasLoved
        });
    } catch (error) {
        console.error('Error in loveStory:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
