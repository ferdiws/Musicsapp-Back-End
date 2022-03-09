const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapPlaylistDBToModel } = require('../../playlistUtils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
  }

  async addSongToPlaylist({
    id, songId, credentialId,
  }) {
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const newId = nanoid(16);
    const activityId = nanoid(16);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [newId, id, songId],
    };

    const activitiesQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, NOW()) RETURNING id',
      values: [activityId, id, songId, credentialId, 'add'],
    };

    const result = await this._pool.query(query);
    await this._pool.query(activitiesQuery);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async searchSongById(songId) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, album_id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }

  async searchPlaylistById(playlistId) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
  }

  async getSongsFromPlaylist(id, userId) {
    await this._playlistsService.verifyPlaylistIsExist(id);
    await this._playlistsService.verifyPlaylistAccess(id, userId);
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapPlaylistDBToModel)[0];
  }

  async getSongsForPlaylist(id) {
    const query = {
      text: `SELECT songs.id, title, performer FROM songs
      LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id
      WHERE playlistsongs.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylistById(id, songId, credentialId) {
    await this._playlistsService.verifyPlaylistIsExist(id);
    await this._playlistsService.verifyPlaylistAccess(id, credentialId);

    const activityId = nanoid(16);

    const activitiesQuery = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, NOW()) RETURNING id',
      values: [activityId, id, songId, credentialId, 'delete'],
    };

    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [id, songId],
    };

    const result = await this._pool.query(query);
    await this._pool.query(activitiesQuery);

    if (!result) {
      throw new NotFoundError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;
