import os
import sys
import subprocess
from pathlib import Path
import imageio_ffmpeg

BASE_DIR = Path(__file__).parent
ASSETS_DIR = BASE_DIR / "video_assets"
OUTPUT_VIDEO = Path(__file__).parent.parent / "Aura_Code_Reviewer_3Min_Demo.mp4"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

SLIDES = ["slide_1", "slide_2", "slide_3", "slide_4", "slide_5"]

def render_all():
    print("=" * 70)
    print("[STARTING] FAST FFMPEG VIDEO RENDERER")
    print("=" * 70)

    clip_files = []
    
    for slide in SLIDES:
        img_path = ASSETS_DIR / f"{slide}.png"
        audio_path = ASSETS_DIR / f"{slide}.mp3"
        clip_path = ASSETS_DIR / f"{slide}_clip.mp4"

        print(f"Encoding {slide} to MP4...")
        cmd = [
            FFMPEG, "-y",
            "-loop", "1",
            "-i", str(img_path),
            "-i", str(audio_path),
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", "192k",
            "-pix_fmt", "yuv420p",
            "-shortest",
            str(clip_path)
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            print(f"Error encoding {slide}:", res.stderr.decode(errors="ignore"))
            return False
        
        clip_files.append(clip_path)

    # Create concat list
    concat_list_path = ASSETS_DIR / "concat_list.txt"
    with open(concat_list_path, "w", encoding="utf-8") as f:
        for clip in clip_files:
            f.write(f"file '{clip.as_posix()}'\n")

    print("\nConcatenating all 5 clips into final video...")
    concat_cmd = [
        FFMPEG, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_path),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    res = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        print("Error concatenating clips:", res.stderr.decode(errors="ignore"))
        return False

    print(f"\n[SUCCESS] 3-MINUTE PRESENTATION VIDEO GENERATED AT:\n{OUTPUT_VIDEO}")
    print(f"File Size: {round(OUTPUT_VIDEO.stat().st_size / (1024 * 1024), 2)} MB")
    return True

if __name__ == "__main__":
    render_all()
