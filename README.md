# ⚡ QuizStack 2026 — AWS Challenge Platform

> A full-stack serverless quiz app built for the **IPSR Solutions DevOps Internship 2026**.
> 50 AWS MCQs · 30-minute countdown timer · Google Sign-In · CI/CD via GitHub Actions → S3 + CloudFront

🔗 **Live Demo** → https://d3ky5ngni9848u.cloudfront.net
💻 **GitHub** → https://github.com/Sagartvk/quizstack

---

## 📁 Project Structure

```
quizstack_v2/
├── index.html                  ← Login page (Google Sign-In + manual form)
├── quiz.html                   ← Quiz page (50 questions, timer, navigator, submit modal)
├── results.html                ← Results page (score ring, category breakdown, review, confetti)
│
├── css/
│   ├── variables.css           ← Shared CSS variables, animations, grid background, orbs
│   ├── index.css               ← Login page styles + fully responsive
│   ├── quiz.css                ← Quiz page styles + mobile sidebar + responsive
│   └── results.css             ← Results page styles + responsive
│
├── js/
│   ├── questions.js            ← All 50 AWS MCQs — shared by quiz + results pages
│   ├── index.js                ← Google Sign-In init, JWT decode, form validation
│   ├── quiz.js                 ← Timer, navigator grid, answer logic, API Gateway submit
│   └── results.js              ← Score animation, category breakdown, answer review, confetti
│
├── lambda/
│   └── lambda_function.py      ← AWS Lambda function (paste into AWS inline editor)
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD → S3 sync + CloudFront invalidation
│
├── deploy.yml                  ← Same CI/CD file (visible copy at root for easy access)
├── .gitignore                  ← Git ignore rules
└── README.md                   ← This file
```

---

## 🚀 Quick Start (Local)

No build step needed — pure HTML, CSS, and JavaScript.

```bash
# Recommended: use Python server so Google Sign-In origins match
python3 -m http.server 8080

# Then open in your browser:
# http://localhost:8080
```

> ⚠️ Opening `index.html` directly via `file://` will cause Google Sign-In to fail because
> Google requires an `http://` or `https://` origin. Always use a local server.

---

## 🔐 Google Sign-In Setup

### Step 1 — Create Google OAuth 2.0 Client ID

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create or select a project
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Under **Authorised JavaScript origins** add:
   - `http://localhost:8080` ← for local testing
   - `https://your-cloudfront-domain.cloudfront.net` ← for live app
6. Click **Create** → copy the **Client ID**

### Step 2 — Update js/index.js

Open `js/index.js` and update the `CLIENT_ID` constant at the top:

```js
const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
```

### How it works

When a user clicks **Sign in with Google**:
1. `initGoogleSignIn()` initialises the GSI library with your Client ID on page load
2. `triggerGoogleSignIn()` renders a real (hidden) Google button and clicks it — this satisfies browser popup rules
3. Google popup opens → user selects account → Google returns a JWT credential
4. `handleGoogleCredential()` decodes the JWT payload (name, email, picture) and stores it in `sessionStorage`
5. Browser redirects to `quiz.html`

---

## ☁️ AWS Backend Setup

### Architecture

```
Browser → CloudFront → S3 (static frontend)
Browser → API Gateway → Lambda → DynamoDB
```

### 1. DynamoDB Table

| Setting        | Value            |
|----------------|------------------|
| Table name     | `QuizResults`    |
| Partition key  | `submissionId`   |
| Type           | String           |
| Capacity mode  | On-demand        |

### 2. IAM Role for Lambda

Create a role named **`QuizLambdaRole`** with these policies attached:
- `AmazonDynamoDBFullAccess`
- `AWSLambdaBasicExecutionRole`

### 3. Lambda Function

**Function name:** `QuizSubmitHandler`  
**Runtime:** Python 3.12  
**Execution role:** QuizLambdaRole

Open `lambda/lambda_function.py`, copy the full code, and paste it into the **inline editor** in the AWS Lambda console. Click **Deploy**.

> ✅ No pip install needed — `boto3`, `uuid`, and `datetime` are all built into Python 3.12 on Lambda.

### 4. API Gateway

1. Go to **API Gateway → Create API → HTTP API → Build**
2. API name: `QuizAPI`
3. **Routes → Create** → Method: `POST` | Path: `/submit`
4. Attach integration → Lambda → `QuizSubmitHandler`
5. **CORS** → Allow origin: `*` | Allow headers: `Content-Type` | Allow methods: `POST, OPTIONS`
6. Deploy → copy the **Invoke URL**

Paste the Invoke URL into `js/quiz.js`:

```js
const API_URL = 'https://xxxxxxxxxx.execute-api.ap-south-1.amazonaws.com/submit';
```

### 5. S3 Static Hosting

