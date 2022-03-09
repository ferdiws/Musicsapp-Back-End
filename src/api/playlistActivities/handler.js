class ActivitiesHandler {
  constructor(activitiesService, playlistsService) {
    this._activitiesService = activitiesService;
    this._playlistsService = playlistsService;

    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(request, h) {
    const { id } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(id, owner);
    const activities = await this._activitiesService.getActivities(id);

    const response = h.response({
      status: 'success',
      data: {
        playlistId: id,
        activities,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ActivitiesHandler;
