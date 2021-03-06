var scripts= document.getElementsByTagName('script');
var path= scripts[scripts.length-1].src.split('?')[0];
var KEYBOARDPATH = path.split('/').slice(0, -1).join('/')+'/';
var APIPATH = KEYBOARDPATH+"../../../.."
String.prototype.isEmpty = function() {
  return (this.length === 0 || !this.trim());
};

app.requires.push('as.sortable');
app.requires.push('ngMaterial');



app.service('SCFRKeyboardAPI', ['$http', function($http) {

  this.editKeyboard = function( _keyboard ) {

    var _version = _keyboard.version_id;
    var _name =  _keyboard.name;

    var url = APIPATH+"/wp-json/Keyboard/Edit/";
    var p   = $http.post(url, {keyboard: _keyboard}).then( function(data) {
      return data.data;
    });
    return p;
  }

  this.deleteKeyboard = function( _keyboard ) {
    var url = APIPATH+"/wp-json/Keyboard/Delete/";
    var p   = $http.post(url, {keyboard: _keyboard}).then( function(data) {
      return data.data;
    });
    return p;
  }

  return this;
}]);

app.controller('Keyboard.main', ["$scope", "SCFRKeyboardAPI","$document", function ($scope, API, $document) {

  $scope.selector = CURRENT_PAGE.model;
  $scope.isEditMod = false;
  $scope.pressedLetter = false;


  selectKeyboard = function (keyboard) {
    delete $scope.currentKeyboard;
    $scope.currentKeyboard = angular.copy(keyboard);
    $scope.currentKeyboard.keyboard_keys.modificators = $scope.currentKeyboard.keyboard_keys.modificators || {};
    $scope.currentKeyboard.keyboard_keys.keys = $scope.currentKeyboard.keyboard_keys.keys || {};

    angular.forEach($scope.currentKeyboard.keyboard_keys.keys, function(val, key) {
      angular.forEach(val, function(value, id) {
        if(value == "") delete val[id];
      });
      if(val.length == 0) 
        $scope.currentKeyboard.keyboard_keys.keys[key] = {};
    });

    $scope.currentVersion = keyboard.version_id;
    $scope.currentName = keyboard.name;
    $scope.newVersion = $scope.currentVersion;
    $scope.newName = $scope.currentName;

    $scope.currentKeyboard.keyCount = Object.keys($scope.currentKeyboard.keyboard_keys.keys).length;
    $scope.currentKeyboard.modificatorCount = Object.keys($scope.currentKeyboard.keyboard_keys.modificators).length;

    $scope.currentKeyboard.date_last_modified = Date.parse($scope.currentKeyboard.date_last_modified);
    $scope.currentKeyboard.date_created = Date.parse($scope.currentKeyboard.date_created);


    $scope.colorized = [];
    $scope.$broadcast("newKeyboard");
  }



  // ###############
  // CHILDREN HELPERS
  // ###############
  $scope.addModifier = function(id, name) {
    if(!name) name = "";
    $scope.currentKeyboard.keyboard_keys.modificators[id] = name;
  }

  $scope.remModifier = function(id) {
    delete $scope.currentKeyboard.keyboard_keys.modificators[id];
  }

  $scope.getModifiers = function() {
    return angular.copy($scope.currentKeyboard.keyboard_keys.modificators);
  }

  $scope.updateKey = function(id, values) {
    $scope.currentKeyboard.keyboard_keys.keys[id] = values;
  }

  $scope.getKey = function(id) {
    if($scope.currentKeyboard && $scope.currentKeyboard.keyboard_keys && $scope.currentKeyboard.keyboard_keys.keys) {
      return $scope.currentKeyboard.keyboard_keys.keys[id];

      keys = {0:null};
      angular.forEach($scope.currentKeyboard.keyboard_keys.keys[id], function(val, id) {
        if(!val.isEmpty())
        keys[id] = val;
      });
      return keys;
    }
    else return null
  }

  $scope.getKeyModifier = function(id) {
    if($scope.currentKeyboard && $scope.currentKeyboard.keyboard_keys && $scope.currentKeyboard.keyboard_keys.modificators) {
      var isModifier = ($scope.currentKeyboard.keyboard_keys.modificators[id]) ? true : false;
      var modifierName = (isModifier) ? angular.copy($scope.currentKeyboard.keyboard_keys.modificators[id]) : "";
    }
    return {is: isModifier, name: modifierName};
  }

  // ###############
  // EDITS BUTTONS
  // ###############
  $scope.editMod = function(v) {
    $scope.isEditMod = v;
    $scope.$broadcast("editModToggle", v);

    // If cancelling a new keyboard
    if(v === false && $scope.currentKeyboard.id === 0)
    $scope.currentKeyboard = angular.copy($scope.prevKeyboard);
  }

  $scope.copyKeyboard = function() {
    $scope.prevKeyboard = angular.copy($scope.currentKeyboard);
    $scope.currentKeyboard.id = 0;
    $scope.newName = "";
    $scope.currentKeyboard.date_created = $scope.currentKeyboard.date_last_modified = null;
  }

  $scope.deleteKeyboard = function() {
    if(!$scope.busy) {
      $scope.busy = true;
      if(confirm("Êtes vous sur de vouloir supprimer ce clavier ?")) {
        if($scope.currentKeyboard.id === 0) {
          $scope.editMod(false);
        }
        else if($scope.currentKeyboard.id > 0) {
          API.deleteKeyboard($scope.currentKeyboard).then(function(data) {
            $scope.busy = false;
            $scope.editMod(false);
            delete $scope.selector.keyboards[$scope.currentKeyboard.version_id][$scope.currentKeyboard.name];
            selectFirstKeyboard();
          });
        }
      }
    }
  }

  $scope.escapize = function(char) {
    var low = char.toLowerCase().replace(/\s/g, '');
    if( ['altgr', 'alt', 'f3', 'default'].indexOf(low) != -1)
    return "colorize_"+low;
    else {
      if($scope.colorized.indexOf(low) == -1) {
        $scope.colorized.push(low);
      }
      return "colorize_"+$scope.colorized.indexOf(low);
    }
  }

  $scope.submitNewKeyboard = function() {
    if(!$scope.busy) {
      $scope.busy = true;
      $scope.needVersion = $scope.needName = false;
      if(!$scope.newVersion)
      $scope.needVersion = true;
      if(!$scope.newName)
      $scope.needName = true;

      if(!$scope.needVersion && !$scope.needName) {
        $scope.oldVersion = $scope.currentKeyboard.version_id;
        $scope.oldName = $scope.currentKeyboard.name;
        $scope.currentKeyboard.name = $scope.newName;
        $scope.currentKeyboard.version_id = $scope.newVersion;

        API.editKeyboard($scope.currentKeyboard).then(function(data) {

          if($scope.currentKeyboard.id > 0)
          delete $scope.selector.keyboards[$scope.oldVersion][$scope.oldName];

          if(!$scope.selector.keyboards[$scope.newVersion])
          $scope.selector.keyboards[$scope.newVersion] = {};

          $scope.selector.keyboards[$scope.newVersion][$scope.newName] = $scope.currentKeyboard;
          selectKeyboard($scope.selector.keyboards[$scope.newVersion][$scope.newName]);

          $scope.editMod(false);
          $scope.busy = false;
        });
      }
    }
  }

  $scope.$on("textChanged", function(event, id, val) {
    if(val && id)
    $scope.updateKey(id,val);
  });

  $scope.$on("modifierChanged", function(event, id, val) {
    $scope.addModifier(id,val);
  });

  $scope.$watch("currentName", function(n) {
    if($scope.currentVersion && $scope.currentName) {
      if($scope.currentKeyboard != $scope.selector.keyboards[$scope.currentVersion][$scope.currentName]) {
        selectKeyboard($scope.selector.keyboards[$scope.currentVersion][$scope.currentName]);
      }
    }
  });

  selectFirstKeyboard = function() {
    selectKeyboard($scope.selector.keyboards[Object.keys($scope.selector.keyboards)[0]][Object.keys($scope.selector.keyboards[Object.keys($scope.selector.keyboards)[0]])[0]]);
  }

  var prevE = null;
  var ctrlCount = 0;

  $document.keydown(function(e) {
    if(!$scope.isEditMod) {

      if(e.keyCode == prevE && !(prevE == 17 && ctrlCount < 2) ) {
        return;
      }
      else
      {
        prevE = e.keyCode;
        var c = null;
        if (e.keyCode == 16) {
          if (e.originalEvent.location == 1)
          c = "Maj";
          else
          c = "Maj d";
        } else if (e.keyCode == 17) {
          if(ctrlCount == 1) {
            if (e.originalEvent.location == 1)
            c = "Ctrl";
            else
            c = "Ctrl d"
          }
          ctrlCount++;
        } else if (e.keyCode == 18) {
          ctrlCount = 0;
          if (e.originalEvent.location == 1)
          c = "Alt";
          else
          c = "Alt GR";
          e.preventDefault(); //because ALT focusout the element
        }
        else if(e.keyCode == 20) {
          c = "Caps";
          e.preventDefault();
        }
        else if(e.keyCode == 32) {
          c = "Espace";
          e.preventDefault();
        }
        else if(e.keyCode == 9) {
          c = "Tab";
          e.preventDefault();
        }
        else if(e.keyCode == 8) {
          c = "Retour";
          e.preventDefault();
        }
        else if(e.keyCode == 13) {
          c = "Entrée";
          e.preventDefault();
        }
        else if(e.keyCode == 27) {
          c = "Echap";
          e.preventDefault();
        }
        else if(e.keyCode == 112) {
          c = "F1";
          e.preventDefault();
        }
        else if(e.keyCode == 113) {
          c = "F2";
          e.preventDefault();
        }
        else if(e.keyCode == 114) {
          c = "F3";
          e.preventDefault();
        }
        else if(e.keyCode == 115) {
          c = "F4";
          e.preventDefault();
        }
        else if(e.keyCode == 116) {
          c = "F5";
          e.preventDefault();
        }
        else if(e.keyCode == 117) {
          c = "F6";
          e.preventDefault();
        }
        else if(e.keyCode == 118) {
          c = "F7";
          e.preventDefault();
        }
        else if(e.keyCode == 119) {
          c = "F8";
          e.preventDefault();
        }
        else if(e.keyCode == 120) {
          c = "F9";
          e.preventDefault();
        }
        else if(e.keyCode == 121) {
          c = "F10";
          e.preventDefault();
        }
        else if(e.keyCode == 122) {
          c = "F11";
          e.preventDefault();
        }
        else if(e.keyCode == 123) {
          c = "F12";
          e.preventDefault();
        }
        else if(e.keyCode == 45) {
          c = "Ins";
          e.preventDefault();
        }
        else if(e.keyCode == 46) {
          c = "Suprr";
          e.preventDefault();
        }
        else if(e.keyCode == 35) {
          c = "Fin";
          e.preventDefault();
        }
        else if(e.keyCode == 36) {
          c = "Home";
          e.preventDefault();
        }
        else if(e.keyCode == 33) {
          c = "Page Up";
          e.preventDefault();
        }
        else if(e.keyCode == 34) {
          c = "Page Down";
          e.preventDefault();
        }
        else if(e.keyCode == 38) {
          c = "Haut";
          e.preventDefault();
        }
        else if(e.keyCode == 37) {
          c = "Gauche";
          e.preventDefault();
        }
        else if(e.keyCode == 40) {
          c = "Bas";
          e.preventDefault();
        }
        else if(e.keyCode == 39) {
          c = "Droite";
          e.preventDefault();
        }
        if(c) {
          switchPressedLetters(c);
        }
      }
    }
  });
  $document.keypress(function(e) {
    if(!$scope.isEditMod) {
      var c = String.fromCharCode(e.which);
      switchPressedLetters(c);
    }
  });
  $document.keyup(function(e) {
    if(!$scope.isEditMod) {
      resetPressedLetter();
    }
  });

  resetPressedLetter = function() {
    $scope.pressedLetter = false;
    prevE = null;
    ctrlCount = 0;
    $scope.$broadcast("keyPressed", false);
  }

  switchPressedLetters = function(key) {
    if ($scope.pressedLetter === false && key != $scope.pressedLetter) {
      $scope.pressedLetter = key;
      $scope.$broadcast("keyPressed", key);
    }
  }

  $scope.addNewSection = function() {
    if($scope.currentKeyboard.keyboard_keys.sections)
      $scope.currentKeyboard.keyboard_keys.sections.push({title: "Entrez le titre de la section", description:"Entrez la description de la section"});
    else {
      $scope.currentKeyboard.keyboard_keys.sections = [{title: "Entrez le titre de la section", description:"Entrez la description de la section"}];
    }
  }

  var keysdone=0;
  $scope.$on("doneUpadtingKey", function doneFocusing() {
    keysdone++;
    if(keysdone == 111) {
      $scope.$digest();
      keysdone=0
    }
  });
  selectFirstKeyboard();

}]);

