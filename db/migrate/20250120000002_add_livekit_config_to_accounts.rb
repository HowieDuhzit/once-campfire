class AddLivekitConfigToAccounts < ActiveRecord::Migration[8.1]
  def change
    add_column :accounts, :livekit_api_key, :string, null: true
    add_column :accounts, :livekit_api_secret, :string, null: true
    add_column :accounts, :livekit_host, :string, null: true
    add_column :accounts, :livekit_http_url, :string, null: true
    add_column :accounts, :livekit_enabled, :boolean, default: false, null: false
    
    add_index :accounts, :livekit_enabled
  end
end

