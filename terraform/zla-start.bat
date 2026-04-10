@echo off
cd .\BigRealEstate\terraform
terraform init
terraform apply --auto-approve -var-file="variables.tfvars"
cd ..\..\
