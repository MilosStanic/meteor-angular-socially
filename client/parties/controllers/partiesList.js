angular.module("socially").controller("PartiesListCtrl", ['$scope', '$meteor', '$rootScope', '$state',
  function($scope, $meteor, $rootScope, $state){

    var vm = this;

    vm.page = 1;
    vm.perPage = 3;
    vm.sort = { name: 1 };
    vm.orderProperty = '1';
    
    vm.users = $meteor.collection(Meteor.users, false).subscribe('users');
    
    vm.parties = $meteor.collection(function() {
      return Parties.find({}, {
        sort : $scope.getReactively('vm.sort')
      });
    });

    $meteor.autorun($scope, function() {
      $meteor.subscribe('parties', {
        limit: parseInt($scope.getReactively('vm.perPage')),
        skip: (parseInt($scope.getReactively('vm.page')) - 1) * parseInt($scope.getReactively('vm.perPage')),
        sort: $scope.getReactively('vm.sort')
      }, $scope.getReactively('vm.search')).then(function() {
        vm.partiesCount = $meteor.object(Counts ,'numberOfParties', false);

        vm.parties.forEach( function (party) {
          party.onClicked = function () {
            $state.go('partyDetails', {partyId: party._id});
          };
        });

        vm.map = {
          center: {
            latitude: 45,
            longitude: -73
          },
          zoom: 8
        };
      });
    });

    vm.remove = function(party){
      vm.parties.splice( vm.parties.indexOf(party), 1 );
    };

    vm.pageChanged = function(newPage) {
      vm.page = newPage;
    };

    $scope.$watch('vm.orderProperty', function(){
      if (vm.orderProperty)
        vm.sort = {name: parseInt(vm.orderProperty)};
    });

    vm.getUserById = function(userId){
      return Meteor.users.findOne(userId);
    };

    vm.creator = function(party){
      if (!party)
        return;
      var owner = vm.getUserById(party.owner);
      if (!owner)
        return "nobody";

      if ($rootScope.currentUser)
        if ($rootScope.currentUser._id)
          if (owner._id === $rootScope.currentUser._id)
            return "me";

      return owner;
    };

    vm.rsvp = function(partyId, rsvp){
      $meteor.call('rsvp', partyId, rsvp).then(
        function(data){
          console.log('success responding', data);
        },
        function(err){
          console.log('failed', err);
        }
      );
    };
}]);