# YouTube Shorts Viral Detector

Automated system to detect and report viral YouTube Shorts in the "Inspiring / Humanity / Real Life" niche.

## Features
- Detects viral Shorts uploaded in the last 24 hours.
- Filters by view count (>50k), like ratio (>80%).
- Removes duplicate reported videos using SQLite.
- Sends a professional HTML daily report via email.
- Runs automatically every day at 3 AM UTC via GitHub Actions.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd youtube-shorts-automation
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   - `YT_API`: Your YouTube Data API v3 key.
   - `EMAIL_USER`: Your Gmail address (e.g., `yourname@gmail.com`).
   - `EMAIL_PASS`: Your Gmail **App Password** (16 characters).
   - `SMTP_HOST`: Defaults to `smtp.gmail.com`.
   - `SMTP_PORT`: Defaults to `465`.

4. **GitHub Secrets**:
   If running on GitHub Actions, add these secrets to your repository:
   - `YT_API`
   - `EMAIL_USER`: Your sender email (e.g., `sender@gmail.com`)
   - `EMAIL_PASS`: Your App Password
   - `EMAIL_TO`: Recipient email (e.g., `recipient@gmail.com`)
   - `SMTP_HOST` (Optional, defaults to Gmail)

> [!CAUTION]
> **NEVER commit your `.env` file to GitHub.** It contains your actual password. I have added it to `.gitignore` to prevent accidental uploads. Only use GitHub Secrets for online automation.
   - `SMTP_HOST` (Optional, defaults to Gmail)
   - `SMTP_PORT` (Optional, defaults to 465)
   - `SMTP_SECURE` (Optional, defaults to true)

### How to get a Gmail App Password:
1. Go to your [Google Account Settings](https://myaccount.google.com/).
2. Enable **2-Step Verification**.
3. Search for **App Passwords** in the search bar.
4. Select `Other (Custom name)` and name it "YouTube Bot".
5. Copy the 16-character code and use it as your `EMAIL_PASS`.

## Project Structure
- `src/index.js`: Main orchestrator.
- `src/services/`: YouTube, Email, and Database services.
- `src/filters/`: Filtering and deduplication logic.
- `src/formatters/`: Report generators (Text/HTML).
- `src/utils/`: Logger, Date utilities, and Config loader.

## Database
The project uses a SQLite database (`db/shorts.db`) to track reported videos and avoid duplicates. This file is automatically committed back to the repository by GitHub Actions.

## License
MIT
