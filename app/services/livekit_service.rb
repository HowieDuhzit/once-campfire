require "livekit"
require "uri"

class LiveKitService
  class ConfigurationError < StandardError; end

  class << self
    def generate_token(room_id:, user:, room_name: nil)
      config = livekit_config!
      room_name ||= default_room_name(room_id)

      token = LiveKit::AccessToken.new(
        config.fetch(:api_key),
        config.fetch(:api_secret),
        identity: user_identity(user),
        name: user.name
      )
      token.add_grant(
        LiveKit::VideoGrant.new(
          room: room_name,
          room_join: true,
          can_publish: true,
          can_subscribe: true
        )
      )

      token.to_jwt
    end

    def meet_url(room_id:, user:)
      meet_url = meet_url_config!
      room_name = default_room_name(room_id)
      token = generate_token(room_id: room_id, user: user, room_name: room_name)

      uri = URI.parse(meet_url)
      params = {
        room: room_name,
        token: token,
        identity: user_identity(user),
        name: user.name,
        serverUrl: livekit_host
      }
      uri.query = [uri.query, URI.encode_www_form(params)].compact.join("&")
      uri.to_s
    end

    def validate_webhook_signature(payload, signature)
      return false if signature.blank?

      webhook = LiveKit::Webhook.new(livekit_secret!)
      webhook.verify(payload, signature)
      true
    rescue LiveKit::Webhook::SignatureVerificationError, ConfigurationError
      false
    end

    def user_identity(user)
      "user-#{user.id}"
    end

    def default_room_name(room_id)
      "campfire-room-#{room_id}"
    end

    def meet_url_config!
      meet_url = Rails.application.config.x.livekit&.meet_url || ENV["MEET_URL"]
      raise ConfigurationError, "MEET_URL is not configured" if meet_url.blank?

      meet_url
    end

    def livekit_config!
      config = {
        api_key: livekit_api_key,
        api_secret: livekit_secret,
        host: livekit_host
      }

      missing = config.select { |_key, value| value.blank? }.keys
      if missing.any?
        raise ConfigurationError, "Missing LiveKit configuration: #{missing.join(', ')}"
      end

      config
    end

    def livekit_api_key
      Current.account&.livekit_api_key || ENV["LIVEKIT_API_KEY"]
    end

    def livekit_secret
      Current.account&.livekit_api_secret || ENV["LIVEKIT_API_SECRET"]
    end

    def livekit_secret!
      livekit_secret || raise(ConfigurationError, "LiveKit API secret is not configured")
    end

    def livekit_host
      Current.account&.livekit_host || ENV["LIVEKIT_HOST"]
    end
  end
end
