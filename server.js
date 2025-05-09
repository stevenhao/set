const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001; // Use 3001 to avoid conflict with http-server

const OPENAI_API_KEY = process.env.STEVEN_OPENAI_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/hint', async (req, res) => {
  try {
    const { cards, selected } = req.body;
    
    const formattedCards = cards.map((card, index) => {
      return {
        index,
        attributes: card,
        selected: selected.includes(index)
      };
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for the Set card game. Your goal is to help players find sets without directly telling them the answer."
        },
        {
          role: "user",
          content: `I'm playing the Set card game. Here are the cards on the table: ${JSON.stringify(formattedCards)}. 
                   Can you give me a hint about where to look for a set without directly telling me the answer?`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });
    
    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Error getting hint:', error);
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

app.post('/api/explain', async (req, res) => {
  try {
    const { cards, indices } = req.body;
    
    const selectedCards = indices.map(i => cards[i]);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for the Set card game. Your goal is to explain why selected cards form a valid set or not."
        },
        {
          role: "user",
          content: `I selected these cards in the Set game: ${JSON.stringify(selectedCards)}. 
                   Can you explain if they form a valid set and why or why not?`
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });
    
    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Error explaining set:', error);
    res.status(500).json({ error: 'Failed to explain set' });
  }
});

app.post('/api/strategy', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for the Set card game. Your goal is to provide helpful strategy tips for finding sets more efficiently."
        },
        {
          role: "user",
          content: "Can you give me a general strategy tip for finding sets more efficiently in the Set card game?"
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });
    
    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Error getting strategy tip:', error);
    res.status(500).json({ error: 'Failed to get strategy tip' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
