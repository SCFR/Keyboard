app.config([ "$stateProvider", "$locationProvider", "$mdThemingProvider", function(a, b, c) {
    var d = {
        "50": "#8eb7c3",
        "100": "#7eacba",
        "200": "#6da1b1",
        "300": "#5d97a8",
        "400": "#52899a",
        "500": "#497A89",
        "600": "#406b78",
        "700": "#375c68",
        "800": "#2e4e57",
        "900": "#263f46",
        A100: "#9fc1cc",
        A200: "#b0ccd5",
        A400: "#c0d7de",
        A700: "#1d3036"
    };
    c.definePalette("customPrimary", d);
    var e = {
        "50": "#142125",
        "100": "#1d3036",
        "200": "#263f46",
        "300": "#2e4e57",
        "400": "#375c68",
        "500": "#406b78",
        "600": "#52899a",
        "700": "#5d97a8",
        "800": "#6da1b1",
        "900": "#7eacba",
        A100: "#52899a",
        A200: "#497a89",
        A400: "#406b78",
        A700: "#8eb7c3"
    };
    c.definePalette("customAccent", e);
    var f = {
        "50": "#ffb280",
        "100": "#ffa266",
        "200": "#ff934d",
        "300": "#ff8333",
        "400": "#ff741a",
        "500": "#ff6400",
        "600": "#e65a00",
        "700": "#cc5000",
        "800": "#b34600",
        "900": "#993c00",
        A100: "#ffc199",
        A200: "#ffd1b3",
        A400: "#ffe0cc",
        A700: "#803200"
    };
    c.definePalette("customWarn", f);
    var g = {
        "50": "#587487",
        "100": "#4e6778",
        "200": "#445a68",
        "300": "#3a4d59",
        "400": "#303f49",
        "500": "#26323a",
        "600": "#1c252b",
        "700": "#12171b",
        "800": "#282e31",
        "900": "#000000",
        A100: "#303f49",
        A200: "#718ea2",
        A400: "#1c252b",
        A700: "#000000"
    };
    c.definePalette("customBackground", g), c.theme("default").primaryPalette("customPrimary").accentPalette("customAccent").warnPalette("customWarn").backgroundPalette("customBackground").dark();
} ]);

var scripts = document.getElementsByTagName("script"), path = scripts[scripts.length - 1].src.split("?")[0], KEYBOARDPATH = path.split("/").slice(0, -1).join("/") + "/", APIPATH = KEYBOARDPATH + "../../../..";

