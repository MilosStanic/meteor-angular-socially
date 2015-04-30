angular.module("socially").controller("PartyDetailsCtrl", ['$scope', '$stateParams', '$meteor',
  function($scope, $stateParams, $meteor){

    var vm = this;

    vm.party = $meteor.object(Parties, $stateParams.partyId);

    var subscriptionHandle;
    $meteor.subscribe('parties').then(function(handle) {
      subscriptionHandle = handle;
    });

    vm.users = $meteor.collection(Meteor.users, false).subscribe('users');

    vm.invite = function(user){
      $meteor.call('invite', vm.party._id, user._id).then(
        function(data){
          console.log('success inviting', data);
        },
        function(err){
          console.log('failed', err);
        }
      );
    };

    $scope.$on('$destroy', function() {
      subscriptionHandle.stop();
    });
    
    vm.canInvite = function (){
        if (!vm.party)
          return false;
  
        return !vm.party.public &&
          vm.party.owner === Meteor.userId();
    };

    vm.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 8,
      events: {
        click: function (mapModel, eventName, originalEventArgs) {
          if (!vm.party)
            return;

          if (!vm.party.location)
            vm.party.location = {};

          vm.party.location.latitude = originalEventArgs[0].latLng.lat();
          vm.party.location.longitude = originalEventArgs[0].latLng.lng();
          //scope apply required because this event handler is outside of the angular domain
          $scope.$apply();
        }
      },
      marker: {
        options: { draggable: true },
        events: {
          dragend: function (marker, eventName, args) {
            if (!vm.party.location)
              vm.party.location = {};

            vm.party.location.latitude = marker.getPosition().lat();
            vm.party.location.longitude = marker.getPosition().lng();
          }
        }
      }
    };

  }]);