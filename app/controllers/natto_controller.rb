class NattoController < ApplicationController
  def index
  end

  def parse
    @input_text = params[:text]
    natto = Natto::MeCab.new
    @parsed_result = []

    natto.parse(@input_text) do |n|
      @parsed_result << { surface: n.surface, feature: n.feature }
    end

    render :index
  end
end
