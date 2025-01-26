# 🍿 Popcorn Initiative for Roll20 🎲

[Popcorn Initiative](https://theangrygm.com/popcorn-initiative-a-great-way-to-adjust-dd-and-pathfinder-initiative-with-a-stupid-name/), also known as [Elective Action Order](https://fate-srd.com/odds-ends/elective-action-order) is a dynamic turn order management system for tabletop role-playing games. 
This Roll20 script provides a flexible and user-friendly way to manage combat encounters, allowing for custom initiative formulas, automatic shuffling, and player-friendly commands.


## ✨ Features

- 🎯 Dynamic turn order management
- 🔄 Support for custom initiative formulas
- 🎲 Optional automatic initiative shuffling
- ⚔️ Integrated combat tracking
- 🎮 Player-friendly commands
- 📊 Round counter
- ☠️ Dead token management

Note, that marks ✅/⬜in Turn Order window are not clickable because of Roll20 API limitations(or, at least, I don't know how to do it). 
Use `!popcorn` commands instead.

## 🚀 Getting Started

1. Add the script to your Roll20 game
    1.a Open Mod Script Settings in the game settings
    1.b Click New Script and give it a name e.g. PopcornInitiative.js
    1.c Copy the script from `PopcornInitiative.js` and paste it into the script editor
    1.d Save the script
    1.e In chat type `!popcorn help` to see the list of available commands
2. Add tokens to the turn tracker using `!popcorn add` or the standard Roll20 initiative
3. Type `!popcorn start` to begin combat

It is recommneded to create [Macros](https://wiki.roll20.net/Macros) for commands you will use often. Share macroses for "Done" and "Toggle" with your players.

## 💻 Commands

### Basic Commands
- `!popcorn start` - Starts new combat, resets checkboxes, adds round counter
- `!popcorn add` - Adds selected token(s) to initiative
- `!popcorn toggle` - Toggles ✅/⬜ for selected token(s)

### Turn Management
- `!popcorn done` - Marks selected token(s) as finished. If not tokens are selected, marks all tokens
that are execlusively controlled by the player as finished
- `!popcorn done-all` - Marks all tokens as finished
- `!popcorn reset` - Resets selected token(s)
- `!popcorn reset-all` - Resets all tokens
- `!popcorn round` - Advances to next round. Formulas are calculated, Current Round counter is increased,
all turns are unchecked and tokens are shuffled if enabled
- `!popcorn shuffle` - Shuffles current turn order
- `!popcorn shuffle true/false` - Enables/disables auto-shuffling on round advancement

### Combat Commands
- `!popcorn kill` - Removes token(s) from initiative and marks as dead

## 🎮 Usage Tips

- 🎯 Select tokens before using token-specific commands
- 📝 Custom initiative formulas advance after each round
- 🔀 Use `!popcorn shuffle true` to enable automatic shuffling each round
- 🔢 Round counter shows current round number
- ☠️ Killed tokens are removed and marked with dead status
- 🎲 Players can use `!popcorn done` without selecting tokens to mark all their controlled tokens as done

## 🛠️ Development notes
Plugin is developed using [Roll20 API](https://wiki.roll20.net/Mod:Development) and [vitest](https://vitest.dev/) for testing.
Code of the script is located in `PopcornInitiative.js` file. Test - test/PopcornInitiative.test.js.
Tests have `global.` mocks for Roll20 API functions(e.g. `sendChat` or `isPlayerGM`). All tests are grouped by command.

In the global `beforeEach` and `afterEach` hooks, the script is loaded and unloaded, respectively. It should be done for each test.
If there is a better way - please let me know in the issues.

## 📝 License

MIT License
