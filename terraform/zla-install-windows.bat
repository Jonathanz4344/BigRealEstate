@echo off

@REM Download Dependencies
winget install --id GitHub.cli
winget install -e --id Amazon.AWSCLI
winget install -e --id OpenJS.NodeJS
winget install -e --id Hashicorp.Terraform

@REM Setup Project files
git clone https://github.com/zla-llc/BigRealEstate.git
copy .\variables.tfvars .\BigRealEstate\terraform\variables.tfvars

@REM Move into project 
cd .\BigRealEstate\terraform

@REM Kickoff project
aws configure
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"

@REM Move back to original dir
cd ..\..\

@REM Make zla commands available
copy .\BigRealEstate\terraform\zla-start.bat .\zla-start.bat
copy .\BigRealEstate\terraform\zla-stop.bat .\zla-stop.bat