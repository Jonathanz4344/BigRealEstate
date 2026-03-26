#! /bin/sh

brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform -version
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"
source "./dev.sh"

