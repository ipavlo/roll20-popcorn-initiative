const checked = "✅";
const unchecked = "⬜";
const currentRoundTitle = "→→Current Round←←";
const command = "!popcorn";
const toggleCmd = "toggle";
const startCmd = "start";
const addCmd = "add";
const doneCmd = "done";
const doneAllCmd = "done-all";
const resetCmd = "reset";
const resetAllCmd = "reset-all";
const roundCmd = "round";
const killCmd = "kill";
const helpCmd = "help";
const shuffleCmd = "shuffle";
const helpText = `<div style="background: linear-gradient(to bottom, #1a1d20, #2c3338); color: #eee; padding: 1.5em; border-radius: 12px; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 1px solid #3a4147;">
   <h1 style="color: #00b4ff; margin: 0 0 1em 0; text-align: center; font-size: 1.8em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🍿 Popcorn Initiative 🍿</h1>
   <div style="margin-bottom: 1.5em; padding-bottom: 1em; border-bottom: 1px solid #444;">
       <p style="margin: 0;">Popcorn Initiative allows for a more dynamic combat flow where characters can act in any order. After a character's turn, they choose who acts next. To begin combat:</p>
       <p style="margin: 0.5em 0; font-weight: bold;">1. Add tokens to the turn tracker, using <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn add</code> or any other way</p>
       <p style="margin: 0.5em 0; font-weight: bold;">2. Type <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn start</code> to begin</p>
   </div>

   <div style="margin: 1em 0;">
       <h3 style="color: #00b4ff;">Basic Commands</h3>
       <div style="margin-left: 1em;">
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn start</code> - Starts new fight, resets checkboxes, adds Current Round counter. Use it to begin a fight.<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn add</code> - Adds selected token(s) to initiative<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn toggle</code> - Toggles ✅/⬜ for selected token(s)
       </div>
   </div>

   <div style="margin: 1em 0;">
       <h3 style="color: #00b4ff;">Turn Management</h3>
       <div style="margin-left: 1em;">
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn done</code> - Marks selected token(s) as finished ✅. If no tokens are selected - all tokens controlled exclusively by player will be marked as done<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn done-all</code> - Marks all tokens as finished<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn reset</code> - Resets selected token(s) to ⬜<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn reset-all</code> - Resets all tokens<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn round</code> - Advances to next round<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn shuffle</code> - Shuffles current turn order<br>
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn shuffle true/false</code> - Enable/disable auto shuffling on each round(on round command). Default is false.<br>
       </div>
   </div>

   <div style="margin: 1em 0;">
       <h3 style="color: #00b4ff;">Combat Commands</h3>
       <div style="margin-left: 1em;">
           <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn kill</code> - Removes token(s) from initiative and marks as dead
       </div>
   </div>

   <div style="margin: 1em 0; border-top: 1px solid #444; padding-top: 1em;">
       <h3 style="color: #00b4ff;">Usage Notes</h3>
       <ul style="margin: 0; padding-left: 1.5em;">
           <li>Start a fight with <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn start</code> command!</li>
           <li>Select tokens before using token-specific commands</li>
           <li>Supports custom initiative formulas, they advance after each round</li>
           <li>Supports shuffling initiative with <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn shuffle</code></li>
           <li>Use <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">!popcorn shuffle true</code>to enable shuffling on each round</li>
           <li>Round counter <code style="color: #fff; background: #444; padding: 0.2em 0.4em; border-radius: 4px;">→→Current Round←←</code> shows current round number</li>
           <li>Killed tokens get removed and marked with dead status</li>
       </ul>
   </div>
</div>`;

var shuffling = false;


function getNotCustom(turnOrder) {
    return turnOrder.filter(turn => isRegular(turn));
}

function getCustom(turnOrder) {
    return turnOrder.filter(turn => isCustom(turn));
}
var turn = 0;

on("chat:message", function(msg) {
    if (msg.type !== "api") {
        return;
    }

    if (!msg.content.startsWith(command)) {
        return;
    }

    var fullCmd = msg.content.split(" ");

    if (fullCmd.length < 2) {
        help();
        return;
    }

    switch (fullCmd[1]) {
        case toggleCmd:
            toggle(msg);
            break;
        case startCmd:
            start(msg);
            break;
        case addCmd:
            add(msg);
            break;
        case doneAllCmd:
            doneAll();
            break;
        case doneCmd:
            done(msg);
            break;
        case resetAllCmd:
            resetAll();
            break;
        case resetCmd:
            reset(msg);
            break;
        case roundCmd:
            round();
            break;
        case killCmd:
            kill(msg);
            break;
        case shuffleCmd:
            shuffle(fullCmd, msg);
            break;
        default:
            help();
            break;
    }
});
function getTurnOrder() {
    return JSON.parse(Campaign().get("turnorder") || "[]");
}

