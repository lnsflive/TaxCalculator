"use strict";

var test = require("node:test");
var assert = require("node:assert/strict");
var calculator = require("../src/script.js");

function createStorage(initialValue) {
    var values = new Map(initialValue || []);

    return {
        getItem: function (key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem: function (key, value) {
            values.set(key, value);
        }
    };
}

test("calculates the documented Texas example", function () {
    assert.deepEqual(calculator.calculateTotals("14.37", 8.25), {
        price: 14.37,
        tax: 1.19,
        total: 15.56
    });
});

test("rounds currency at the cent boundary", function () {
    assert.deepEqual(calculator.calculateTotals("0.99", 8.25), {
        price: 0.99,
        tax: 0.08,
        total: 1.07
    });
});

test("rejects empty and negative prices", function () {
    assert.equal(calculator.calculateTotals("", 8.25), null);
    assert.equal(calculator.calculateTotals("-1", 8.25), null);
});

test("saves and reloads custom settings", function () {
    var storage = createStorage();

    assert.equal(calculator.saveSettings(storage, { location: "Austin", rate: 7.75 }), true);
    assert.deepEqual(calculator.loadSettings(storage), {
        location: "Austin",
        rate: 7.75
    });
});

test("falls back to Texas defaults when saved data is invalid", function () {
    var storage = createStorage([
        [calculator.SETTINGS_KEY, "not-json"]
    ]);

    assert.deepEqual(calculator.loadSettings(storage), calculator.DEFAULT_SETTINGS);
});
