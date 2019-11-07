// ==UserScript==
// @name         Override Fonts wih Default
// @namespace    lonm.fontOverrride
// @version      1.0.0
// @description  Make all font family rules use one of the expected defaults
// @author       lonm
// @match        *://*/*
// @compatible   chrome >=78
// ==/UserScript==

"use strict";

const DEFAULTS = [
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy",
    "inherit",
    "unset",
    "default",
    "auto",
    "none"
];

let overrides = "";

function getFontFamily(fontstack){
    const normalised = fontstack.toLowerCase().replace(" ","");
    for (const font of DEFAULTS) {
        if(normalised===font){
            return;
            /* We don't need to re-write this rule, it's already a default */
        }
        if(normalised.indexOf(font) >= 0){
            return font;
        }
    }
    /* it didn't specify a default - it may be an icon font */
}

function makeNewRule(selector, fallback, important){
    if(selector && fallback){ /* if there wasn't a valid selector or fallback font, do nothing */
        overrides += `${selector} {font-family: ${fallback} !important}
`;
    }
}

function isFontRule(rule){
    return rule instanceof CSSStyleRule && rule.cssText.indexOf("font-family") >= 0;
}

function overrideRule(rule){
    const selector = rule.selectorText;
    const fallback = getFontFamily(rule.style.fontFamily);
    makeNewRule(selector, fallback);
}

function isRecursiveRule(rule){
    return rule instanceof CSSImportRule || rule instanceof CSSMediaRule;
}

function overrideRuleList(ruleList){
    for (const rule of ruleList) {
        if(isRecursiveRule(rule)){
            overrideRuleList(rule.cssRules);
        } else if (isFontRule(rule)){
            overrideRule(rule);
        }
    }
}

function overrideSheet(stylesheet){
    try {
        overrideRuleList(stylesheet.cssRules);
    } catch (error) {
        console.warn(`UserScript Font Override failed to operate on ${stylesheet.href ? stylesheet.href : "<style>"}`)
    }
}

function overrideStylesheets(){
    overrides = "";
    for (const sheet of document.styleSheets) {
        overrideSheet(sheet);
    }
    document.head.insertAdjacentHTML("beforeend", `<style type="text/css" id="userScriptFontOverride">${overrides}</style>`);
}

overrideStylesheets();

/**
 * TODOs
 * figure out how CSS imports actually work, and if you can test them locally
 * figure out why linked stylesheets sometimes fail to load
 * style attributes
 * check interference with icon fonts
 * if possible, override emoji fonts (unless its images, then we can't do anything)
 * respect !important rules
 */

// Override style=""
    // for each element in querySelector [style*=font-family]
        // get font stack
        // string replace font stack with just the fallback