app.controller('aSingleKey', ["$scope","$element","$timeout", function ($scope,elem,$timeout) {
  $scope.clicked = false;
  $scope.keyText = {0:null};
  $scope.editMod = false;
  $scope.isUsed = false;
  var keyWidth = keyHeight = 77;
  var zoomFactor = 5;

  if(!$scope.charTable) {
    $scope.charTable = {
      maj:    $scope.majChar,
      normal: $scope.char,
      altGr:  $scope.altGrChar,
    };
  }

  $scope.$on("editModToggle",function(event, editMod) {
    $scope.editMod = editMod;
  });

  init = function() {
    delete $scope.keyText;
    $scope.modifierName = "";
    $scope.isModifier = false;

    var modif = $scope.$parent.getKeyModifier($scope.char);
    $scope.isModifier = modif.is;
    $scope.modifierName = angular.copy(modif.name);
    
    var original = $scope.$parent.getKey($scope.char);
    if(!original || original.length == 0) original = {default:null};

    $scope.keyText = angular.copy(original);
  }

  init();
  $scope.escapize = $scope.$parent.escapize;

  $scope.toggleClick = function() {
    $scope.clicked = !$scope.clicked;
  }

  $scope.$watch("isModifier",function(val) {
    if(val) {
      $scope.$parent.addModifier($scope.char, $scope.modifierName);
    }
    else {
      $scope.$parent.remModifier($scope.char);
    }
  });

  $scope.$watchCollection("keyText",function(val) {
    if(val) {
      var d = {};
      angular.forEach(val, function(v,key) {
        if(v !== null) d[key] = v;
      });
      if(Object.keys(d).length > 0) {
        $scope.$emit("textChanged", $scope.char, d);
        $scope.isUsed = true;
      }
      else $scope.isUsed = false;
    }
  },true);

  $scope.$watch("modifierName", function(val) {
    if($scope.isModifier && val)
    $scope.$emit("modifierChanged", $scope.char, val);
  });

  $scope.$watch("clicked", function(val) {

    removeAllKeysStyle();

    var pos = $(elem).position();
    if(val) {
      $timeout(function(){

        $(elem).css("top",pos.top - ( (zoomFactor/2) * keyHeight) ).css("left", pos.left - ( (zoomFactor/2) * keyWidth) );
        $(elem).next(":not(.lastitem, .break)").css("margin-left",6+keyWidth+"px");

        if($(elem).is(".break")) $(elem).next().css("clear","left");
        var dim = $(elem)[0].getBoundingClientRect();
        if(dim.left < 0) {
          var margin = -dim.left + 15;
          $(elem).css("margin-left",margin+"px");
          $(elem).css("margin-right","-"+(margin - 5)+"px");
        }
        else if(dim.right+dim.width > $(window).width()) {
          var margin = ($(window).width() - (dim.right + dim.width)) - 15;
          //$(elem).css("margin-right",margin+"px");
          //$(elem).css("margin-left",(-(margin - 5))+"px");
        }
      },0);
    }

  });

  removeAllKeysStyle = function() {
    $("#keyboardContainer ul li").removeAttr("style").removeClass("clicked");
  }

  $scope.$on("newKeyboard",function() {

    delete $scope.keyText;
    $scope.modifierName = "";
    $scope.isModifier = false;

    var modif = $scope.$parent.getKeyModifier($scope.char);
    $scope.isModifier = modif.is;
    $scope.modifierName = angular.copy(modif.name);
    $scope.keyText = angular.copy($scope.$parent.getKey($scope.char)) || {0:null};

  });

  $scope.$on("keyPressed", function KeyPressed(e, key) {
    var focused = false;
    if(key == false) {
      focused = false;
    }
    else {
      if(key == $scope.char) {
        focused = true;
      }
      else {
        if($scope.keyText[key] != null)
        focused = true;
      }
    }

    $scope.clicked = false;
    $scope.focused = focused;

    $scope.$emit("doneUpadtingKey");
  });

}]);

