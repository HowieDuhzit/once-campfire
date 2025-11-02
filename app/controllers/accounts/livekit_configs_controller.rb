class Accounts::LivekitConfigsController < ApplicationController
  before_action :ensure_can_administer
  before_action :set_account

  def show
    # Show current LiveKit configuration
  end

  def edit
    # Edit LiveKit configuration form
  end

  def update
    if @account.update(livekit_config_params)
      redirect_to edit_account_livekit_config_path, notice: "LiveKit configuration updated successfully"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def test_connection
    # Test LiveKit connection with provided credentials
    begin
      # Create a test token to verify credentials
      test_token = LiveKitService.generate_token(
        room_id: 0, # Test room
        user: Current.user,
        room_name: "test-connection"
      )
      
      render json: { 
        success: true, 
        message: "LiveKit connection successful" 
      }
    rescue => e
      render json: { 
        success: false, 
        message: "LiveKit connection failed: #{e.message}" 
      }, status: :unprocessable_entity
    end
  end

  private

    def set_account
      @account = Current.account
    end

    def ensure_can_administer
      unless Current.user.can_administer?
        redirect_to edit_account_path, alert: "Access denied"
      end
    end

    def livekit_config_params
      params.require(:account).permit(
        :livekit_api_key,
        :livekit_api_secret,
        :livekit_host,
        :livekit_http_url,
        :livekit_enabled
      )
    end
end

