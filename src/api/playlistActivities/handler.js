const ClientError = require('../../exceptions/ClientError');

class ActivitiesHandler {
  constructor(activitiesService, playlistsService, validator) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistOwner(id, credentialId);
      const playlistId = id;
      const activities = await this._activitiesService.getActivities(id);

      const response = h.response({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ActivitiesHandler;
