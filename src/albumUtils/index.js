const mapAlbumDBToModel = ({
  id,
  name,
  year,
  cover_url,
  songs,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  year,
  coverUrl: cover_url,
  songs,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapAlbumDBToModel };
