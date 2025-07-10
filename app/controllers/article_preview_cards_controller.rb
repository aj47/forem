class ArticlePreviewCardsController < ApplicationController
  layout false

  def show
    @article = Article.published.includes(:user, :organization, :tags).find(params[:id]).decorate
  end
end
