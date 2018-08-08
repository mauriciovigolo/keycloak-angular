/**
 * @license
 * Copyright Mauricio Gemelli Vigolo and contributors.
 *
 * Use of this source code is governed by a MIT-style license that can be
 * found in the LICENSE file at https://github.com/mauriciovigolo/keycloak-angular/LICENSE
 */

module.exports = (function() {
  const serverInitCallback = function() {
    console.log(' _               _         _                      _         ');
    console.log('| |_ ___ _ _ ___| |___ ___| |_    ___ ___ ___ _ _| |___ ___ ');
    console.log("| '_| -_| | |  _| | . | .'| '_|  | .'|   | . | | | | .'|  _|");
    console.log('|_,_|___|_  |___|_|___|__,|_,_|  |__,|_|_|_  |___|_|__,|_|  ');
    console.log('        |___|                            |___|              ');

    console.log('Keycloak Server Example Initialized on Port 3000');
    console.log('---------------');
    console.log('For a complete list of API services, visit: http://localhost:3000/');
  };

  return {
    serverInitCallback
  };
})();
