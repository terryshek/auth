/**
 * Created by terryshek on 2/12/14.
 */
var app = angular.module('member', ['ui.bootstrap','angularFileUpload']);
//app.run(function($locationProvider) {
//    if(window.history && window.history.pushState){
//        $locationProvider.html5Mode(true);
//    }
//});
app.service('memberService', function($http){
    var memberService ={
        url: '/users/'
    };
    memberService.list = {};
    memberService.getList = function(){
        $http.get(memberService.url+"userlist").
        success(function(data, status, headers, config) {
                memberService.list = data;
        }).
        error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    memberService.add = function(obj){
        return $http.post(memberService.url +"adduser",obj)
    }
    memberService.update = function(obj, id){
        return $http.put(memberService.url +"update/"+id,obj)
    }
    memberService.upload = function(obj){
        return $http.post("/upload/",obj)
    }
    memberService.delete = function(id){
        return $http.delete(memberService.url +"deleteuser/"+id)
    }
    memberService.login = function(obj){

        return $http.post("/login", obj)
    }
    return memberService
})
app.controller('memberlistCtrl',function($scope, $modal, $log, $http, memberService){

    memberService.getList();
    $scope.$watch(function () {
            return memberService.list;
        },
        function(newVal, oldVal) {
            /*...*/
            //console.log("New Data", newVal);
            $scope.memberlist = newVal;
        }, true);

    $scope.deleteList = function(memberobj){

        var modalInstance = $modal.open({
            templateUrl: 'deleteAlert.html',
            controller: 'deleteCtrl',
            size: 'sm',
            resolve: {
                items: function(){
                    return memberobj._id;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
    $scope.open = function (memberObj) {

        var modalInstance = $modal.open({
            templateUrl: 'register.html',
            controller: 'addMemberCtrl',
            size: 'sm',
            resolve: {
                items: function(){
                    //console.log(typeof memberObj)
                    if (typeof memberObj == "object") {
                        memberObj.register = false;
                        return memberObj;
                    }else{
                        var a = {
                            register: true
                        }

                        return a
                    }
                }
            }
        });

        modalInstance.result.then(function () {
            $log.info('Modal created');
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
})
app.controller('addMemberCtrl', function($scope, $modalInstance, memberService ,items, $timeout, $upload){
    //console.log(items);
    $scope.form = items
    $scope.form .gender =true;
    $scope.close = function(){
        $modalInstance.dismiss('cancel');
    };
    $scope.addMember=function(){
        //console.log($scope.form);
        memberService.add($scope.form).then(function(){
            console.log("Create success")
            memberService.getList();
            $scope.close();
        }, function(){
            console.log("sendError")
        })
    }
    $scope.submitForm= function(){
        console.log($scope.form.register);
        if($scope.form.register){
            console.log("add new user !")
            memberService.add($scope.form).then(function(){
                console.log("Create success")
                memberService.getList();
                $scope.close();
            }, function(){
                console.log("sendError")
            })
        }else{
            console.log("update user !")
            console.log($scope.form)
            memberService.update($scope.form, $scope.form._id).then(function(){
                console.log("Update success")
                memberService.getList();
                $scope.close();
            },function(){
                console.log("sendError")
            })
        }
    }
    $scope.update = function(){
        memberService.update($scope.form, $scope.form._id).then(function(){
            console.log("Update success")
            memberService.getList();
            $scope.close();
        },function(){
            console.log("sendError")
        })
    }

    // =========================================================upload img===============================================================//
    $scope.uploadRightAway = true;
    $scope.changeAngularVersion = function () {
        window.location.hash = $scope.angularVersion;
        window.location.reload(true);
    }
    $scope.hasUploader = function (index) {
        return $scope.upload[index] != null;
    };
    $scope.abort = function (index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };
    $scope.angularVersion = window.location.hash.length > 1 ? window.location.hash.substring(1) : '1.2.0';
    $scope.onFileSelect = function ($files) {
        $scope.selectedFiles = [];
        $scope.progress = [];
        if ($scope.upload && $scope.upload.length > 0) {
            for (var i = 0; i < $scope.upload.length; i++) {
                if ($scope.upload[i] != null) {
                    $scope.upload[i].abort();
                }
            }
        }
        $scope.upload = [];
        $scope.uploadResult = [];
        $scope.selectedFiles = $files;
        $scope.dataUrls = [];
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            if (window.FileReader && $file.type.indexOf('image') > -1) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL($files[i]);
                function setPreview(fileReader, index) {
                    fileReader.onload = function (e) {
                        $timeout(function () {
                            $scope.dataUrls[index] = e.target.result;
                        });
                    }
                }

                setPreview(fileReader, i);
            }
            $scope.progress[i] = -1;
            if ($scope.uploadRightAway) {
                $scope.start(i);
            }
        }
    }

    $scope.start = function (index) {
        $scope.progress[index] = 0;
        console.log('starting...');
        console.log($scope.myModel);
        console.log($scope.selectedFiles[index]);
        $scope.upload[index] = $upload.upload({
            url: '/users/upload',
            headers: {'myHeaderKey': 'myHeaderVal'},
            data: {
                title: $scope.title,
                author: $scope.author,
                description: $scope.description
            },
            /*
             formDataAppender: function(fd, key, val) {
             if (angular.isArray(val)) {
             angular.forEach(val, function(v) {
             fd.append(key, v);
             });
             } else {
             fd.append(key, val);
             }
             },
             */
            file: $scope.selectedFiles[index],
            fileFormDataName: 'myFile'
        }).then(function (response) {
            console.log('response', response.data);
            $scope.item=response.data;
            $scope.uploadResult.push(response.data.result);
        }, null, function (evt) {
            $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
        });
    }
    // =========================================================upload img===============================================================//
    $scope.fileUploaded =function(){
        memberService.upload($scope.useImg).then(function(){
            console.log(data)
            console.log("upload")
        })
    }
})
app.controller('deleteCtrl',function($scope, $modalInstance, items, memberService){
    //$scope.deleteId = items;
    $scope.close = function(){
        $modalInstance.dismiss('cancel');
    };
    $scope.confirm = function(){
        console.log("confirm")
        memberService.delete(items).then(function(){
            console.log("delete item @id: "+items)
                $scope.close();
                memberService.getList();
        },
        function(){
            console.log("delete error")
        })

    };
})
app.controller("loginCtrl", function($scope,memberService,$location ){
    console.log("loginCtrl")
    $scope.submitAccount = function(){
        console.log($scope.user)
        memberService.login($scope.user).then(function(data){
                console.log(data);
            //    if(data.data.length >0){
            //        console.log("login success !")
            //        window.location.href = "admin"
            //    }
            //    else
            //        console.log("login fail!")
            //},
            //function(){
            //    console.log("login error")
            })
    }
})
