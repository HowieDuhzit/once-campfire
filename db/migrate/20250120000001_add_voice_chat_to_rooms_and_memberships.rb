class AddVoiceChatToRoomsAndMemberships < ActiveRecord::Migration[8.1]
  def change
    add_column :rooms, :voice_enabled, :boolean, default: true, null: false
    add_column :memberships, :in_voice_chat_at, :datetime, null: true
    
    add_index :memberships, :in_voice_chat_at
  end
end

