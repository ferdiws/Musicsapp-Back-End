const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async likeAlbum(userId, albumId) {
    const id = `likes-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`cache:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal ditambahkan');
    }
  }

  async unlikeAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);
    await this._cacheService.delete(`cache:${albumId}`);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal dihapus');
    }
  }

  async checkLike(userId, albumId) {
    const query = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async isAlbumAvailable(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async getLikeCount(albumId) {
    try {
      const result = await this._cacheService.get(`cache:${albumId}`);
      const jsonResult = JSON.parse(result);
      const response = {
        like: jsonResult,
        header: 'cache',
      };
      return response;
    } catch (error) {
      const query = {
        text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rowCount;
      const response = {
        like: mappedResult,
        header: 'no-cache',
      };

      await this._cacheService.set(`cache:${albumId}`, JSON.stringify(mappedResult));

      return response;
    }
  }
}

module.exports = LikesService;
