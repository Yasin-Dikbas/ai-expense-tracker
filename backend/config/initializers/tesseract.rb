require "rtesseract"

# Default install path on Windows; override with TESSERACT_PATH if tesseract
# isn't on PATH or lives somewhere else (e.g. /usr/bin/tesseract on Linux/macOS).
default_command = if ENV["TESSERACT_PATH"].presence
  ENV["TESSERACT_PATH"]
elsif File.exist?("C:/Program Files/Tesseract-OCR/tesseract.exe")
  "C:/Program Files/Tesseract-OCR/tesseract.exe"
else
  "tesseract"
end

RTesseract.configure { |config| config.command = default_command }
