var scripts= document.getElementsByTagName('script');
var path= scripts[scripts.length-1].src.split('?')[0];
var KEYBOARDPATH = path.split('/').slice(0, -1).join('/')+'/';
var APIPATH = KEYBOARDPATH+"../../../.."

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
    $scope.currentKeyboard = angular.copy(keyboard);
    $scope.currentKeyboard.keyboard_keys.modificators = $scope.currentKeyboard.keyboard_keys.modificators || {};
    $scope.currentKeyboard.keyboard_keys.keys = $scope.currentKeyboard.keyboard_keys.keys || {};
    $scope.currentVersion = keyboard.version_id;
    $scope.currentName = keyboard.name;
    $scope.newVersion = $scope.currentVersion;
    $scope.newName = $scope.currentName;

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
          c = "Shift";
          else
          c = "ShiftR";
        } else if (e.keyCode == 17) {
          if(ctrlCount == 1) {
            if (e.originalEvent.location == 1)
            c = "Ctrl";
            else
            c = "CtrlR"
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
    $scope.keyText = angular.copy($scope.$parent.getKey($scope.char)) || {0:null};
  }

  init();
  $scope.escapize = function(char) {
    return "colorize_"+char.toLowerCase().replace(/\s/g, '');
  }

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
    $scope.isUsed = false;

    var modif = $scope.$parent.getKeyModifier($scope.char);
    $scope.isModifier = modif.is;
    $scope.modifierName = angular.copy(modif.name);
    $scope.keyText = angular.copy($scope.$parent.getKey($scope.char));
  });

  $scope.$on("keyPressed", function(e, key) {
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

    $timeout(function(){
      $scope.clicked = false;
      $scope.focused = focused;
    },0);

  });

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
