class ExportsHandler {
  constructor(playlistsService, producerService, validator) {
    this._playlistsService = playlistsService;
    this._producerService = producerService;
    this._validator = validator;

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

  async postExportSongsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);

    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistIsExist(playlistId);
    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      playlistId,
      userId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

module.exports = ExportsHandler;