function getTokenName(tokenId) {
    let token = getObj("graphic", tokenId);
    return token.get("name");
}

function writeChat(who, message) {
    sendChat("PopcornInitiative", who + " " + message);
}

function writeChatWithToken(who, message, tokenId) {
    sendChat("PopcornInitiative", who + " " + message + " " + getTokenName(tokenId));
}

function isRegular(turn) {
    return turn.custom === "" || turn.custom == undefined
}

function isCustom(turn) {
    return !isRegular(turn);
}

function toggle(msg) {
    let turnOrder = getTurnOrder();

    if (!msg.selected || msg.selected.length === 0) {
        writeChat(msg.who, "Please select one or more tokens to toggle the checkbox.");
        return;
    }

    msg.selected.forEach(selection => {
        getNotCustom(turnOrder).forEach(turn => {
            if (turn.id === selection._id) {
                writeChatWithToken(msg.who, "toggled checkbox", selection._id);
                turn.pr = turn.pr === checked ? unchecked : checked;
            }
        });
    });

    Campaign().set("turnorder", JSON.stringify(turnOrder));
}

function start(msg) {
    turn = 0;
    let turnOrder = getTurnOrder();

    if (turnOrder.length === 0) {
        sendChat("PopcornInitiative", "Turn order is empty");
        return;
    }

    getNotCustom(turnOrder).forEach(turn => {
        turn.pr = unchecked;
    });

    if (turnOrder[0].custom === currentRoundTitle) {
        turnOrder[0].pr = "1";
    } else {
        turnOrder.unshift({
            id: "-1",
            pr: "1",
            custom: currentRoundTitle,
            formula: "1",
            _pageid: msg._pageid,
        });
    }
    turnOrder = orderTurnOrder(turnOrder, shuffling);
    Campaign().set("turnorder", JSON.stringify(turnOrder));
    sendChat("PopcornInitiative", "Popcorn initiative started!");
}

function add(msg) {
    let turnOrder = getTurnOrder();

    if (!msg.selected || msg.selected.length === 0) {
        writeChat(msg.who, "Please select one or more tokens to add to the turn order.");
        return;
    }

    for (let i = 0; i < msg.selected.length; i++) {
        let tokenId = msg.selected[i]._id;
        let token = getObj("graphic", tokenId);

        if (!token) {
            continue;
        }

        let alreadyExists = turnOrder.some(turn => turn.id === tokenId);

        if (alreadyExists) {
            continue;
        }

        let turn = {
            id: tokenId,
            pr: unchecked,
        };
        turn._pageid = token.get("_pageid");

        turnOrder.push(turn);
        writeChatWithToken(msg.who, "added token to turn order", tokenId);
    }

    Campaign().set("turnorder", JSON.stringify(turnOrder));
}

function doneAll() {
    let turnOrder = JSON.parse(Campaign().get("turnorder") || "[]");
    getNotCustom(turnOrder).forEach(turn => {
        turn.pr = checked;
    });
    Campaign().set("turnorder", JSON.stringify(turnOrder));
    sendChat("PopcornInitiative", "Turn was set to done for all tokens");
}

function done(msg) {
    let turnOrder = getTurnOrder();

    // GM, usually, does not have tokens controlled by them
    // So, if no tokens are selected by GM, we can exit and do nothing
    if ((!msg.selected || msg.selected.length === 0) && playerIsGM(msg.playerid)) {
        sendChat("PopcornInitiative", "Please select one or more tokens to mark as done.");
        return;
    }

    if (msg.selected && msg.selected.length > 0) {
        msg.selected.forEach(selection => {
            getNotCustom(turnOrder).forEach(turn => {
                if (turn.id === selection._id) {
                    writeChatWithToken(msg.who, "marked as done", selection._id);
                    turn.pr = checked;
                }
            });
        });
    }

    if (!msg.selected || msg.selected.length === 0) {
        // controlledby is a comma-separated list of player ids
        // but done should only be applied to tokens controlled exclusively by the player
        getNotCustom(turnOrder)
            .filter((item) => getObj("graphic", item.id).get("controlledby") === msg.playerid)
            .forEach(turn => {
                writeChatWithToken(msg.who, "marked as done", turn.id);
                turn.pr = checked;
            });
    }


    Campaign().set("turnorder", JSON.stringify(turnOrder));
}

