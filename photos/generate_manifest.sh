#!/bin/bash
# Generates manifest.json from subdirectories in the photos folder
# Usage: ./generate_manifest.sh

cd "$(dirname "$0")"

{
echo "{"

first_dir=true
for dir in */; do
    # Skip if not a directory
    [ -d "$dir" ] || continue

    dirname="${dir%/}"

    # Skip hidden directories
    [[ "$dirname" == .* ]] && continue

    # Add comma before all but first directory
    if [ "$first_dir" = true ]; then
        first_dir=false
    else
        echo ","
    fi

    echo "  \"$dirname\": ["

    first_file=true
    for file in "$dir"*; do
        [ -f "$file" ] || continue

        # Only include image files
        case "$file" in
            *.jpg|*.JPG|*.jpeg|*.JPEG|*.png|*.PNG) ;;
            *) continue ;;
        esac

        filename=$(basename "$file")

        if [ "$first_file" = true ]; then
            first_file=false
        else
            echo ","
        fi

        printf "    \"%s\"" "$filename"
    done

    echo ""
    printf "  ]"
done

echo ""
echo "}"
} > manifest.json

echo "Generated manifest.json"
