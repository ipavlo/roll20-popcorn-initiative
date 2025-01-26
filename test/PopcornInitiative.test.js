import { describe, test, expect, it, vitest, beforeEach, afterEach } from 'vitest';

const mockTurnOrder = [];
const chatMessages = [];
var tokens = {};
const uncheckedEmoji = "⬜";
const checkedEmoji = "✅";
var gmPlayer = "GM";

global.playerIsGM = function(playerid) {
    return playerid === gmPlayer;
};

global.Campaign = () => ({
    get: function(prop) {
        if (prop === 'turnorder') {
            return JSON.stringify(mockTurnOrder);
        }
        return null;
    },
    set: function(prop, value) {
        if (prop === 'turnorder') {
            mockTurnOrder.length = 0;
            mockTurnOrder.push(...JSON.parse(value));
        }
    },
});

global.sendChat = (channel, message) => {
    chatMessages.push({
        channel: channel,
        message: message,
    })
}

global.getObj = function(type, id) {
    if (type === 'graphic') {
        return tokens[id];
    }
}
global.events = {};
global.on = function(event, callback) {
    global.events[event] = callback;
}

global.triggerEvent = function(event, msg) {
    global.events[event](msg);
}

export { };
beforeEach(() => {
    global.events = {};
    mockTurnOrder.length = 0;
    tokens = {};
    chatMessages.length = 0;

    require('../PopcornInitiative.js');

});
afterEach(() => {
    delete require.cache[require.resolve('../PopcornInitiative.js')];
});

describe('!popcorn start', () => {
    it('should initialize turns and add Current Round', () => {

        // Arrange
        const msg = createMsg("!popcorn start");
        mockTurnOrder.push({
            id: "1",
            custom: undefined,
            pr: "123",
        })
        mockTurnOrder.push({
            id: "2",
            custom: undefined,
            pr: "456",
        })

        mockTurnOrder.push({
            id: "-1",
            custom: "TestCustom",
            pr: "789",
        });

        // Act
        global.triggerEvent('chat:message', msg);

        // Assert

        expect(mockTurnOrder.length).toBe(4);
        // first should be current round
        expect(mockTurnOrder[0].pr).toBe("1");
        expect(mockTurnOrder[0].custom).toBe("→→Current Round←←");
        expect(mockTurnOrder[1].custom).toBe("TestCustom");

        expect(mockTurnOrder[2].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[3].pr).toBe(uncheckedEmoji);
    });
    it('should not add Current Round if turn order is empty', () => {
        const msg = createMsg("!popcorn start");

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(0);
    });
    it("should change Current Round to '1'", () => {
        const msg = createMsg("!popcorn start");

        mockTurnOrder.push({
            id: "-1",
            custom: "→→Current Round←←",
            pr: "4",
        });
        mockTurnOrder.push({
            id: "2",
            custom: undefined,
            pr: "2",
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(2);
        expect(mockTurnOrder[0].pr).toBe("1");
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
    })
})

describe('!popcorn add', () => {
    it('should add token to turn order', () => {
        const msg = createMsg("!popcorn add");
        msg.selected = [{ _id: "Token1" }];
        tokens["Token1"] = new Map();
        tokens["Token1"]._pageid = "1";

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(1);
        expect(mockTurnOrder[0].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[0].id).toBe("Token1");
    })
    it('should not add if no token is selected', () => {
        const msg = createMsg("!popcorn add");
        tokens["1"] = new Map();

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(0);
    })
    it('should not add duplicated id', () => {
        const msg = createMsg("!popcorn add");
        msg.selected = [{ _id: "Token1" }, { _id: "Token2" }];
        tokens["Token1"] = new Map();
        tokens["Token1"]._pageid = "Page1";
        tokens["Token2"] = new Map();
        tokens["Token2"]._pageid = "Page1";

        mockTurnOrder.push({
            id: "Token1",
            pr: uncheckedEmoji,
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(2);
        expect(mockTurnOrder[0].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[0].id).toBe("Token1");
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[1].id).toBe("Token2");
    })
})

describe('!popcorn done-all', () => {
    it('should set all turn to done', () => {
        const msg = createMsg("!popcorn done-all");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji
        })
        mockTurnOrder.push({
            id: "2"
        })
        mockTurnOrder.push({
            id: "3",
            pr: checkedEmoji
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[0].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[1].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[2].pr).toBe(checkedEmoji);
    })
    it('should not change custom items', () => {
        const msg = createMsg("!popcorn done-all");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            custom: "Custom"
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(2);
        expect(mockTurnOrder[0].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[1].custom).toBe("Custom");
    })
})

describe("!popcorn done", () => {
    it("should set selected to done", () => {
        const msg = createMsg("!popcorn done");
        msg.selected = [{ _id: "1" }];
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: uncheckedEmoji,
        })
        tokens["1"] = new Map();
        tokens["1"].name = "Token1";
        tokens["2"] = new Map();
        tokens["2"].name = "Token2";

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(2);
        expect(mockTurnOrder[0].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
    })

    it('should do nothing if no token is selected for GM', () => {
        const msg = createMsg("!popcorn done");
        msg.playerid = gmPlayer;
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(2);
        expect(mockTurnOrder[0].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[1].pr).toBe(checkedEmoji);
        expect(chatMessages.length).toBe(1);
        expect(chatMessages[0].message).toBe("Please select one or more tokens to mark as done.");
    })
    it('should mark done all tokens controlled by user if no token is selected', () => {
        const msg = createMsg("!popcorn done");
        msg.playerid = "TestPlayer1";
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom",
            pr: "42",
        });
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: uncheckedEmoji,
        })
        tokens["1"] = new Map();
        tokens["1"].set("controlledby", "TestPlayer1");
        tokens["2"] = new Map();
        tokens["2"].set("controlledby", "TestPlayer2");

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[1].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[2].pr).toBe(uncheckedEmoji);
    });
})

