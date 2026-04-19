@echo off

@REM Run as admin
set "params=%*"
cd /d "%~dp0" && ( if exist "%temp%\getadmin.vbs" del "%temp%\getadmin.vbs" ) && fsutil dirty query %systemdrive% 1>nul 2>nul || (  echo Set UAC = CreateObject^("Shell.Application"^) : UAC.ShellExecute "cmd.exe", "/c cd ""%~sdp0"" && %~s0 %params%", "", "runas", 1 >> "%temp%\getadmin.vbs" && "%temp%\getadmin.vbs" && exit /B )

winget settings --enable BypassCertificatePinningForMicrosoftStore

@REM Download Dependencies
winget install --id Git.Git -e --source winget
winget install -e --id Amazon.AWSCLI
winget install -e --id OpenJS.NodeJS
winget install -e --id Hashicorp.Terraform

@REM Reload env vars
for /f "tokens=* usebackq" %%p in (`powershell -Command "& {[System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')}"`) do (
    set "path=%%p"
)
powershell -command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" 

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

winget settings --disable BypassCertificatePinningForMicrosoftStore

set /p name="Press enter to quit"