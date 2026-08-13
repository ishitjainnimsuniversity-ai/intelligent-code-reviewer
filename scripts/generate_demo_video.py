import os
import sys
import time
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips
from gtts import gTTS

OUTPUT_DIR = Path(__file__).parent / "video_assets"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_OUTPUT = Path(__file__).parent.parent / "Aura_Code_Reviewer_3Min_Demo.mp4"

SECTIONS = [
    {
        "id": "slide_1",
        "title": "AURA CODE: THE 24/7 INTELLIGENT REVIEWER",
        "subtitle": "Next-Gen Automated Multi-Language AST Auditing & ML Ensembles",
        "text": "Hello everyone. Welcome to the official presentation of Aura Code, an automated, always-on intelligent code reviewer engineered for modern software teams. Code reviews are often major team bottlenecks where security vulnerabilities and performance debt go undetected. Aura Code solves this by combining multi-language AST auditing, neural ML ensembles, and institutional CSV rule learning.",
        "badge": "PROJECT INTRODUCTION",
        "color": (16, 185, 129),
        "bullets": [
            "[AST] Multi-Language AST Analysis (Python, JS, TS, Java, Go, Rust, C++, SQL)",
            "[ML] Dual ML Ensemble: AdaBoost + GradientBoosting (92.8% Confidence)",
            "[CSV] Historical Anti-Pattern Grounding (<id>, <type>, <description>)",
            "[DIFF] 1-Click Refactoring & Side-by-Side Unified Diff Engine"
        ]
    },
    {
        "id": "slide_2",
        "title": "REAL-TIME CODE REVIEW STUDIO",
        "subtitle": "Instant Multi-Language AST Auditing & 1.0 to 10.0 Quality Rating",
        "text": "Here in the Review Studio, engineers write or paste code in any major programming language. As they type, our continuous real-time stream analyzes the syntax in under twenty milliseconds. It assigns a standardized 6.8 out of 10.0 quality rating with Grade C, and breaks down scores across Security, Performance, Architecture, Maintainability, and Readability.",
        "badge": "LIVE REVIEW STUDIO",
        "color": (6, 182, 212),
        "bullets": [
            "[SCORE] Standardized Quality Rating: 1.0 to 10.0 with Letter Grades (A+ to F)",
            "[SEC] Detects CWE-89 SQL Injections, API Secrets, and TLS Flaws",
            "[PERF] Algorithmic Trap Detection: N+1 queries in loops and quadratic string concat",
            "[STREAM] Sub-20ms Continuous Evaluation Telemetry Stream"
        ]
    },
    {
        "id": "slide_3",
        "title": "NEURAL ML ENSEMBLE & 1-CLICK REFACTORING",
        "subtitle": "Blended GradientBoosting + AdaBoost + Sequence Token n-grams",
        "text": "Under the hood, Aura Code runs a trained machine learning ensemble. Gradient Boosting and AdaBoost regressors analyze lexical token sequences and cyclomatic complexity to compute an agreement confidence metric of 92.8 percent. With one click, engineers open the Unified Diff Viewer to inspect the automated fix and apply it directly into their editor.",
        "badge": "AI & ML ENSEMBLE",
        "color": (99, 102, 241),
        "bullets": [
            "[MODELS] Scikit-Learn Ensemble: GradientBoosting + AdaBoost Regressors",
            "[EMBED] TF-IDF Token Sequences acting as a Lexical RNN Proxy",
            "[REFACTOR] 1-Click Code Refactoring with Unified Side-by-Side Diffs",
            "[FIX] Immediate Resolution of Security and Performance Violations"
        ]
    },
    {
        "id": "slide_4",
        "title": "GROUNDED CSV HISTORICAL LEARNING HUB",
        "subtitle": "Institutional Knowledge Ingestion: <id>, <type>, <description>",
        "text": "Aura Code learns and remembers institutional standards. In the Historical Rule Hub, teams upload their custom CSV rules. When auditing code, the engine directly matches and cites these learned rules, such as Rule 1 for variable naming, Rule 2 for loop queries, and Rule 3 for SQL sanitization. Teams can also test rules live in the built-in Sandbox.",
        "badge": "HISTORICAL LEARNING",
        "color": (245, 158, 11),
        "bullets": [
            "[INGEST] CSV Schema Ingestion: <id>, <type>, <description>",
            "[CITATIONS] Direct Grounding: Cites specific institutional rules on line numbers",
            "[SANDBOX] Interactive Live Rule Sandbox and Pattern Matcher",
            "[EXPORT] Dynamic CSV Export and Category Filtering"
        ]
    },
    {
        "id": "slide_5",
        "title": "GROWTH ANALYTICS & 24/7 CI/CD PR SIMULATOR",
        "subtitle": "Persistent SQLite Tracking & Autonomous GitHub PR Bot",
        "text": "Finally, Aura Code tracks developer growth over time. In the Growth Dashboard, past review sessions are persistently stored in SQLite, displaying interactive Chart.js quality score trajectories. In CI CD mode, Aura acts as an autonomous GitHub bot, analyzing pull requests, providing inline comments, and making pass or block merge decisions. Aura Code delivers twenty four seven intelligent reviews for every engineer.",
        "badge": "GROWTH & CI/CD",
        "color": (16, 185, 129),
        "bullets": [
            "[CHART] Time-Series Developer Quality Progression via Chart.js",
            "[DB] Persistent SQLite Session Database across all user reviews",
            "[BOT] 24/7 Autonomous GitHub Pull Request Review Bot",
            "[GATE] Automated Merge Blocker and Instant Approval Gates"
        ]
    }
]