describe('!popcorn reset-all', () => {
    it('should reset all', () => {
        const msg = createMsg("!popcorn reset-all");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom",
            pr: "42"
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[0].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[2].pr).toBe("42");
    })
})

describe('!popcorn reset', () => {
    it('should reset selected', () => {
        const msg = createMsg("!popcorn reset");
        msg.selected = [{ _id: "2" }];
        mockTurnOrder.push({
            id: "1",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "-1",
            pr: "42",
            custom: "Custom"
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[0].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[2].pr).toBe("42");
    })
})

describe('!popcorn toggle', () => {
    it('should toggle selected', () => {
        const msg = createMsg("!popcorn toggle");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "-12",
            custom: "Custom",
            pr: "42",
        })
        msg.selected = [{ _id: "1" }, { _id: "2" }]
        tokens["1"] = new Map();
        tokens["1"].name = "Token1";
        tokens["2"] = new Map();
        tokens["2"].name = "Token2";
        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[0].pr).toBe(checkedEmoji);
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[2].pr).toBe("42");
    })
})

describe('!popcorn round', () => {
    it('round should reset all', () => {
        const msg = createMsg("!popcorn round");
        mockTurnOrder.push({
            id: "1",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom",
            pr: "44"
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(mockTurnOrder[0].pr).toBe("44");
        expect(mockTurnOrder[1].pr).toBe(uncheckedEmoji);
        expect(mockTurnOrder[2].pr).toBe(uncheckedEmoji);
    })

    it('should advance custom with formulas', () => {
        const msg = createMsg("!popcorn round");
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom 1",
            pr: "10",
            formula: "1",
        })
        mockTurnOrder.push({
            id: "-1",
            pr: "5",
            custom: "Custom 2",
            formula: "-4",
        })

        mockTurnOrder.push({
            id: "-1",
            pr: "3",
            custom: "Custom 3",
        })

        mockTurnOrder.push({
            id: "-1",
            pr: "0",
            formula: "-1",
            custom: "Custom 4",
        })


        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder[0].pr).toBe("11");
        expect(mockTurnOrder[1].pr).toBe("1");
        expect(mockTurnOrder[2].pr).toBe("3");
        expect(mockTurnOrder[3].pr).toBe("0");
    })

    it('should advance custom with plus formula but 0 value', () => {
        const msg = createMsg("!popcorn round");
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom 1",
            pr: "0",
            formula: "1",
        })

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder[0].pr).toBe("1");
    });
})

