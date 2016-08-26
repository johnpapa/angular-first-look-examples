System.register([], function(exports_1) {
    "use strict";
    var Character;
    return {
        setters:[],
        execute: function() {
            Character = (function () {
                function Character(id, name, side) {
                    this.id = id;
                    this.name = name;
                    this.side = side;
                }
                return Character;
            }());
            exports_1("Character", Character);
        }
    }
});
//# sourceMappingURL=character.js.map