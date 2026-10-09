require "faraday"

class ReceiptParserService
  MAX_TEXT_CHARS = 6_000
  API_BASE = "https://generativelanguage.googleapis.com/v1beta/"

  SYSTEM_PROMPT = <<~PROMPT
    You are a receipt-parsing assistant. You receive raw OCR text extracted from a
    photographed receipt or invoice, which may contain OCR noise, misreads, and
    Turkish characters. Extract the purchase details.

    Pick "category" from exactly this list: #{Receipt::CATEGORIES.join(', ')}.
    Use "purchased_on" in YYYY-MM-DD format, or null if no date is present.
    Use "amount" as the final total paid (a plain number, no currency symbol).
    Use "currency" as a 3-letter ISO code (default to "TRY" if unclear).
    If a field truly cannot be determined, use null for it.

    Respond with JSON matching exactly this shape:
    {
      "merchant_name": "string or null",
      "amount": 0.0,
      "currency": "TRY",
      "purchased_on": "YYYY-MM-DD or null",
      "category": "one of the allowed categories"
    }
  PROMPT

  def initialize(model: ENV.fetch("GEMINI_MODEL", "gemini-2.5-flash"))
    @api_key = ENV.fetch("GEMINI_API_KEY")
    @model = model
  end

  def parse(raw_text)
    truncated = raw_text.to_s.first(MAX_TEXT_CHARS)

    response = connection.post("models/#{@model}:generateContent") do |req|
      req.params["key"] = @api_key
      req.body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: "OCR text:\n\n#{truncated}" }] }],
        generationConfig: { response_mime_type: "application/json" }
      }
    end

    raise "Gemini API error (#{response.status}): #{response.body}" unless response.success?

    content = response.body.dig("candidates", 0, "content", "parts", 0, "text")
    JSON.parse(content)
  end

  private

  def connection
    Faraday.new(url: API_BASE) do |f|
      f.request :json
      f.response :json
      f.adapter Faraday.default_adapter
    end
  end
end
