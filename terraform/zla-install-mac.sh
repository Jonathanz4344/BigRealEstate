#! /bin/sh

# Define Global Variables
DEBUG=0
ENV_PATHS=(~/.zshrc)

# Define Functions
print() {
  if [ $DEBUG -eq 0 ]; then
    return
  fi
  echo "DEBUG: $1"
}

new_line() {
  print "<--------->"
  print ""
}

string_exists_in_file() {
  if grep -q "$1" "$2"; then
    echo 1
  else
    echo 0
  fi
}

string_exists_in_env() {
  local results=(0 0 0)
  for index in "${!ENV_PATHS[@]}";
  do
    local path=${ENV_PATHS[$index]}
    local result=$(string_exists_in_file "$1" $path)
    results[$index]=$result
  done
  echo "${results[@]}"
}

add_to_env() {
  local env_results=($(string_exists_in_env "$1"))
  for index in "${!env_results[@]}";
  do
    local value=${env_results[$index]}
    if [ $value -eq 0 ]; then
      local path=${ENV_PATHS[$index]}
      print "$index - $value - $path"
      echo "$1" >> $path
    fi
  done
}

replace_mult_new_lines() {
  if  [[ -n $2  &&  $2 -eq 1 ]]; then
    sed -i '' '/^$/N;/^\n$/D' $1
  else
    sed '/^$/N;/^\n$/D' $1
  fi
}

remove_string_in_file() {
  if [ $(string_exists_in_file "$1" "$2") -eq 0 ]; then
    print "Could not find ($1) in ($2)"
    new_line
    return
  fi

  print "Removing ($1) from ($2)"

  if  [[ -n $3  &&  $3 -eq 1 ]]; then
    sed -i '' 's/'"$1"'//g' $2
  else
    print ""
    sed 's/'"$1"'//g' $2
    print ""
  fi

  new_line
}

remove_env_alterations() {
  for path in "${ENV_PATHS[@]}";
  do
    # Homebrew alterations
    remove_string_in_file 'export PATH="\/opt\/homebrew\/bin:$PATH"' $path 1
    remove_string_in_file 'eval $(\/opt\/homebrew\/bin\/brew shellenv zsh)' $path 1

    # Python alterations
    remove_string_in_file 'export PYENV_ROOT="$HOME\/.pyenv"' $path 1
    remove_string_in_file '\[\[ -d $PYENV_ROOT\/bin \]\] \&\& export PATH="$PYENV_ROOT\/bin:$PATH"' $path 1
    remove_string_in_file 'eval "$(pyenv init -)"' $path 1

    # ZLA alterations
    remove_string_in_file 'alias zla-start="[ -d .\/BigRealEstate\/terraform ] && cd .\/BigRealEstate\/terraform && terraform init && terraform apply --auto-approve -var-file=\"variables.tfvars\" && cd ..\/..\/ || echo \"Error: Bad Location - Command must run from the folder that holds the BigRealEstate folder with the project source code\""' $path 1
    remove_string_in_file 'alias zla-stop="[ -d .\/BigRealEstate\/terraform ] && cd .\/BigRealEstate\/terraform && terraform destroy --auto-approve -var-file=\"variables.tfvars\" && cd ..\/..\/ || echo \"Error: Bad Location - Command must run from the folder that holds the BigRealEstate folder with the project source code\""' $path 1

    replace_mult_new_lines $path 1
  done
}

add_brew_alterations() {
  for path in "${ENV_PATHS[@]}";
  do
    # Homebrew alterations
    echo 'export PATH="/opt/homebrew/bin:$PATH"' >> $path
    echo 'eval $(/opt/homebrew/bin/brew shellenv zsh)' >> $path
  done
  eval $(/opt/homebrew/bin/brew shellenv)
}

add_python_alterations() {
  for path in "${ENV_PATHS[@]}";
  do
    # Python alterations
    echo 'export PYENV_ROOT="$HOME/.pyenv"' >> $path
    echo '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> $path
    echo 'eval "$(pyenv init -)"' >> $path
  done
}

add_zala_alterations() {
  for path in "${ENV_PATHS[@]}";
  do
    # Python alterations
    echo 'alias zla-start="[ -d ./BigRealEstate/terraform ] && cd ./BigRealEstate/terraform && terraform init && terraform apply --auto-approve -var-file=\"variables.tfvars\" && cd ../../ || echo \"Error: Bad Location - Command must run from the folder that holds the BigRealEstate folder with the project source code\""' >> $path
    echo 'alias zla-stop="[ -d ./BigRealEstate/terraform ] && cd ./BigRealEstate/terraform && terraform destroy --auto-approve -var-file=\"variables.tfvars\" && cd ../../ || echo \"Error: Bad Location - Command must run from the folder that holds the BigRealEstate folder with the project source code\""' >> $path
  done
}

setup_env_files() {
  # Create env files if they don't exist
  for path in "${ENV_PATHS[@]}";
  do
    [ -f filename.txt ] || touch $path
  done

  # If script was ran beforehand, remove alterations added to env files
  remove_env_alterations
}

source_env() {
  for path in "${ENV_PATHS[@]}";
  do
    source $path
  done
}

install_deps() {
  # Install brew
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  add_brew_alterations
  source_env

  # Install xcode-select
  sudo rm -rf /Library/Developer/CommandLineTools
  sudo xcode-select --install

  # Pause until XCode installs
  echo ""
  echo "After XCode install window completes, press enter to continue..."
  read -p ""

  # Install brew deps
  brew install libxml2
  brew link --force libxml2
  brew install openssl@3
  brew install awscli
  brew install gh
  brew install node
  brew tap hashicorp/tap
  brew install hashicorp/tap/terraform
  brew install pyenv

  # Install python
  set +e
  add_python_alterations
  source_env
  pyenv install 3.14
  pyenv global 3.14
  python --version
  set -e
}

setup_files() {
  sudo rm -rf ./BigRealEstate
  git clone https://github.com/zla-llc/BigRealEstate.git
  cp ./variables.tfvars ./BigRealEstate/terraform/variables.tfvars

  add_zala_alterations
  source_env
}

run_project() {
  cd ./BigRealEstate/terraform
  aws configure
  terraform init
  terraform apply --auto-approve -var-file="variables.tfvars"
  cd ../../
  source ./BigRealEstate/terraform/zla-mac.sh
}

# Stop the script if any error happens
set -e

# Setup env files, create if need be and add necassary content
setup_env_files

# Install dependencies, order matters
install_deps

# Setup project files
setup_files

# Run the project
run_project

# Source env one last time
source_env