1. **Create bucket** → name: `quizstack-frontend` → region: `ap-south-1`
2. Uncheck **Block all public access** → acknowledge
3. **Properties → Static website hosting → Enable**
   - Index document: `index.html`
   - Error document: `index.html`
4. **Permissions → Bucket Policy** → paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::quizstack-frontend/*"
  }]
}
```

5. Upload all files except `lambda/`, `.github/`, and `*.md`

### 6. CloudFront Distribution

| Setting                  | Value                                              |
|--------------------------|----------------------------------------------------|
| Origin domain            | S3 **website** endpoint (not REST endpoint)        |
| Viewer protocol policy   | Redirect HTTP to HTTPS                             |
| Default root object      | `index.html`                                       |
| Cache policy             | CachingDisabled (for HTML) / CachingOptimized (CSS/JS) |

> ⚠️ Use the S3 **website endpoint** URL format:
> `quizstack-frontend.s3-website.ap-south-1.amazonaws.com`
> NOT the REST endpoint (`quizstack-frontend.s3.amazonaws.com`)

---

## ⚙️ CI/CD — GitHub Actions

Every `git push` to `main` automatically:
1. Syncs all frontend files to S3
2. Creates a CloudFront cache invalidation so users get the latest version immediately

### Required GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name                   | Value                              |
|-------------------------------|------------------------------------|
| `AWS_ACCESS_KEY_ID`           | Your IAM user access key ID        |
| `AWS_SECRET_ACCESS_KEY`       | Your IAM user secret access key    |
| `AWS_REGION`                  | `ap-south-1`                       |
| `S3_BUCKET`                   | `quizstack-frontend`               |
| `CLOUDFRONT_DISTRIBUTION_ID`  | Your CloudFront distribution ID    |

---

## 🔀 Git Setup — First Time

```bash
# 1. Initialise git in your project folder
git init

# 2. Stage all files
git add .

# 3. First commit
git commit -m "Initial QuizStack 2026 app"

# 4. Set branch name
git branch -M main

# 5. Link to GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/quizstack.git

# 6. Push
git push -u origin main
```

Every future update is just:

```bash
git add .
git commit -m "Your change description"
git push origin main
# GitHub Actions handles the rest automatically ✅
```

---

## 📱 Responsive Breakpoints

| Breakpoint  | Changes                                                        |
|-------------|----------------------------------------------------------------|
| `> 768px`   | Full sidebar visible, desktop layout                           |
| `≤ 768px`   | Sidebar hidden — hamburger ☰ button toggles slide-in panel     |
| `≤ 600px`   | Stats grid 4-col → 2-col, score ring shrinks, tabs full-width  |
| `≤ 520px`   | Login card goes full-width, fonts scale down                   |
| `≤ 480px`   | Nav buttons wrap, submit bar compact                           |

---

## ⌨️ Keyboard Shortcuts (Quiz page)

| Key              | Action            |
|------------------|-------------------|
| `→` Arrow        | Next question     |
| `←` Arrow        | Previous question |
| `1` `2` `3` `4`  | Select option A B C D |

---

## 🛠 Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | Vanilla HTML5, CSS3, JavaScript ES6 (no frameworks) |
| Fonts      | Google Fonts — Orbitron, Rajdhani, JetBrains Mono   |
| Auth       | Google Identity Services (GSI) — OAuth 2.0 / JWT    |
| Database   | AWS DynamoDB (NoSQL, On-demand)                     |
| API        | AWS API Gateway (HTTP API) + AWS Lambda             |
| Hosting    | AWS S3 Static Website Hosting                       |
| CDN        | AWS CloudFront (400+ edge locations, free HTTPS)    |
| CI/CD      | GitHub Actions (auto deploy on push to main)        |

---

## 🧪 Testing Checklist

- [ ] CloudFront URL loads login page
- [ ] Google Sign-In button opens popup
- [ ] Login with Google redirects to quiz.html
- [ ] Manual form validation shows error messages
- [ ] 50 questions load correctly
- [ ] Timer counts down from 30:00
- [ ] Progress bar fills as questions are answered
- [ ] Navigator grid highlights current / answered questions
- [ ] Submit sends POST to API Gateway
- [ ] DynamoDB table receives new row
- [ ] Results page shows animated score ring
- [ ] Review Answers tab shows all 50 questions with correct/wrong highlighting
- [ ] GitHub Actions runs green on `git push`
- [ ] CloudFront serves updated files after deploy

---

## 📬 Submission

| Field   | Value                                    |
|---------|------------------------------------------|
| Send to | amal.kumar@ipsrsolutions.com             |
| Subject | QuizStack 2026 — AWS Deployment — [Your Name] |
| Deadline | Saturday 14/03/2026 — 6:00 PM          |

Include: Live CloudFront URL + screenshots of S3, CloudFront, API Gateway, Lambda test, DynamoDB table, and GitHub Actions green run.

---

*Built by Sagar Ibrahim · IPSR Solutions DevOps Internship 2026*
