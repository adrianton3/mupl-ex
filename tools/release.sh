#!/usr/bin/env bash

git checkout gh-pages
git rm -r .
git checkout master -- demo
git checkout master -- lib
git checkout master -- src