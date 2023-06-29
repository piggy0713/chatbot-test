import * as pg from "pg";
import { Sequelize } from "sequelize-cockroachdb";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  dialectModule: pg,
});

class ConversationLog {
  constructor(userId) {
    this.userId = userId;
  }

  async addEntry({ entry, speaker }) {
    try {
      await sequelize.query(
        `INSERT INTO conversations (user_id, entry, speaker) VALUES (?, ?, ?) ON CONFLICT (created_at) DO NOTHING`,
        {
          replacements: [this.userId, entry, speaker],
        }
      );
    } catch (e) {
      throw new Error(e);
    }
  }

  async getConversation({ limit }) {
    const conversation = await sequelize.query(
      `SELECT entry, speaker, created_at FROM conversations WHERE user_id = '${this.userId}' ORDER By created_at DESC LIMIT ${limit}`
    );
    const history = conversation[0] || [];

    return history
      .map((entry) => {
        return `${entry.speaker.toUpperCase()}: ${entry.entry}`;
      })
      .reverse();
  }

  async clearConversation() {
    await sequelize.query(
      `DELETE FROM conversations WHERE user_id = '${this.userId}'`
    );
  }
}

export { ConversationLog };
