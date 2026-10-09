class CreateReceipts < ActiveRecord::Migration[8.1]
  def change
    create_table :receipts do |t|
      t.references :user, null: false, foreign_key: true
      t.string :merchant_name
      t.decimal :amount, precision: 10, scale: 2
      t.string :currency, default: "TRY", null: false
      t.date :purchased_on
      t.string :category
      t.string :status, default: "pending", null: false
      t.text :raw_text
      t.text :error_message

      t.timestamps
    end

    add_index :receipts, :status
    add_index :receipts, :purchased_on
  end
end
