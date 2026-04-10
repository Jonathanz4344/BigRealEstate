@echo off
cd .\BigRealEstate\terraform
terraform destroy --auto-approve -var-file="variables.tfvars"
cd ..\..\
