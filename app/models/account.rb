class Account < ApplicationRecord
  include Joinable

  has_one_attached :logo

  # LiveKit configuration methods
  def livekit_configured?
    livekit_api_key.present? && livekit_api_secret.present? && livekit_host.present?
  end

  def livekit_enabled?
    livekit_enabled && livekit_configured?
  end

  def livekit_config_valid?
    return false unless livekit_configured?
    
    # Basic validation - could be enhanced with actual connection test
    livekit_host.match?(/\A(wss?:\/\/)?[\w\.-]+(:\d+)?(\/.*)?\z/)
  end
end
