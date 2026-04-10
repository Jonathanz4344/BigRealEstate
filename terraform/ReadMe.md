# Terraform Project – README

---

## 🚀 Getting Started

Before running the installation script it is important that you follow the steps below to correctly setup your environment.

1.  Setup an account on AWS and obtain the following credentials
    - AWS Access Key
    - AWS Secrect Access Key

2.  Setup the `variables.tfvars` file with the credentials provided in the section below this.

3.  Run the correct installation script for your OS.

---

## 📄 Variables (`variables.tfvars`)

Below is a quick rundown of every variable expected by the Terraform modules.

| Variable                      | Description                                                                                                                       | Type     | Example                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------- |
| `github_token`                | Personal access token that allows Terraform‑AWS‑Amplify to access your repository.                                                | `string` | `ghp_XXXXXXXXXXXXXXXXXXXX`        |
| `react_api_url`               | URL of the API for the backend of the application                                                                                 | `string` | `https://127.0.0.1:8000`          |
| `google_api_key`              | API key for access to google's APIs including google maps, gmail and more. Same value as backend's `.env` file's `GOOGLE_API_KEY` | `string` | `XXX.apps.googleusercontent.com`  |
| `google_oauth_client_id`      | The Client ID that connects the application to Googles OAuth provider. Same value as backend's `.env` file's `GOOGLE_CLIENT_ID`   | `string` | `XXXX.apps.googleusercontent.com` |
| `google_token_encryption_key` | Generated fernet key. Same value as backend's `.env` file's `GOOGLE_TOKEN_ENCRYPTION_KEY`                                         | `string` | `value`                           |
| `google_client_secret`        | The Secret Key that associated with the Client ID. Same value as backend's `.env` file's `GOOGLE_CLIENT_SECRET`                   | `string` | `value`                           |
| `db_password`                 | The password to the SQL Database                                                                                                  | `string` | `value`                           |
| `openai_api_key`              | A key registered to an OpenAI API account.                                                                                        | `string` | `value`                           |
| `brave_api_key`               | A key registered to an Brave API account.                                                                                         | `string` | `value`                           |
| `rapidapi_key`                | A key registered to an Rapid API account.                                                                                         | `string` | `value`                           |
| `smtp_username`               | A username for associated emails to originate from.                                                                               | `string` | `value`                           |
| `smtp_password`               | A password for the account where associated emails will originate from.                                                           | `string` | `value`                           |
| `admin_dashboard_username`    | Username for the `/admin` EC2 control dashboard login.                                                                            | `string` | `zalaadmin`                       |
| `admin_dashboard_password`    | Password for the `/admin` EC2 control dashboard login.                                                                            | `string` | `value`                           |

Place the above entries in a file called **`variables.tfvars`** in the root of the terraform folder.

---

## 🔑 How to obtain each API key / token

1. **AWS Access Key ID & Secret Access Key**  
   Ask a dev or obtain your own through the AWS console.

2. **GitHub Personal Access Token (github‑token)**  
   Ask a dev or obtain your own through the Github website.

3. **Google Maps Key**  
   Ask a dev or obtain your own through the Google console.

4. **Google OAuth Client ID**  
   Ask a dev or obtain your own through the Google console.

5. **Google Token Encryption Key**
   Ask a dev or obtain your own by generating a fernet key. Follow directions under `/BigRealEstate/ZalaBackend/README.md` related to the `GOOGLE_TOKEN_ENCRYPTION_KEY` variable.

6. **Google OAuth Client Secret**
   Ask a dev or obtain your own through the Google console. Follow directions under `/BigRealEstate/ZalaBackend/README.md` related to the `GOOGLE_CLIENT_SECRET` variable.

7. **Database Password**
   Choose any password you want, will create new database with this password.

8. **Open AI API Key**
   Ask a dev or obtain your own through an Open AI account.

9. **Brave API Key**
   Ask a dev or obtain your own through a Brave API account.

10. **Rapid API Key**
    Ask a dev or obtain your own through a Rapid API account.

11. **SMTP Username**
    Ask a dev or obtain an email to allow system emails to originate from.

12. **SMTP Password**
    Ask a dev or obtain an email to allow system emails to originate from and use the same password for this email.

13. **Admin Dashboard Username**
    Choose any username for the admin dashboard login at `/admin`.

14. **Admin Dashboard Password**
    Choose a strong password for the admin dashboard login.

---

## 🏗️ Infrastructure Architecture

Running `terraform apply -var-file=variables.tfvars` provisions the following AWS resources:

| Resource | Purpose |
|----------|--------|
| **AWS Amplify** | Hosts the React frontend, auto-builds on push to `main` |
| **EC2 (t3.micro)** | Runs FastAPI + PostgreSQL in Docker containers with an Elastic IP |
| **API Gateway** | Single HTTP API with two route groups |
| **Lambda (Proxy)** | Routes `/DEV/{proxy+}` requests from the frontend to the EC2 backend |
| **Lambda (EC2 Control)** | Handles `/DEV/ec2/{start,stop,status}` for the admin dashboard |
| **Security Groups** | Controls inbound access (HTTP, HTTPS, port 8000) |
| **Elastic IP** | Static IP assigned to EC2 so the address survives stop/start cycles |
| **IAM Roles** | Least-privilege roles for each Lambda function |

### Admin Dashboard (`/admin`)

The frontend includes an admin page at `/admin` that allows starting and stopping the EC2 backend server without SSH or AWS Console access.

**Flow:**
1. Login with `admin_dashboard_username` / `admin_dashboard_password`
2. Click **Start** → API Gateway → EC2 Control Lambda → `StartInstancesCommand`
3. Click **Stop** → API Gateway → EC2 Control Lambda → `StopInstancesCommand`
4. Status auto-polls every 15 seconds via `DescribeInstancesCommand`

Docker containers on EC2 use `restart: always`, so they auto-start when the instance boots — no manual intervention needed.

---

## 🛠️ Installation

The project provides two helper scripts to install the required tools.

| Platform                     | Script            | Run steps                                                                                                |
| ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| **macOS**                    | `brew_install.sh` | `chmod +x brew_install.sh && ./brew_install.sh`                                                          |
| **Windows** (Git‑Bash / WSL) | `yum_install.sh`  | `chmod +x yum_install.sh; .\yum_install.sh` or `chmod +x chocolatey_install.sh; .\chocolatey_install.sh` |

The `chmod +x` command makes the script executable; it must be executed **once** before the first run.

---

## 📚 Further Reading

- Terraform documentation: https://developer.hashicorp.com/terraform/docs
- AWS provider docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- GitHub Amplify integration guide: https://docs.amplify.aws/

---

_Happy provisioning!_
