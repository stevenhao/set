

class AIAssistant {
  constructor() {
    this.apiEndpoint = 'http://localhost:3001/api';
    this.messageHistory = [];
  }

  async getHint(cards, selected) {
    try {
      const response = await fetch(`${this.apiEndpoint}/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards, selected }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.messageHistory.push({
        role: 'assistant',
        content: data.message
      });
      
      return data.message;
    } catch (error) {
      console.error("Error getting hint:", error);
      return "I'm having trouble analyzing the game right now. Try again later.";
    }
  }
  
  async explainSet(cards, indices) {
    try {
      const response = await fetch(`${this.apiEndpoint}/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cards, indices }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.messageHistory.push({
        role: 'assistant',
        content: data.message
      });
      
      return data.message;
    } catch (error) {
      console.error("Error explaining set:", error);
      return "I'm having trouble analyzing your selection right now. Try again later.";
    }
  }
  
  async getStrategyTip() {
    try {
      const response = await fetch(`${this.apiEndpoint}/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      this.messageHistory.push({
        role: 'assistant',
        content: data.message
      });
      
      return data.message;
    } catch (error) {
      console.error("Error getting strategy tip:", error);
      return "I'm having trouble generating a strategy tip right now. Try again later.";
    }
  }
  
  clearHistory() {
    this.messageHistory = [];
  }
}

window.AIAssistant = AIAssistant;
