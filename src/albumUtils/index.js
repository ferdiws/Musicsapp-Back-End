const mapAlbumDBToModel = ({
  id,
  name,
  year,
  songs,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  songs,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapAlbumDBToModel };
