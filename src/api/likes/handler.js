class LikesHandler {
  constructor(service) {
    this._service = service;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikesHandler = this.getLikesHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    let response;

    await this._service.isAlbumAvailable(id);

    const isLike = await this._service.checkLike(credentialId, id);
    if (isLike === 0) {
      await this._service.likeAlbum(credentialId, id);
      response = h.response({
        status: 'success',
        message: 'album disukai',
      });
    } else if (isLike === 1) {
      await this._service.unlikeAlbum(credentialId, id);
      response = h.response({
        status: 'success',
        message: 'album tidak disukai',
      });
    }

    response.code(201);
    return response;
  }

  async getLikesHandler(request, h) {
    const { id } = request.params;

    const likes = await this._service.getLikeCount(id);
    const response = h.response({
      status: 'success',
      data: {
        likes: likes.like,
      },
    }).header('X-Data-Source', likes.header);

    return response;
  }
}

module.exports = LikesHandler;
