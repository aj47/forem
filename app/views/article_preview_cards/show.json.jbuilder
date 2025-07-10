json.extract!(
  @article,
  :id, :title, :description, :reading_time, :published_at, :comments_count, :public_reactions_count
)

json.url URL.article(@article)
json.cover_image cloud_cover_url(@article.main_image) if @article.main_image.present?
json.tag_list @article.cached_tag_list_array
json.body_preview truncate(strip_tags(@article.processed_html), length: 200)

json.user do
  json.extract!(@article.user, :id, :name, :username)
  json.profile_image_90 @article.user.profile_image_90
end

if @article.organization
  json.organization do
    json.extract!(@article.organization, :id, :name, :slug)
    json.profile_image_90 @article.organization.profile_image_90
  end
end

json.created_at utc_iso_timestamp(@article.published_at)
