#!/usr/bin/bash

filename="captions.txt"
tmp_file="tmp.json"

# Check if captions.txt exists
if [ ! -f "$filename" ]; then
    echo "Error: $filename does not exist"
    exit 1
fi

# Check if file is empty
if [ ! -s "$filename" ]; then
    echo "Error: $filename is empty"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it with 'brew install jq' or equivalent"
    exit 1
fi

# Create tmp file only once
touch "$tmp_file"

linenum=0
while IFS= read -r caption || [ -n "$caption" ]; do
    # Skip empty lines
    [ -z "$caption" ] && continue
    
    ((linenum++))
    echo "Processing line $linenum: $caption"
    
    # Make API call to get TTS URL
    echo "Making API call..."
    curl -s \
      -H "apikey: BoTSB5VMX2zdfXWSmZLeEam6lpnG5ASD" \
      --data-urlencode "input=$caption" \
      -d "speaker_id=6" \
      -d "speed=1.2" \
      -d "encode_type=0" \
      -X POST https://api.zalo.ai/v1/tts/synthesize > "$tmp_file"
    
    # Debug: Show API response
    echo "API Response:"
    cat "$tmp_file"
    
    # Extract URL and download audio
    url=$(jq -r '.data.url' "$tmp_file")
    
    # Check if URL was extracted successfully
    if [ -z "$url" ] || [ "$url" = "null" ]; then
        echo "Error: Could not extract URL for line $linenum"
        echo "API response was:"
        cat "$tmp_file"
        continue
    fi
    
    echo "Downloading audio for line $linenum from URL: $url"
    curl -s -o "${linenum}.wav" "$url"
    
    # Check if download was successful
    if [ $? -ne 0 ]; then
        echo "Error: Failed to download audio for line $linenum"
        continue
    fi
    
    # Verify the file was created and has content
    if [ ! -s "${linenum}.wav" ]; then
        echo "Error: Downloaded file is empty for line $linenum"
    else
        echo "Successfully created ${linenum}.wav ($(du -h "${linenum}.wav" | cut -f1) bytes)"
    fi
    
    # Add a small delay to avoid rate limiting
    sleep 1
done < "$filename"

# Remove tmp file at the end
rm -f "$tmp_file"
echo "Processing complete. Generated $(ls -1 *.wav 2>/dev/null | wc -l) audio files."