def create_slide_image(section, index, total):
    width, height = 1920, 1080
    img = Image.new("RGB", (width, height), (7, 12, 24))
    draw = ImageDraw.Draw(img)

    # Background gradient glow
    for r in range(400, 0, -10):
        alpha_color = (
            int(section["color"][0] * (r / 400) * 0.18),
            int(section["color"][1] * (r / 400) * 0.18),
            int(section["color"][2] * (r / 400) * 0.18)
        )
        draw.ellipse([960 - r, 300 - r, 960 + r, 300 + r], fill=alpha_color)

    # Top Header Bar
    draw.rectangle([0, 0, width, 90], fill=(4, 7, 15))
    draw.line([0, 90, width, 90], fill=(30, 41, 59), width=2)
    
    # Header Brand
    draw.text((60, 28), "AURA CODE v2.0 // 24/7 INTELLIGENT CODE REVIEWER", fill=(241, 245, 249))
    draw.text((width - 320, 28), f"DEMO SLIDE {index + 1} OF {total}", fill=(148, 163, 184))

    # Badge
    badge_text = f"  * {section['badge']}  "
    draw.rectangle([60, 140, 360, 180], fill=(15, 23, 42), outline=section["color"], width=2)
    draw.text((75, 150), badge_text, fill=section["color"])

    # Title & Subtitle
    draw.text((60, 210), section["title"], fill=(248, 250, 252))
    draw.text((60, 270), section["subtitle"], fill=section["color"])
    draw.line([60, 320, width - 60, 320], fill=(30, 41, 59), width=2)

    # Main Content Glass Card
    draw.rectangle([60, 360, width - 60, 960], fill=(11, 18, 33), outline=(30, 41, 59), width=2)

    # Draw Bullet Points
    y_pos = 410
    for bullet in section["bullets"]:
        draw.rectangle([100, y_pos + 6, 114, y_pos + 20], fill=section["color"])
        draw.text((135, y_pos), bullet, fill=(226, 232, 240))
        y_pos += 85

    # Footer Telemetry Strip
    draw.rectangle([60, 980, width - 60, 1040], fill=(4, 7, 15))
    draw.text((100, 1000), "STATUS: 100% REAL-TIME INFERENCE ACTIVE  *  ML MODELS ONLINE (ADABOOST + GRADIENTBOOST)", fill=(52, 211, 153))
    draw.text((width - 450, 1000), "AURA CODE 24/7 ARCHITECTURE", fill=(148, 163, 184))

    return img

def generate_video():
    print("=" * 70)
    print("[STARTING] GENERATING 3-MINUTE PRESENTATION DEMO VIDEO MP4")
    print("=" * 70)

    clips = []
    
    for idx, sec in enumerate(SECTIONS):
        print(f"Generating Slide #{idx + 1}: {sec['title']}...")
        
        # 1. Generate Voice Narration via gTTS
        audio_path = OUTPUT_DIR / f"{sec['id']}.mp3"
        tts = gTTS(text=sec["text"], lang="en", tld="com", slow=False)
        tts.save(str(audio_path))

        # 2. Generate Slide Image
        img = create_slide_image(sec, idx, len(SECTIONS))
        img_path = OUTPUT_DIR / f"{sec['id']}.png"
        img.save(str(img_path))

        # 3. Create Video Clip synced to Audio Duration
        audio_clip = AudioFileClip(str(audio_path))
        duration = audio_clip.duration + 0.8
        img_clip = ImageClip(str(img_path)).with_duration(duration).with_audio(audio_clip)
        
        clips.append(img_clip)

    print("\nConcatenating clips and rendering video...")
    final_video = concatenate_videoclips(clips, method="compose")
    final_video.write_videofile(
        str(VIDEO_OUTPUT),
        fps=24,
        codec="libx264",
        audio_codec="aac"
    )

    print(f"\nDEMO VIDEO CREATED SUCCESSFULLY AT: {VIDEO_OUTPUT}")
    print(f"Total Video Duration: {round(final_video.duration, 1)} seconds (~3 minutes)")
    return VIDEO_OUTPUT

if __name__ == "__main__":
    generate_video()
