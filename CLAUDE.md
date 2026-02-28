# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in early development. Update this file as the project takes shape.

## Requirements

This project is a simple web app intended to list the statistical progress of a small set of NBA players over the course of the current season.

There will be 10-20 players in total.

The key statistics to track per player are:

- Minutes per game
- Starting or Bench
- Points
- Rebounds
- Assists
- Steals
- Shooting percentage:
    - Field goal percentage
    - 3 point percentage
    - Free throw percentage
- Turnovers
- Fouls
- Plus/minus

The app should show these stats for the most recent game for each player.

The date of the game, as well as the result, and the opposition should be included.
The current win/loss status and overall ranking for the player's team should also be shown.

Average season stats for each player should be available.

Average stats for the last 5 games for each player should also be available.

Player stats should be displayed in a table, with each statistic in a sortable column.

## Technology

The project should run as a SPA.

The front-end technology should be React.js and Tailwind.

There should be no back-end layer.  All data should be retrieved via front-end code and persisted in local storage as JSON.