String.prototype.isEmpty = function() {
    return 0 === this.length || !this.trim();
}, app.requires.push("as.sortable"), app.requires.push("ngMaterial"), app.service("SCFRKeyboardAPI", [ "$http", function(a) {
    return this.editKeyboard = function(b) {
        var c = (b.version_id, b.name, APIPATH + "/wp-json/Keyboard/Edit/"), d = a.post(c, {
            keyboard: b
        }).then(function(a) {
            return a.data;
        });
        return d;
    }, this.deleteKeyboard = function(b) {
        var c = APIPATH + "/wp-json/Keyboard/Delete/", d = a.post(c, {
            keyboard: b
        }).then(function(a) {
            return a.data;
        });
        return d;
    }, this;
} ]), app.controller("Keyboard.main", [ "$scope", "SCFRKeyboardAPI", "$document", function(a, b, c) {
    a.selector = CURRENT_PAGE.model, a.isEditMod = !1, a.pressedLetter = !1, selectKeyboard = function(b) {
        delete a.currentKeyboard, a.currentKeyboard = angular.copy(b), a.currentKeyboard.keyboard_keys.modificators = a.currentKeyboard.keyboard_keys.modificators || {}, 
        a.currentKeyboard.keyboard_keys.keys = a.currentKeyboard.keyboard_keys.keys || {}, 
        angular.forEach(a.currentKeyboard.keyboard_keys.keys, function(b, c) {
            angular.forEach(b, function(a, c) {
                "" == a && delete b[c];
            }), 0 == b.length && (a.currentKeyboard.keyboard_keys.keys[c] = {});
        }), a.currentVersion = b.version_id, a.currentName = b.name, a.newVersion = a.currentVersion, 
        a.newName = a.currentName, a.currentKeyboard.keyCount = Object.keys(a.currentKeyboard.keyboard_keys.keys).length, 
        a.currentKeyboard.modificatorCount = Object.keys(a.currentKeyboard.keyboard_keys.modificators).length, 
        a.currentKeyboard.date_last_modified = Date.parse(a.currentKeyboard.date_last_modified), 
        a.currentKeyboard.date_created = Date.parse(a.currentKeyboard.date_created), a.colorized = [], 
        a.$broadcast("newKeyboard");
    }, a.addModifier = function(b, c) {
        c || (c = ""), a.currentKeyboard.keyboard_keys.modificators[b] = c;
    }, a.remModifier = function(b) {
        delete a.currentKeyboard.keyboard_keys.modificators[b];
    }, a.getModifiers = function() {
        return angular.copy(a.currentKeyboard.keyboard_keys.modificators);
    }, a.updateKey = function(b, c) {
        a.currentKeyboard.keyboard_keys.keys[b] = c;
    }, a.getKey = function(b) {
        return a.currentKeyboard && a.currentKeyboard.keyboard_keys && a.currentKeyboard.keyboard_keys.keys ? a.currentKeyboard.keyboard_keys.keys[b] : null;
    }, a.getKeyModifier = function(b) {
        if (a.currentKeyboard && a.currentKeyboard.keyboard_keys && a.currentKeyboard.keyboard_keys.modificators) var c = !!a.currentKeyboard.keyboard_keys.modificators[b], d = c ? angular.copy(a.currentKeyboard.keyboard_keys.modificators[b]) : "";
        return {
            is: c,
            name: d
        };
    }, a.editMod = function(b) {
        a.isEditMod = b, a.$broadcast("editModToggle", b), b === !1 && 0 === a.currentKeyboard.id && (a.currentKeyboard = angular.copy(a.prevKeyboard));
    }, a.copyKeyboard = function() {
        a.prevKeyboard = angular.copy(a.currentKeyboard), a.currentKeyboard.id = 0, a.newName = "", 
        a.currentKeyboard.date_created = a.currentKeyboard.date_last_modified = null;
    }, a.deleteKeyboard = function() {
        a.busy || (a.busy = !0, confirm("Êtes vous sur de vouloir supprimer ce clavier ?") && (0 === a.currentKeyboard.id ? a.editMod(!1) : a.currentKeyboard.id > 0 && b.deleteKeyboard(a.currentKeyboard).then(function(b) {
            a.busy = !1, a.editMod(!1), delete a.selector.keyboards[a.currentKeyboard.version_id][a.currentKeyboard.name], 
            selectFirstKeyboard();
        })));
    }, a.escapize = function(b) {
        var c = b.toLowerCase().replace(/\s/g, "");
        return [ "altgr", "alt", "f3", "default" ].indexOf(c) != -1 ? "colorize_" + c : (a.colorized.indexOf(c) == -1 && a.colorized.push(c), 
        "colorize_" + a.colorized.indexOf(c));
    }, a.submitNewKeyboard = function() {
        a.busy || (a.busy = !0, a.needVersion = a.needName = !1, a.newVersion || (a.needVersion = !0), 
        a.newName || (a.needName = !0), a.needVersion || a.needName || (a.oldVersion = a.currentKeyboard.version_id, 
        a.oldName = a.currentKeyboard.name, a.currentKeyboard.name = a.newName, a.currentKeyboard.version_id = a.newVersion, 
        b.editKeyboard(a.currentKeyboard).then(function(b) {
            a.currentKeyboard.id > 0 && delete a.selector.keyboards[a.oldVersion][a.oldName], 
            a.selector.keyboards[a.newVersion] || (a.selector.keyboards[a.newVersion] = {}), 
            a.selector.keyboards[a.newVersion][a.newName] = a.currentKeyboard, selectKeyboard(a.selector.keyboards[a.newVersion][a.newName]), 
            a.editMod(!1), a.busy = !1;
        })));
    }, a.$on("textChanged", function(b, c, d) {
        d && c && a.updateKey(c, d);
    }), a.$on("modifierChanged", function(b, c, d) {
        a.addModifier(c, d);
    }), a.$watch("currentName", function(b) {
        a.currentVersion && a.currentName && a.currentKeyboard != a.selector.keyboards[a.currentVersion][a.currentName] && selectKeyboard(a.selector.keyboards[a.currentVersion][a.currentName]);
    }), selectFirstKeyboard = function() {
        selectKeyboard(a.selector.keyboards[Object.keys(a.selector.keyboards)[0]][Object.keys(a.selector.keyboards[Object.keys(a.selector.keyboards)[0]])[0]]);
    };
    var d = null, e = 0;
    c.keydown(function(b) {
        if (!a.isEditMod) {
            if (!(b.keyCode != d || 17 == d && e < 2)) return;
            d = b.keyCode;
            var c = null;
            16 == b.keyCode ? c = 1 == b.originalEvent.location ? "Maj" : "Maj d" : 17 == b.keyCode ? (1 == e && (c = 1 == b.originalEvent.location ? "Ctrl" : "Ctrl d"), 
            e++) : 18 == b.keyCode ? (e = 0, c = 1 == b.originalEvent.location ? "Alt" : "Alt GR", 
            b.preventDefault()) : 20 == b.keyCode ? (c = "Caps", b.preventDefault()) : 32 == b.keyCode ? (c = "Espace", 
            b.preventDefault()) : 9 == b.keyCode ? (c = "Tab", b.preventDefault()) : 8 == b.keyCode ? (c = "Retour", 
            b.preventDefault()) : 13 == b.keyCode ? (c = "Entrée", b.preventDefault()) : 27 == b.keyCode ? (c = "Echap", 
            b.preventDefault()) : 112 == b.keyCode ? (c = "F1", b.preventDefault()) : 113 == b.keyCode ? (c = "F2", 
            b.preventDefault()) : 114 == b.keyCode ? (c = "F3", b.preventDefault()) : 115 == b.keyCode ? (c = "F4", 
            b.preventDefault()) : 116 == b.keyCode ? (c = "F5", b.preventDefault()) : 117 == b.keyCode ? (c = "F6", 
            b.preventDefault()) : 118 == b.keyCode ? (c = "F7", b.preventDefault()) : 119 == b.keyCode ? (c = "F8", 
            b.preventDefault()) : 120 == b.keyCode ? (c = "F9", b.preventDefault()) : 121 == b.keyCode ? (c = "F10", 
            b.preventDefault()) : 122 == b.keyCode ? (c = "F11", b.preventDefault()) : 123 == b.keyCode ? (c = "F12", 
            b.preventDefault()) : 45 == b.keyCode ? (c = "Ins", b.preventDefault()) : 46 == b.keyCode ? (c = "Suprr", 
            b.preventDefault()) : 35 == b.keyCode ? (c = "Fin", b.preventDefault()) : 36 == b.keyCode ? (c = "Home", 
            b.preventDefault()) : 33 == b.keyCode ? (c = "Page Up", b.preventDefault()) : 34 == b.keyCode ? (c = "Page Down", 
            b.preventDefault()) : 38 == b.keyCode ? (c = "Haut", b.preventDefault()) : 37 == b.keyCode ? (c = "Gauche", 
            b.preventDefault()) : 40 == b.keyCode ? (c = "Bas", b.preventDefault()) : 39 == b.keyCode && (c = "Droite", 
            b.preventDefault()), c && switchPressedLetters(c);
        }
    }), c.keypress(function(b) {
        if (!a.isEditMod) {
            var c = String.fromCharCode(b.which);
            switchPressedLetters(c);
        }
    }), c.keyup(function(b) {
        a.isEditMod || resetPressedLetter();
    }), resetPressedLetter = function() {
        a.pressedLetter = !1, d = null, e = 0, a.$broadcast("keyPressed", !1);
    }, switchPressedLetters = function(b) {
        a.pressedLetter === !1 && b != a.pressedLetter && (a.pressedLetter = b, a.$broadcast("keyPressed", b));
    }, a.addNewSection = function() {
        a.currentKeyboard.keyboard_keys.sections ? a.currentKeyboard.keyboard_keys.sections.push({
            title: "Entrez le titre de la section",
            description: "Entrez la description de la section"
        }) : a.currentKeyboard.keyboard_keys.sections = [ {
            title: "Entrez le titre de la section",
            description: "Entrez la description de la section"
        } ];
    };
    var f = 0;
    a.$on("doneUpadtingKey", function() {
        f++, 111 == f && (a.$digest(), f = 0);
    }), selectFirstKeyboard();
} ]), app.controller("aSingleKey", [ "$scope", "$element", "$timeout", function(a, b, c) {
    a.clicked = !1, a.keyText = {
        0: null
    }, a.editMod = !1, a.isUsed = !1;
    var d = keyHeight = 77, e = 5;
    a.charTable || (a.charTable = {
        maj: a.majChar,
        normal: a["char"],
        altGr: a.altGrChar
    }), a.$on("editModToggle", function(b, c) {
        a.editMod = c;
    }), init = function() {
        delete a.keyText, a.modifierName = "", a.isModifier = !1;
        var b = a.$parent.getKeyModifier(a["char"]);
        a.isModifier = b.is, a.modifierName = angular.copy(b.name);
        var c = a.$parent.getKey(a["char"]);
        c && 0 != c.length || (c = {
            "default": null
        }), a.keyText = angular.copy(c);
    }, init(), a.escapize = a.$parent.escapize, a.toggleClick = function() {
        a.clicked = !a.clicked;
    }, a.$watch("isModifier", function(b) {
        b ? a.$parent.addModifier(a["char"], a.modifierName) : a.$parent.remModifier(a["char"]);
    }), a.$watchCollection("keyText", function(b) {
        if (b) {
            var c = {};
            angular.forEach(b, function(a, b) {
                null !== a && (c[b] = a);
            }), Object.keys(c).length > 0 ? (a.$emit("textChanged", a["char"], c), a.isUsed = !0) : a.isUsed = !1;
        }
    }, !0), a.$watch("modifierName", function(b) {
        a.isModifier && b && a.$emit("modifierChanged", a["char"], b);
    }), a.$watch("clicked", function(a) {
        removeAllKeysStyle();
        var f = $(b).position();
        a && c(function() {
            $(b).css("top", f.top - e / 2 * keyHeight).css("left", f.left - e / 2 * d), $(b).next(":not(.lastitem, .break)").css("margin-left", 6 + d + "px"), 
            $(b).is(".break") && $(b).next().css("clear", "left");
            var a = $(b)[0].getBoundingClientRect();
            if (a.left < 0) {
                var c = -a.left + 15;
                $(b).css("margin-left", c + "px"), $(b).css("margin-right", "-" + (c - 5) + "px");
            } else if (a.right + a.width > $(window).width()) var c = $(window).width() - (a.right + a.width) - 15;
        }, 0);
    }), removeAllKeysStyle = function() {
        $("#keyboardContainer ul li").removeAttr("style").removeClass("clicked");
    }, a.$on("newKeyboard", function() {
        delete a.keyText, a.modifierName = "", a.isModifier = !1;
        var b = a.$parent.getKeyModifier(a["char"]);
        a.isModifier = b.is, a.modifierName = angular.copy(b.name), a.keyText = angular.copy(a.$parent.getKey(a["char"])) || {
            0: null
        };
    }), a.$on("keyPressed", function(b, c) {
        var d = !1;
        0 == c ? d = !1 : c == a["char"] ? d = !0 : null != a.keyText[c] && (d = !0), a.clicked = !1, 
        a.focused = d, a.$emit("doneUpadtingKey");
    });
} ]), app.controller("aListSectionController", [ "$scope", "$element", "$timeout", function(a, b, c) {
    a.section = a.section || {
        title: "Divers",
        description: "Toutes les autres touches du claviers non catégorisées."
    }, a.$parent.$watch("currentKeyboard.keyboard_keys", function(b) {
        a.keys = convert_to_array(b), console.log(a.keys);
    }), convert_to_array = function(a) {
        var b = a, c = [];
        return angular.forEach(b.keys, function(a, b) {
            var d = {
                keyName: b,
                behavior: a
            };
            c.push(d);
        }), {
            modificators: a.modificators,
            keys: c
        };
    }, a.dragControlListeners = {
        accept: function(a, b) {
            return boolean;
        },
        itemMoved: function(a) {},
        orderChanged: function(a) {},
        clone: !0,
        allowDuplicates: !1
    };
} ]), app.directive("keyboardHeader", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/common/header.tmpl.html",
        restrict: "E",
        replace: !0
    };
}), app.directive("keyboardTitleSelector", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/common/selector.tmpl.html",
        restrict: "E",
        replace: !0
    };
}), app.directive("aKeyboard", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/keyboard/aKeyboard.tmpl.html",
        restrict: "E",
        replace: !0
    };
}), app.directive("aKeyboardList", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/list/aList.tmpl.html",
        restrict: "E",
        replace: !0
    };
}), app.directive("aKeyList", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/list/aKey.tmpl.html",
        restrict: "E",
        scope: {
            key: "=",
            behavior: "="
        },
        replace: !0
    };
}), app.directive("aListSection", function() {
    return {
        templateUrl: KEYBOARDPATH + "../templates/list/aSection.tmpl.html",
        restrict: "E",
        scope: {
            section: "="
        },
        replace: !0,
        controller: "aListSectionController"
    };
}), app.directive("aKey", function() {
    function a(a, b, c) {}
    return {
        templateUrl: KEYBOARDPATH + "../templates/keyboard/aKey.tmpl.html",
        restrict: "E",
        controller: "aSingleKey",
        scope: {
            keyClass: "@",
            "char": "@",
            majChar: "@",
            altGrChar: "@"
        },
        transclude: !0,
        link: a,
        replace: !0
    };
});