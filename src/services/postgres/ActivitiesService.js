const { Pool } = require('pg');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async getActivities(id) {
    const query = {
      text: 'SELECT username FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = ActivitiesService;
