class Rooms::VoiceChatsController < ApplicationController
  include RoomScoped

  before_action :ensure_livekit_enabled

  def create
    join
  end

  def join
    meet_url = LiveKitService.meet_url(room_id: @room.id, user: Current.user)

    respond_to do |format|
      format.json { render json: { meet_url: meet_url } }
      format.html { redirect_to meet_url, allow_other_host: true }
    end
  rescue LiveKitService::ConfigurationError => e
    respond_to do |format|
      format.json { render json: { error: e.message }, status: :unprocessable_entity }
      format.html { redirect_to room_path(@room), alert: e.message }
    end
  end

  def leave
    @membership&.leave_voice_chat!
    head :ok
  end

  private

    def ensure_livekit_enabled
      return if Current.account&.livekit_enabled?

      respond_to do |format|
        format.json { render json: { error: "LiveKit is not configured." }, status: :unprocessable_entity }
        format.html { redirect_to room_path(@room), alert: "LiveKit is not configured." }
      end
      return
    end
end
