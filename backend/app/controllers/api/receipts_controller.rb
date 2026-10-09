module Api
  class ReceiptsController < ApplicationController
    before_action :set_receipt, only: [:show, :destroy, :retry]

    # GET /api/receipts
    def index
      receipts = current_user.receipts.order(created_at: :desc)
      render json: receipts.map { |receipt| receipt_json(receipt) }
    end

    # GET /api/receipts/:id
    def show
      render json: receipt_json(@receipt)
    end

    # POST /api/receipts
    def create
      receipt = current_user.receipts.build
      receipt.image.attach(params.require(:image))

      if receipt.save
        AnalyzeReceiptJob.perform_later(receipt.id)
        render json: receipt_json(receipt), status: :created
      else
        render json: { errors: receipt.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/receipts/:id
    def destroy
      @receipt.destroy
      head :no_content
    end

    # POST /api/receipts/:id/retry
    def retry
      unless @receipt.failed?
        return render json: { error: "Only failed receipts can be retried" }, status: :unprocessable_entity
      end

      @receipt.update!(status: :pending, error_message: nil)
      AnalyzeReceiptJob.perform_later(@receipt.id)
      render json: receipt_json(@receipt)
    end

    private

    def set_receipt
      @receipt = current_user.receipts.find(params[:id])
    end

    def receipt_json(receipt)
      {
        id: receipt.id,
        status: receipt.status,
        merchant_name: receipt.merchant_name,
        amount: receipt.amount,
        currency: receipt.currency,
        purchased_on: receipt.purchased_on,
        category: receipt.category,
        error_message: receipt.error_message,
        image_url: receipt.image.attached? ? url_for(receipt.image) : nil,
        created_at: receipt.created_at
      }
    end
  end
end
