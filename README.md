# QuizStack 2026 — AWS Challenge Platform

> A full-stack quiz web app built for the **IPSR Solutions DevOps Internship** programme.
> 50 AWS questions · 30-minute timer · Google Sign-In · CI/CD via GitHub Actions → S3 + CloudFront

---

## 📁 Project Structure

```
quizstack/
├── index.html          ← Login page (Google Sign-In + manual form)
├── quiz.html           ← Quiz page (timer, navigator, submit modal)
├── results.html        ← Results page (score ring, review, confetti)
│
├── css/
│   ├── variables.css   ← CSS custom properties, resets, animations (shared)
│   ├── index.css       ← Login page styles + responsive
│   ├── quiz.css        ← Quiz page styles + responsive
│   └── results.css     ← Results page styles + responsive
│
├── js/
│   ├── questions.js    ← QUESTIONS[] array — 50 AWS MCQs (shared)
│   ├── index.js        ← Login validation + Google Sign-In handler
│   ├── quiz.js         ← Timer, navigator, answer selection, API submit
│   └── results.js      ← Score render, category breakdown, review, confetti
│
└── .github/
    └── workflows/
        └── deploy.yml  ← GitHub Actions CI/CD → S3 + CloudFront invalidation
```

---

## 🚀 Quick Start (Local)

Just open `index.html` in any modern browser — **no build step required**.

```bash
# With Python (recommended for Google Sign-In redirect_uri match)
python3 -m http.server 8080
# Then open http://localhost:8080
```

---

## 🔐 Google Sign-In Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add to **Authorised JavaScript origins**:
   - `http://localhost:8080`
   - `https://your-cloudfront-domain.cloudfront.net`
5. Copy your **Client ID** and replace `YOUR_GOOGLE_CLIENT_ID` in **two places** in `index.html`:
   ```html
   <meta name="google-signin-client_id" content="YOUR_GOOGLE_CLIENT_ID">
   ...
   <div id="g_id_onload" data-client_id="YOUR_GOOGLE_CLIENT_ID" ...>
   ```

When a user signs in with Google, `handleGoogleCredential()` in `js/index.js` decodes the JWT and stores their name/email in `sessionStorage`, then redirects to `quiz.html` — same flow as the manual form.

---

## ☁️ AWS Backend Setup

### 1. DynamoDB Table
| Setting       | Value           |
|---------------|-----------------|
| Table name    | `QuizResults`   |
| Partition key | `id` (String)   |

### 2. Lambda Function — `submitResult`
Runtime: **Python 3.12**

```python
import json, boto3, uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table    = dynamodb.Table('QuizResults')

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    item = {
        'id':             str(uuid.uuid4()),
        'timestamp':      datetime.utcnow().isoformat(),
        'name':           body.get('name', ''),
        'email':          body.get('email', ''),
        'phone':          body.get('phone', ''),
        'score':          body.get('score', 0),
        'totalAttempted': body.get('totalAttempted', 0),
        'timeTaken':      body.get('timeTaken', 0),
    }
    table.put_item(Item=item)
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin':  '*',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        'body': json.dumps({'id': item['id'], 'message': 'Saved'})
    }
```

### 3. API Gateway
- Create **HTTP API** → POST `/submit` → Lambda integration
- Enable **CORS**: Allow origin `*`, method `POST`
- Deploy to stage `prod`
- Copy the **Invoke URL** and paste into `js/quiz.js`:
  ```js
  const API_URL = 'https://xxxx.execute-api.ap-south-1.amazonaws.com/prod/submit';
  ```

### 4. S3 Static Hosting
```bash
aws s3 mb s3://your-bucket-name
aws s3 website s3://your-bucket-name --index-document index.html --error-document index.html
aws s3 sync . s3://your-bucket-name --exclude ".git/*" --exclude "*.md" --delete
```
Set bucket policy to allow public `GetObject`.

### 5. CloudFront Distribution
- Origin: S3 website endpoint
- Default root object: `index.html`
- HTTPS redirect: Yes
- Custom error page: `/index.html` → 200 (for SPA routing)

---

## ⚙️ CI/CD — GitHub Actions

The `.github/workflows/deploy.yml` automatically deploys on every push to `main`.

### Required GitHub Secrets
| Secret                  | Value                              |
|-------------------------|------------------------------------|
| `AWS_ACCESS_KEY_ID`     | IAM user access key                |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                |
| `AWS_S3_BUCKET`         | Your S3 bucket name                |
| `AWS_CLOUDFRONT_ID`     | Your CloudFront distribution ID    |

---

## 📱 Responsive Design

| Breakpoint   | Layout changes                                                |
|--------------|---------------------------------------------------------------|
| `> 768px`    | Full sidebar visible, desktop layout                          |
| `≤ 768px`    | Sidebar hidden; hamburger ☰ button toggles slide-in panel    |
| `≤ 600px`    | Stats grid: 4-col → 2-col; score ring smaller; tabs full-width|
| `≤ 520px`    | Login card full-width, fonts scale down                       |
| `≤ 480px`    | Nav buttons wrap, submit bar compact                          |

---

## ⌨️ Keyboard Shortcuts (Quiz page)

| Key           | Action          |
|---------------|-----------------|
| `→` Arrow     | Next question   |
| `←` Arrow     | Previous question |
| `1` `2` `3` `4` | Select option A B C D |

---

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vanilla HTML5, CSS3, JavaScript ES6 |
| Fonts      | Google Fonts (Orbitron, Rajdhani, JetBrains Mono) |
| Auth       | Google Identity Services (GSI)      |
| Storage    | AWS DynamoDB                        |
| API        | AWS API Gateway (HTTP) + Lambda     |
| Hosting    | AWS S3 Static Website               |
| CDN        | AWS CloudFront                      |
| CI/CD      | GitHub Actions                      |

---

*Built by Sagar Ibrahim · IPSR Solutions DevOps Internship 2026*
