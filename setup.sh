#!/bin/bash

# Create the subfolders
mkdir -p backend frontend ml_backend

# Clone the repositories into their respective folders
git clone git@github.com:TryOmni/omni-backend.git backend
git clone git@github.com:TryOmni/omni-frontend.git frontend
git clone git@github.com:TryOmni/omni-ml.git ml_backend

echo "Folders and repositories have been set up successfully."
