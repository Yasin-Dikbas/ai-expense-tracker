module Api
  class StatsController < ApplicationController
    MONTHS_BACK = 6

    # GET /api/stats/summary
    def summary
      completed = current_user.receipts.completed.where.not(purchased_on: nil)

      render json: {
        monthly: monthly_totals(completed),
        by_category: category_totals(completed)
      }
    end

    private

    def monthly_totals(receipts)
      range_start = MONTHS_BACK.months.ago.to_date.beginning_of_month
      totals = Hash.new(0)

      receipts.where(purchased_on: range_start..)
        .pluck(:purchased_on, :amount)
        .each { |date, amount| totals[date.beginning_of_month.strftime("%Y-%m")] += amount }

      (0...MONTHS_BACK).map do |i|
        key = (range_start + i.months).strftime("%Y-%m")
        { month: key, total: totals[key] }
      end
    end

    def category_totals(receipts)
      receipts.group(:category).sum(:amount).map do |category, total|
        { category: category, total: total }
      end
    end
  end
end
