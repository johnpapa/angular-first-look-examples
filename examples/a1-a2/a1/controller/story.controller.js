(function () {
  angular
    .module('app', [])
    .controller('StoryController', StoryController);

  function StoryController() {
    var vm = this;
    vm.story = { id: 100, name: 'The Force Awakens' };
  }
})();





