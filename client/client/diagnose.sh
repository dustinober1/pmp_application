#!/bin/bash
echo "Starting diagnostic script"
pwd > debug_pwd.txt
node --version > debug_node.txt
npm --version > debug_npm.txt
ls -la > debug_ls.txt
echo "Script finished"
