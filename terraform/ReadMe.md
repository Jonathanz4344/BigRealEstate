# Terraform Project – README

---

## 📦 Prerequisites

Before you can apply the Terraform configuration you need a set of credentials and API tokens.

| Service           | Required credential(s)                           | How to obtain (add later) |
| ----------------- | ------------------------------------------------ | ------------------------- |
| **AWS**           | `AWS_ACCESS_KEY_ID` <br> `AWS_SECRET_ACCESS_KEY` | _Add instructions_        |
| **GitHub**        | `GITHUB_TOKEN` (used by Amplify)                 | _Add instructions_        |
| **<Other API 1>** | `<api‑key‑1>`                                    | _Add instructions_        |
| **<Other API 2>** | `<api‑key‑2>`                                    | _Add instructions_        |
| **…**             | _Add more as needed_                             | _Add instructions_        |

> **Tip:** Export the variables in your shell or place them in a secure `.env` file that you source before running Terraform.

---

## 🛠️ Installation

The project provides two helper scripts to install the required tools.

| Platform                     | Script            | Run steps                                         |
| ---------------------------- | ----------------- | ------------------------------------------------- |
| **macOS**                    | `brew_install.sh` | `chmod +x brew_install.sh`<br>`./brew_install.sh` |
| **Windows** (Git‑Bash / WSL) | `yum_install.sh`  | `chmod +x yum_install.sh`<br>`./yum_install.sh`   |

The `chmod +x` command makes the script executable; it must be executed **once** before the first run.

---

## 📄 Variables (`terraform.tfvars`)

Below is a quick rundown of every variable expected by the Terraform modules.

| Variable                 | Description                                                                        | Type     | Example                    |
| ------------------------ | ---------------------------------------------------------------------------------- | -------- | -------------------------- |
| `github_token`           | Personal access token that allows Terraform‑AWS‑Amplify to access your repository. | `string` | `ghp_XXXXXXXXXXXXXXXXXXXX` |
| `<other_variable_1>`     | _Brief description of what this variable controls._                                | `type`   | `value`                    |
| `<other_variable_2>`     | _Brief description of what this variable controls._                                | `type`   | `value`                    |
| _(add more as required)_ |                                                                                    |          |                            |

Place the above entries (or a subset) in a file called **`terraform.tfvars`** in the root of the repository.

---

## 🔑 How to obtain each API key / token

_Below are placeholder titles for the step‑by‑step guides you’ll need to fill in._

1. **AWS Access Key ID & Secret Access Key**  
   _Instructions go here…_

2. **GitHub Personal Access Token (github‑token)**  
   _Instructions go here…_

3. **<Other API 1> – API Key**  
   _Instructions go here…_

4. **<Other API 2> – Client Secret**  
   _Instructions go here…_

5. **<Additional API …> – Token**  
   _Instructions go here…_

Feel free to expand each section with screenshots, URLs, or any organization‑specific steps.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
chmod +x brew_install.sh   # macOS
# or
chmod +x yum_install.sh    # Windows

# 2. Populate terraform.tfvars with the values from the table above.

# 3. Initialise and apply
terraform init
terraform apply
```

---

## 📚 Further Reading

- Terraform documentation: https://developer.hashicorp.com/terraform/docs
- AWS provider docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- GitHub Amplify integration guide: https://docs.amplify.aws/

---

_Happy provisioning!_
