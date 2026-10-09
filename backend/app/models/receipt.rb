class Receipt < ApplicationRecord
  CATEGORIES = %w[groceries dining transport utilities entertainment shopping health travel other].freeze

  belongs_to :user
  has_one_attached :image

  enum :status, { pending: "pending", processing: "processing", completed: "completed", failed: "failed" },
    default: "pending", validate: true

  validates :category, inclusion: { in: CATEGORIES }, allow_nil: true

  scope :for_month, ->(date) { where(purchased_on: date.beginning_of_month..date.end_of_month) }
end
