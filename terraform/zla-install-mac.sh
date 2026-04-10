#! /bin/sh

# Download Necassary Software
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install gh
brew install awscli
brew install node
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Setup project files
git clone https://github.com/zla-llc/BigRealEstate.git
cp ./variables.tfvars ./BigRealEstate/terraform/variables.tfvars

# Move into project
cd ./BigRealEstate/terraform

# Kickoff project
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"

# Make zla commands available
source ./zla-mac.sh

# Move back to original dir
cd ../../