app.controller('aListSectionController', ["$scope","$element","$timeout", function ($scope,elem,$timeout) {
  $scope.section = $scope.section || {
    title:"Divers",
    description:"Toutes les autres touches du claviers non catégorisées."
  };

  $scope.$parent.$watch('currentKeyboard.keyboard_keys',function(val) {
    $scope.keys = convert_to_array(val);


    console.log($scope.keys);


  });

  convert_to_array = function(keys) {
    var r = keys;
    var trusted = [];
    angular.forEach(r.keys, function(content,key) {
      var newKey = {keyName: key, behavior: content};
      trusted.push(newKey);
    });
    return {modificators: keys.modificators, keys: trusted};
  }

  $scope.dragControlListeners = {
    accept: function (sourceItemHandleScope, destSortableScope) {return boolean},
    itemMoved: function (event) {},
    orderChanged: function(event) {},
    clone: true, //optional param for clone feature.
    allowDuplicates: false, //optional param allows duplicates to be dropped.
  };

}]);


app.directive('keyboardHeader', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/common/header.tmpl.html",
    restrict:'E',
    replace: true
  };
});

app.directive('keyboardTitleSelector', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/common/selector.tmpl.html",
    restrict:'E',
    replace: true
  };
});

app.directive('aKeyboard', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/keyboard/aKeyboard.tmpl.html",
    restrict:'E',
    replace: true
  };
});

app.directive('aKeyboardList', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/list/aList.tmpl.html",
    restrict:'E',
    replace: true
  };
});

app.directive('aKeyList', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/list/aKey.tmpl.html",
    restrict:'E',
    scope: {
      key:'=',
      behavior:'=',
    },
    replace: true
  };
});

app.directive('aListSection', function() {
  return {
    templateUrl: KEYBOARDPATH+"../templates/list/aSection.tmpl.html",
    restrict:'E',
    scope: {
      section:'=',
    },
    replace: true,
    controller:'aListSectionController',
  };
});

app.directive('aKey', function() {

  function link(scope, element, attrs) {

  }

  return {
    templateUrl: KEYBOARDPATH+"../templates/keyboard/aKey.tmpl.html",
    restrict:'E',
    controller: 'aSingleKey',
    scope: {
      keyClass:"@",
      char:"@",
      majChar:"@",
      altGrChar:"@",
    },
    transclude: true,
    link: link,
    replace: true
  };
});
