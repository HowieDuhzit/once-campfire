class LivekitWebhooksController < ApplicationController
  # Skip CSRF protection for webhooks
  skip_before_action :verify_authenticity_token
  before_action :verify_webhook_signature

  def create
    webhook_data = JSON.parse(raw_webhook_body)
    
    case webhook_data['event']
    when 'room_started'
      handle_room_started(webhook_data)
    when 'room_finished'
      handle_room_finished(webhook_data)
    when 'participant_joined'
      handle_participant_joined(webhook_data)
    when 'participant_left'
      handle_participant_left(webhook_data)
    when 'track_published'
      handle_track_published(webhook_data)
    when 'track_unpublished'
      handle_track_unpublished(webhook_data)
    else
      Rails.logger.info "Unhandled LiveKit webhook event: #{webhook_data['event']}"
    end
    
    head :ok
  rescue => e
    Rails.logger.error "LiveKit webhook error: #{e.message}"
    head :internal_server_error
  end

  private

    def verify_webhook_signature
      signature = request.headers['Authorization']&.gsub('Bearer ', '')
      payload = raw_webhook_body

      unless LiveKitService.validate_webhook_signature(payload, signature)
        head :unauthorized
        return
      end
    end

    def raw_webhook_body
      @raw_webhook_body ||= request.raw_post
    end

    def handle_room_started(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      Rails.logger.info "LiveKit room started for Campfire room #{room_id}"
    end

    def handle_room_finished(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      # Clear all voice participation for this room
      room.memberships.update_all(in_voice_chat_at: nil)
      
      # Broadcast that room voice chat ended
      VoicePresenceChannel.broadcast_to(room, {
        type: 'room_finished',
        room_id: room_id,
        timestamp: Time.current.iso8601
      })
      
      Rails.logger.info "LiveKit room finished for Campfire room #{room_id}"
    end

    def handle_participant_joined(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      participant = webhook_data['participant']
      user_id = extract_user_id_from_identity(participant['identity'])
      user = User.find_by(id: user_id)
      return unless user
      
      # Update membership to track voice participation
      membership = room.memberships.find_by(user: user)
      membership&.update!(in_voice_chat_at: Time.current)
      
      # Broadcast participant joined
      VoicePresenceChannel.broadcast_to(room, {
        type: 'participant_joined',
        user_id: user.id,
        user_name: user.name,
        timestamp: Time.current.iso8601
      })
    end

    def handle_participant_left(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      participant = webhook_data['participant']
      user_id = extract_user_id_from_identity(participant['identity'])
      user = User.find_by(id: user_id)
      return unless user
      
      # Update membership to remove voice participation
      membership = room.memberships.find_by(user: user)
      membership&.update!(in_voice_chat_at: nil)
      
      # Broadcast participant left
      VoicePresenceChannel.broadcast_to(room, {
        type: 'participant_left',
        user_id: user.id,
        user_name: user.name,
        timestamp: Time.current.iso8601
      })
    end

    def handle_track_published(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      participant = webhook_data['participant']
      track = webhook_data['track']
      
      # Only handle audio tracks for voice chat
      return unless track['type'] == 'audio'
      
      user_id = extract_user_id_from_identity(participant['identity'])
      user = User.find_by(id: user_id)
      return unless user
      
      # Broadcast track published (speaking started)
      VoicePresenceChannel.broadcast_to(room, {
        type: 'track_published',
        user_id: user.id,
        user_name: user.name,
        track_type: track['type'],
        timestamp: Time.current.iso8601
      })
    end

    def handle_track_unpublished(webhook_data)
      room_name = webhook_data.dig('room', 'name')
      return unless room_name&.start_with?('campfire-room-')
      
      room_id = extract_room_id_from_name(room_name)
      room = Room.find_by(id: room_id)
      return unless room
      
      participant = webhook_data['participant']
      track = webhook_data['track']
      
      # Only handle audio tracks for voice chat
      return unless track['type'] == 'audio'
      
      user_id = extract_user_id_from_identity(participant['identity'])
      user = User.find_by(id: user_id)
      return unless user
      
      # Broadcast track unpublished (speaking stopped)
      VoicePresenceChannel.broadcast_to(room, {
        type: 'track_unpublished',
        user_id: user.id,
        user_name: user.name,
        track_type: track['type'],
        timestamp: Time.current.iso8601
      })
    end

    def extract_room_id_from_name(room_name)
      # Extract room ID from "campfire-room-123" format
      room_name.gsub('campfire-room-', '').to_i
    end

    def extract_user_id_from_identity(identity)
      # Extract user ID from "user-123" format
      identity.gsub('user-', '').to_i
    end
end
