variable "aws_region" {
  description = "AWS Region For All Resources."

  type    = string
  default = "us-east-1"
}

variable "github_token" {
  type        = string
  description = "github token to connect github repo"
#  default     = ""
  sensitive = true
}

variable "repository" {
  type        = string
  description = "github repo url"
  default     = "https://github.com/zla-llc/BigRealEstate.git" # "YOUR SOURCE-CODE REPO URL"
}

variable "app_name" {
  type        = string
  description = "Application Name"
  default     = "ZLA"
}

variable "app_root" {
  type        = string
  description = "AWS Amplify App Root Dir"
  default     = "ZalaFrontend"
}

variable "branch_name" {
  type        = string
  description = "AWS Amplify App Repo Branch Name"
  default     = "terraform-amplify-update"
}


# variable "domain_name" {
#   type        = string
#   description = "AWS Amplify Domain Name"
#   default     = ""
# }

variable "admin_policy" {
  type        = string
  default     = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
  description = "Default Build Policy For Amplify"
}

variable "backend_policy" {
  type        = string
  default     = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
  description = "Default Backend Policy For Amplify"
}

variable "react_api_url" {
  type        = string
  description = "Url for the application to reach out to backend services"
  default = "https://127.0.0.1:8000"
}

variable "google_maps_key" {
  type        = string
  description = "Google API key to give application access to google maps features"
  default = ""
}

variable "google_client_id" {
  type = string
  description = "TODO Explain Better? - Google Client ID used for application's google services"
  default = ""
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "google_api_key" {
  type      = string
  sensitive = true
}

variable "google_token_encryption_key" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "brave_api_key" {
  type      = string
  sensitive = true
}

variable "rapidapi_key" {
  type      = string
  sensitive = true
}

variable "smtp_username" {
  type      = string
  sensitive = true
}

variable "smtp_password" {
  type      = string
  sensitive = true
}