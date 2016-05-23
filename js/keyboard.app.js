var scripts= document.getElementsByTagName('script');
var path= scripts[scripts.length-1].src.split('?')[0];
var KEYBOARDPATH = path.split('/').slice(0, -1).join('/')+'/';
var APIPATH = KEYBOARDPATH+"../../../.."

app.service('SCFRKeyboardAPI', ['$http', function($http) {

  this.newKeyboard = function( _version, _name ) {
    var url = APIPATH+"/wp-json/Keyboard/Add/"
    var p   = $http.post(url, {version: _version, name: _name}).then( function(data) {
        return data.data;
    });
    return p;
  }

  return this;
}]);

app.controller('Keyboard.main', ["$scope", "SCFRKeyboardAPI", function ($scope, API) {

  $scope.selector = CURRENT_PAGE.model;

  selectKeyboard = function (keyboard) {
    $scope.currentKeyboard = keyboard;
    $scope.currentKeyboard.keyboard_keys.modificators = $scope.currentKeyboard.keyboard_keys.modificators || {};
    $scope.currentKeyboard.keyboard_keys.keys = $scope.currentKeyboard.keyboard_keys.keys || {};
    $scope.currentVersion = keyboard.version_id;
    $scope.currentName = keyboard.name;
    $scope.newVersion = $scope.currentVersion;
    $scope.newName = $scope.currentName;
  }

  $scope.addModifier = function(id, name) {
    if(!name) name = "";
    $scope.currentKeyboard.keyboard_keys.modificators[id] = "["+id+"]"+name;
  }

  $scope.remModifier = function(id) {
    if($scope.currentKeyboard.keyboard_keys.modificators && $scope.currentKeyboard.keyboard_keys.modificators[id])
      delete $scope.currentKeyboard.keyboard_keys.modificators[id];
  }

  $scope.getModifiers = function() {
    return $scope.currentKeyboard.keyboard_keys.modificators;
  }

  $scope.updateKey = function(id, values) {
    $scope.currentKeyboard.keyboard_keys.keys[id] = values;
  }

  $scope.submitNewKeyboard = function() {
    $scope.needVersion = $scope.needName = false;
    if(!$scope.newVersion)
      $scope.needVersion = true;
    if(!$scope.newName)
      $scope.needName = true;

    if(!$scope.needVersion && !$scope.needName)
      API.newKeyboard($scope.newVersion, $scope.newName).then(function(data) {
        console.log(data);
      });
  }

  $scope.$watch("currentName", function(n) {
    if($scope.currentVersion && $scope.currentName) {
      if($scope.currentKeyboard != $scope.selector.keyboards[$scope.currentVersion][$scope.currentName]) {
        selectKeyboard($scope.selector.keyboards[$scope.currentVersion][$scope.currentName]);
      }
        console.log($scope.currentKeyboard);
    }
  });
  selectKeyboard($scope.selector.keyboards[Object.keys($scope.selector.keyboards)[0]][Object.keys($scope.selector.keyboards[Object.keys($scope.selector.keyboards)[0]])[0]]);

  console.log($scope);

}]);

app.controller('aSingleKey', ["$scope","$element","$timeout", function ($scope,elem,$timeout) {
  $scope.clicked = false;

  var keyWidth = keyHeight = 77;
  var zoomFactor = 5;

  if(!$scope.charTable) {
    $scope.charTable = {
      maj:    $scope.majChar,
      normal: $scope.char,
      altGr:  $scope.altGrChar,
    };
  }

  $scope.toggleClick = function() {
    $scope.clicked = !$scope.clicked;
  }

  $scope.$watch("isModifier",function(val) {
    if(val) {
      $scope.$parent.addModifier($scope.char, $scope.modifierName);
    }
    else
      $scope.$parent.remModifier($scope.char);
  });

  $scope.$watch("clicked", function(val) {

    removeAllKeysStyle();

    var pos = $(elem).position();
    if(val) {
      $timeout(function(){

        $(elem).css("top",pos.top - ( (zoomFactor/2) * keyHeight) ).css("left", pos.left - ( (zoomFactor/2) * keyWidth) );
        $(elem).next().css("margin-left",5+keyWidth+"px");
        var dim = $(elem)[0].getBoundingClientRect();
        if(dim.left < 0) {
          var margin = -dim.left + 15;
           $(elem).css("margin-left",margin+"px");
           $(elem).css("margin-right","-"+(margin - 5)+"px");
        }
        else if(dim.right < 0) {
          var margin = -dim.right + 15;
           $(elem).css("margin-right",margin+"px");
           $(elem).css("margin-left","-"+(margin - 5)+"px");
        }
      },0);
    }

  });

  removeAllKeysStyle = function() {
    $("#keyboardContainer ul li").removeAttr("style").removeClass("clicked");
  }

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
