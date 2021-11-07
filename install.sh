#! /bin/bash

COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_NORMAL="\033[0;39m"

echo_color_green() {
	msg=$1
	printf ${COLOR_GREEN}
	echo ${msg};
	printf ${COLOR_NORMAL}
}

echo_color_yellow() {
	msg=$1
	printf ${COLOR_YELLOW}
	echo ${msg};
	printf ${COLOR_NORMAL}
}

clear
echo_color_green "Prepare environment (Only work fine on Linux system)"
echo_color_yellow "Precondition: Node & yarn installed"

echo_color_green "git reset --hard && git checkout develop && git pull"
git reset --hard && git checkout develop && git pull

echo_color_green "Install dependencies"
rm -rf node_modules
npm install

echo_color_green "Build for production"
npm run build

echo_color_green "Setup completed"
