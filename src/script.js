(function (globalScope) {
    "use strict";

    var SETTINGS_KEY = "taxCalculator.settings.v1";
    var DEFAULT_SETTINGS = Object.freeze({
        location: "Texas",
        rate: 8.25
    });

    function normalizeSettings(value) {
        var location = value && typeof value.location === "string"
            ? value.location.trim().slice(0, 60)
            : "";
        var rate = value ? Number(value.rate) : NaN;

        return {
            location: location || DEFAULT_SETTINGS.location,
            rate: Number.isFinite(rate) && rate >= 0 && rate <= 100
                ? rate
                : DEFAULT_SETTINGS.rate
        };
    }

    function loadSettings(storage) {
        try {
            var saved = storage.getItem(SETTINGS_KEY);
            return saved ? normalizeSettings(JSON.parse(saved)) : normalizeSettings(DEFAULT_SETTINGS);
        } catch (error) {
            return normalizeSettings(DEFAULT_SETTINGS);
        }
    }

    function saveSettings(storage, settings) {
        try {
            storage.setItem(SETTINGS_KEY, JSON.stringify(normalizeSettings(settings)));
            return true;
        } catch (error) {
            return false;
        }
    }

    function calculateTotals(rawPrice, rate) {
        if (rawPrice === "" || rawPrice === null || rawPrice === undefined) {
            return null;
        }

        var price = Number(rawPrice);
        var normalizedRate = Number(rate);

        if (!Number.isFinite(price) || price < 0 || !Number.isFinite(normalizedRate) || normalizedRate < 0) {
            return null;
        }

        var priceCents = Math.round(price * 100);
        var taxCents = Math.round(priceCents * normalizedRate / 100);

        return {
            price: priceCents / 100,
            tax: taxCents / 100,
            total: (priceCents + taxCents) / 100
        };
    }

    function formatCurrency(value) {
        return "$" + value.toFixed(2);
    }

    function formatRate(rate) {
        return Number(rate.toFixed(3)).toString() + "%";
    }

    function initializeCalculator(documentObject, storage) {
        var priceInput = documentObject.querySelector(".price");
        var salesTaxOutput = documentObject.querySelector(".sales-tax");
        var taxTotalOutput = documentObject.querySelector(".tax-total");
        var totalOutput = documentObject.querySelector(".total");
        var salesTaxLabel = documentObject.querySelector("#sales-tax-label");
        var locationInput = documentObject.querySelector("#tax-location");
        var rateInput = documentObject.querySelector("#tax-rate");
        var priceError = documentObject.querySelector("#price-error");
        var rateError = documentObject.querySelector("#rate-error");
        var saveStatus = documentObject.querySelector("#save-status");
        var resetButton = documentObject.querySelector(".reset");
        var settingsPanel = documentObject.querySelector(".tax-settings");
        var settings = loadSettings(storage);

        function renderSettings() {
            locationInput.value = settings.location;
            rateInput.value = settings.rate;
            salesTaxLabel.textContent = "Sales tax · " + settings.location;
            salesTaxOutput.textContent = formatRate(settings.rate);
        }

        function renderTotals() {
            var totals = calculateTotals(priceInput.value, settings.rate);

            priceError.textContent = priceInput.value !== "" && !totals
                ? "Enter an amount of zero or more."
                : "";
            taxTotalOutput.textContent = totals ? formatCurrency(totals.tax) : "$0.00";
            totalOutput.textContent = totals ? formatCurrency(totals.total) : "$0.00";
        }

        function updateSettings() {
            var rate = Number(rateInput.value);

            if (rateInput.value === "" || !Number.isFinite(rate) || rate < 0 || rate > 100) {
                rateError.textContent = "Enter a rate from 0 to 100.";
                saveStatus.textContent = "";
                return;
            }

            rateError.textContent = "";
            settings = normalizeSettings({
                location: locationInput.value,
                rate: rate
            });

            var saved = saveSettings(storage, settings);
            salesTaxLabel.textContent = "Sales tax · " + settings.location;
            salesTaxOutput.textContent = formatRate(settings.rate);
            saveStatus.textContent = saved
                ? "Saved in this browser."
                : "This browser blocked saved settings.";
            renderTotals();
        }

        priceInput.addEventListener("input", renderTotals);
        locationInput.addEventListener("input", updateSettings);
        rateInput.addEventListener("input", updateSettings);
        resetButton.addEventListener("click", function () {
            priceInput.value = "";
            priceError.textContent = "";
            taxTotalOutput.textContent = "$0.00";
            totalOutput.textContent = "$0.00";
            priceInput.focus();
        });

        if (globalScope.matchMedia && globalScope.matchMedia("(min-width: 48rem)").matches) {
            settingsPanel.open = true;
        }

        renderSettings();
        renderTotals();
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            SETTINGS_KEY: SETTINGS_KEY,
            DEFAULT_SETTINGS: DEFAULT_SETTINGS,
            normalizeSettings: normalizeSettings,
            loadSettings: loadSettings,
            saveSettings: saveSettings,
            calculateTotals: calculateTotals,
            formatRate: formatRate
        };
    }

    if (globalScope.document) {
        globalScope.document.addEventListener("DOMContentLoaded", function () {
            initializeCalculator(globalScope.document, globalScope.localStorage);
        });
    }
}(typeof window !== "undefined" ? window : globalThis));