describe('!popcorn kill', () => {
    it('should remove selected', () => {
        const msg = createMsg("!popcorn kill");
        msg.selected = [{ _id: "1" }, { _id: "2" }];
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "-1",
            custom: "Custom",
            pr: "42",
        })

        tokens["1"] = new Map();
        tokens["2"] = new Map();


        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(1);
        expect(mockTurnOrder[0].pr).toBe("42");
        expect(tokens["1"].get("status_dead")).toBe(true);
        expect(tokens["2"].get("status_dead")).toBe(true);
    })
});

describe('!popcorn shuffle true', () => {
    it('should shuffle on start', () => {
        const msg = createMsg("!popcorn shuffle true");
        const msg2 = createMsg("!popcorn start");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "3",
            pr: checkedEmoji,
        })
        let originalOrder = [...mockTurnOrder];

        global.triggerEvent('chat:message', msg);
        global.triggerEvent('chat:message', msg2);

        expect(mockTurnOrder.length).toBe(4);
        expect(isShuffled(originalOrder, mockTurnOrder.slice(1))).toBe(true);
        expect(mockTurnOrder.slice(1).map(x => x.id)).toEqual(expect.arrayContaining(["1", "2", "3"]));
    });

    it('should shuffle on round', () => {
        const msg = createMsg("!popcorn shuffle true");
        const msg2 = createMsg("!popcorn round");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "3",
            pr: checkedEmoji,
        })
        let originalOrder = [...mockTurnOrder];

        global.triggerEvent('chat:message', msg);
        global.triggerEvent('chat:message', msg2);

        expect(mockTurnOrder.length).toBe(3);
        expect(isShuffled(originalOrder, mockTurnOrder)).toBe(true);
        expect(mockTurnOrder.map(x => x.id)).toEqual(expect.arrayContaining(["1", "2", "3"]));
    });

});

describe('!popcorn shuffle', () => {
    it('should shuffle once', () => {
        const msg = createMsg("!popcorn shuffle");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "3",
            pr: checkedEmoji,
        })
        let originalOrder = [...mockTurnOrder];

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(isShuffled(originalOrder, mockTurnOrder)).toBe(true);
        expect(mockTurnOrder.map(x => x.id)).toEqual(expect.arrayContaining(["1", "2", "3"]));
    });

    it('first regular entry must always change', () => {
        const msg = createMsg("!popcorn shuffle");
        mockTurnOrder.push({
            id: "1",
            pr: uncheckedEmoji,
        })
        mockTurnOrder.push({
            id: "2",
            pr: checkedEmoji,
        })
        mockTurnOrder.push({
            id: "3",
            pr: checkedEmoji,
        })
        let originalOrder = [...mockTurnOrder];

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(3);
        expect(isShuffled(originalOrder, mockTurnOrder)).toBe(true);
        expect(mockTurnOrder.map(x => x.id)).toEqual(expect.arrayContaining(["1", "2", "3"]));
        expect(mockTurnOrder[0].id).not.toBe("1");
    });
    it('should not shuffle if 0 entries', () => {
        const msg = createMsg("!popcorn shuffle");

        global.triggerEvent('chat:message', msg);

        expect(mockTurnOrder.length).toBe(0);
    });

});

function createMsg(content) {
    return {
        content: content,
        type: "api",
        who: "TestPlayer",
    };
}

function isShuffled(original, shuffled) {
    if (original.length !== shuffled.length) {
        return false;
    }
    for (let i = 0; i < original.length; i++) {
        if (original[i].id !== shuffled[i].id) {
            return true;
        }
    }
    return false
}