function resetAll() {
    let turnOrder = JSON.parse(Campaign().get("turnorder") || "[]");
    getNotCustom(turnOrder).forEach(turn => {
        turn.pr = unchecked;
    });
    Campaign().set("turnorder", JSON.stringify(turnOrder));
    sendChat("PopcornInitiative", "Turn was reset for all tokens");
}

function reset(msg) {
    let turnOrder = getTurnOrder();

    if (!msg.selected || msg.selected.length === 0) {
        sendChat("PopcornInitiative", "Please select one or more tokens to reset.");
        return;
    }

    msg.selected.forEach(selection => {
        getNotCustom(turnOrder).forEach(turn => {
            if (turn.id === selection._id) {
                writeChat(msg.who, "reset", selection._id);
                turn.pr = unchecked;
            }
        });
    });
    Campaign().set("turnorder", JSON.stringify(turnOrder));
}

function round() {

    let turnOrder = getTurnOrder();

    turnOrder.forEach(turn => {
        if (turn.custom === "" || turn.custom == undefined) {
            turn.pr = unchecked;
            return;
        }

        let current = parseInt(turn.pr, 10);
        // Negative formulas are not allowed to go below 0
        // Positive formulas can start with 0
        if (current == 0 && turn.formula.startsWith("-")) {
            return;
        }
        if (isNaN(current)) {
            turn.pr = "0";
            return;
        }
        let formula = parseInt(turn.formula, 10);
        if (isNaN(formula)) {
            return;
        }

        turn.pr = (current + formula).toString();

    });
    turnOrder = orderTurnOrder(turnOrder, shuffling);

    Campaign().set("turnorder", JSON.stringify(turnOrder));
    turn++;
}

function kill(msg) {
    let turnOrder = getTurnOrder();

    if (!msg.selected || msg.selected.length === 0) {
        sendChat("PopcornInitiative", "Please select one or more tokens to kill.");
        return;
    }

    let regular = getNotCustom(turnOrder);
    let toDelete = msg
        .selected
        .filter(selection => regular.some(turn => turn.id === selection._id))
        .map(selection => selection._id);

    turnOrder = turnOrder.filter(turn => !toDelete.includes(turn.id))

    toDelete.forEach(tokenId => {
        let token = getObj("graphic", tokenId);
        token.set("status_dead", true);
        writeChatWithToken(msg.who, "killed", tokenId);
    })

    Campaign().set("turnorder", JSON.stringify(turnOrder));
}

function shuffle(cmd, msg) {
    if (cmd.length == 3) {
        if (cmd[2] === "true") {
            shuffling = true;
            writeChat(msg.who, "enabled shuffling of the turn order");
        } else if (cmd[2] === "false") {
            writeChat(msg.who, "disabled shuffling of the turn order");
            shuffling = false;
        } else {
            writeChat(msg.who, "Invalid shuffle command. Use !popcorn shuffle true/false or !popcorn shuffle");
            return;
        }

        return;
    }

    let turnOrder = getTurnOrder();
    turnOrder = orderTurnOrder(turnOrder, true);
    Campaign().set("turnorder", JSON.stringify(turnOrder));

    writeChat(msg.who, "shuffled the turn order");
}

function orderTurnOrder(turnOrder, shouldShuffle = false) {
    let regular = getNotCustom(turnOrder);
    let custom = getCustom(turnOrder);
    let round = custom.find(turn => turn.custom === currentRoundTitle);
    if (shouldShuffle) {
        shuffleArray(regular);
    }
    if (round) {
        custom = custom.filter(turn => turn.custom !== round.custom);
        custom.unshift(round);
    }
    return custom.concat(regular);
}

function shuffleArray(arr) {
    if (!arr || arr.length < 2) {
        return;
    }

    if (arr.length === 2) {
        const temp = arr[0];
        arr[0] = arr[1];
        arr[1] = temp;
        return;
    }

    const randInt = (min) => Math.floor(Math.random() * ((arr.length - 1) - min + 1)) + min;
    currentFirst = arr[0].id;

    for (let i = 0; i < arr.length; i++) {
        const rand = randInt(0);
        const temp = arr[i];
        arr[i] = arr[rand];
        arr[rand] = temp;
    }
    // Avoid first token to be the same
    if (arr.length > 1 && arr[0].id === currentFirst) {
        const rand = randInt((arr.length - 1) / 2);
        const temp = arr[0];
        arr[0] = arr[rand];
        arr[rand] = temp;
    }

}


function help() {
    // Roll20 chat splits messages by newlines, so to show help as a single block, we need to remove newlines 
    sendChat("", helpText.trim().replace(/(?:\r\n|\r|\n)/g, ""));
}
