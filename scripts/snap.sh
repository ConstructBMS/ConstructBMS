#!/bin/bash
git add -A
git commit -m "chore: snapshot $(git rev-parse --abbrev-ref HEAD) $(date -u +"%Y-%m-%dt%H:%M:%Sz")" || echo "No changes"
