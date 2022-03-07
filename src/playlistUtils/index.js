const mapPlaylistDBToModel = ({
  id,
  name,
  owner,
  username,
  songs,
}) => ({
  id,
  name,
  owner,
  username,
  songs,
});

module.exports = { mapPlaylistDBToModel };
