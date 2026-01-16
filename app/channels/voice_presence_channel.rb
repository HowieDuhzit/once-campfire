class VoicePresenceChannel < RoomChannel
  def subscribed
    super
    transmit_current_participants if @room
  end

  private

    def transmit_current_participants
      participants = @room.memberships
        .where.not(in_voice_chat_at: nil)
        .includes(:user)
        .map do |membership|
          {
            user_id: membership.user_id,
            user_name: membership.user.name,
            joined_at: membership.in_voice_chat_at&.iso8601
          }
        end

      transmit(type: "current_participants", participants: participants)
    end
end
