class AnalyzeReceiptJob < ApplicationJob
  queue_as :default

  def perform(receipt_id)
    receipt = Receipt.find(receipt_id)
    receipt.update!(status: :processing)

    raw_text = ReceiptOcrService.new(receipt).extract_text
    parsed = ReceiptParserService.new.parse(raw_text)

    receipt.update!(
      status: :completed,
      raw_text: raw_text,
      merchant_name: parsed["merchant_name"],
      amount: parsed["amount"],
      currency: parsed["currency"].presence || "TRY",
      purchased_on: parsed["purchased_on"],
      category: parsed["category"]
    )
  rescue => e
    receipt&.update(status: :failed, error_message: e.message)
    raise
  end
end
