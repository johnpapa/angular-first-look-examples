(function () {
  angular
    .module('app', [])
    .controller('StoryController', StoryController);

  function StoryController() {
    var vm = this;
    vm.title = 'Angular 1 Property Binding';
    vm.story = 'The Empire Strikes Back';
    vm.imagePath = 'angular.png';
    vm.link = "http://angular.io"
  }
})();

