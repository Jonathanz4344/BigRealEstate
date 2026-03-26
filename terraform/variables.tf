variable "aws_region" {
  description = "AWS Region For All Resources."

  type    = string
  default = "us-east-1"
}

variable "github_token" {
  type        = string
  description = "github token to connect github repo"
  # default     = "" # "Your Gitub Token"
}

variable "repository" {
  type        = string
  description = "github repo url"
  default     = "https://github.com/Jonathanz4344/BigRealEstate" # "YOUR SOURCE-CODE REPO URL"
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
  default     = "feature-terraform-amplify"
}


# variable "domain_name" {
#   type        = string
#   description = "AWS Amplify Domain Name"
#   default     = "pokopala.com"
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
