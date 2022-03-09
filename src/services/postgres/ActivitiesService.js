const { Pool } = require('pg');

class ActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async getActivities(playlistId) {
    const query = {
      text: `SELECT songs.title, playlist_song_activities.action, playlist_song_activities.time, users.username 
      FROM songs LEFT JOIN playlist_song_activities ON 
      playlist_song_activities.song_id = songs.id RIGHT JOIN users ON
      playlist_song_activities.user_id = users.id WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };
    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = ActivitiesService;
