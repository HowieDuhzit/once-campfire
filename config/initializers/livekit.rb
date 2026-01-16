Rails.application.config.x.livekit ||= ActiveSupport::OrderedOptions.new
Rails.application.config.x.livekit.meet_url = ENV["MEET_URL"]
