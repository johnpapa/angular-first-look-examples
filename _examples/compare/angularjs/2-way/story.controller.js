(function () {
  angular
    .module('app', [])
    .controller('StoryController', StoryController);

  function StoryController() {
    var vm = this;
    vm.title = 'Angular 1 Two-Way Binding';
    vm.story = {
      name: 'The Empire Strikes Back'
    };
  }
})();

