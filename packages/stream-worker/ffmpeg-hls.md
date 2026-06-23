# FFmpeg HLS Transcoding Command

ffmpeg -i raw_upload.wav \
  -map 0:a -map 0:a -map 0:a \
  -c:a aac \
  -b:a:0 128k -b:a:1 256k -b:a:2 320k \
  -f hls \
  -hls_time 10 \
  -hls_playlist_type vod \
  -master_pl_name master.m3u8 \
  -var_stream_map "a:0,name:128k a:1,name:256k a:2,name:320k" \
  -hls_segment_filename "stream_%v/segment_%03d.ts" \
  stream_%v/playlist.m3u8

# Output:
# - master.m3u8 (HLS manifest)
# - stream_128k/playlist.m3u8
# - stream_256k/playlist.m3u8  
# - stream_320k/playlist.m3u8