class ClassifiedListingCategory < ApplicationRecord
  validates :name, presence: true, uniqueness: true
  validates :slug, presence: true, uniqueness: true
  validates :cost, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :rules, presence: true

  has_many :classified_listings, foreign_key: :classified_listing_category_id, dependent: :nullify

  scope :ordered, -> { order(:name) }
end

# Alias for backward compatibility with seeds file
ListingCategory = ClassifiedListingCategory
