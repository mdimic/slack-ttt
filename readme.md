# Slack Tic-tac-toe

A custom slash command to play tic-tac-toe in a Slack channel. To use, type one of the following commands:

- `/ttt` or `/ttt help` - Display available commands
- `/ttt start [username]` - starts a game against username
- `/ttt status` - display the status of the game
- `/ttt move [row] [column]` - mark an empty space at [row, column]. Row and column go from 0 to [Board Size].
- `/ttt forfeit` - forfeit the game. Any player can run this command regardless of whos turn it is.

### Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

_Or with the [Heroku Toolbelt](https://toolbelt.heroku.com)_


`$ heroku create {app-name}`

`$ git push heroku master`

`$ heroku open`
