class ReceiptOcrService
  LANG = "tur+eng"

  def initialize(receipt)
    @receipt = receipt
  end

  def extract_text
    @receipt.image.open do |file|
      RTesseract.new(file.path, lang: LANG).to_s
    end
  end
end
