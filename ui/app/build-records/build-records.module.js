/*
 * JBoss, Home of Professional Open Source.
 * Copyright 2014 Red Hat, Inc., and individual contributors
 * as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  var module = angular.module('pnc.build-records', [
    'ui.router',
    'angular-websocket',
    'pnc.common.events',
    'pnc.common.directives',
    'pnc.common.restclient',
  ]);

  module.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

      // NCL-2402 changed the module base URL, this redirect should
      // be removed at some point in the future.
      $urlRouterProvider.when(/^\/record\/?.*/, function ($location) {
        return $location.url().replace('/record', '/build-records');
      });

      $stateProvider.state('build-records', {
        abstract: true,
        url: '/build-records',
        views: {
          'content@': {
            templateUrl: 'common/templates/single-col.tmpl.html'
          }
        },
        data: {
          proxy: 'build-records.list',
        }
      });

      $stateProvider.state('build-records.detail', {
        abstract: true,
        url: '/{recordId:int}',
        resolve: {
          recordDetail: function (BuildRecord, $stateParams) {
            return BuildRecord.get({ id: $stateParams.recordId }).$promise;
          }
        }
      });

      $stateProvider.state('build-records.detail.default', {
        url: '',
        onEnter: [
          '$state',
          '$timeout',
          'recordDetail',
          function ($state, $timeout, recordDetail) {
            $timeout(function () { // Works around bug in ui.router https://github.com/angular-ui/ui-router/issues/1434
              $state.go('projects.detail.build-configs.detail.build-records.detail.default', {
                projectId: recordDetail.projectId,
                configurationId: recordDetail.buildConfigurationId,
                recordId: recordDetail.id
              });
            });
          }
        ]
      });

      // $stateProvider.state('build-records.detail.result', {
      //   url: '/result',
      //   controller: 'RecordResultController',
      //   controllerAs: 'resultCtrl',
      //   templateUrl: 'build-records/views/build-records.detail.result.html',
      //   data: {
      //     displayName: 'Log'
      //   },
      //   resolve: {
      //     buildLog: function (BuildRecord, recordDetail) {
      //       return BuildRecord.getLog({ id: recordDetail.id }).$promise;
      //     },
      //     sshCredentials: function (BuildRecord, recordDetail) {
      //       return BuildRecord.getSshCredentials({
      //         recordId: recordDetail.id
      //       }).$promise;
      //     }
      //   }
      // });
      //
      // $stateProvider.state('build-records.detail.artifacts', {
      //   url: '/artifacts',
      //   controller: 'RecordArtifactsController',
      //   controllerAs: 'artifactsCtrl',
      //   templateUrl: 'build-records/views/build-records.detail.artifacts.html',
      //   data: {
      //     displayName: 'Built Artifacts',
      //   },
      //   resolve: {
      //     artifacts: function (recordDetail) {
      //       return recordDetail.$getBuiltArtifacts();
      //     }
      //   }
      // });
      //
      // $stateProvider.state('build-records.detail.dependencies', {
      //     url: '/dependencies',
      //     controller: 'RecordArtifactsController',
      //     controllerAs: 'artifactsCtrl',
      //     templateUrl: 'build-records/views/build-records.detail.artifacts.html',
      //     data: {
      //       displayName: 'Dependencies',
      //     },
      //     resolve: {
      //       artifacts: function (recordDetail) {
      //         return recordDetail.$getDependencies();
      //       }
      //     }
      //   });

      $stateProvider.state('build-records.list', {
        url: '',
        templateUrl: 'build-records/views/build-records.list.html',
        data: {
          displayName: 'Builds'
        },
        controller: 'RecordListController',
        controllerAs: 'ctrl'
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records', {
        abstract: true,
        url: '/build-records',
        views: {
          'content@': {
            templateUrl: 'common/templates/single-col.tmpl.html'
          }
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail', {
        abstract: true,
        url: '/{recordId:int}',
        templateUrl: 'build-records/views/build-records.detail.html',
        data: {
          proxy: 'projects.detail.build-configs.detail.build-records.detail.default'
        },
        controller: 'RecordDetailController',
        controllerAs: 'recordCtrl',
        resolve: {
          recordDetail: function (BuildRecord, $stateParams) {
            return BuildRecord.get({ id: $stateParams.recordId }).$promise;
          },
          buildRecordPushResult: function (BuildRecord, $stateParams) {
            return BuildRecord.getLatestPushStatus($stateParams.recordId);
          }
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.default', {
        url: '',
        templateUrl: 'build-records/views/build-records.detail.default.html',
        data: {
          displayName: 'Job #{{ recordDetail.id }}',
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.result', {
        url: '/result',
        controller: 'RecordResultController',
        controllerAs: 'resultCtrl',
        templateUrl: 'build-records/views/build-records.detail.result.html',
        data: {
          displayName: 'Log'
        },
        resolve: {
          buildLog: function (BuildRecord, recordDetail) {
            return BuildRecord.getLog({ id: recordDetail.id }).$promise;
          },
          sshCredentials: function (BuildRecord, recordDetail) {
            return BuildRecord.getSshCredentials({
              recordId: recordDetail.id
            });
          }
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.artifacts', {
        url: '/artifacts',
        controller: 'RecordArtifactsController',
        controllerAs: 'artifactsCtrl',
        templateUrl: 'build-records/views/build-records.detail.artifacts.html',
        data: {
          displayName: 'Built Artifacts',
        },
        resolve: {
          artifacts: function (recordDetail) {
            return recordDetail.$getBuiltArtifacts();
          }
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.dependencies', {
          url: '/dependencies',
          controller: 'RecordArtifactsController',
          controllerAs: 'artifactsCtrl',
          templateUrl: 'build-records/views/build-records.detail.artifacts.html',
          data: {
            displayName: 'Dependencies',
          },
          resolve: {
            artifacts: function (recordDetail) {
              return recordDetail.$getDependencies();
            }
          }
        });

      /**
       * naming: alignment log (end user), repour result (internal)
       */
      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.repour-result', {
        url: '/alignment-log',
        controller: 'RecordRepourResultController',
        controllerAs: 'repourResultCtrl',
        templateUrl: 'build-records/views/build-records.detail.repour-result.html',
        data: {
          displayName: 'Alignment Log'
        },
        resolve: {
          repourLog: function (BuildRecord, recordDetail) {
            return BuildRecord.getRepourLog({ id: recordDetail.id }).$promise;
          }
        }
      });

      $stateProvider.state('projects.detail.build-configs.detail.build-records.detail.brew-push', {
        url: '/brew-push',
        component: 'pncBuildRecordTabBrewPush',
        bindings: {
          buildRecord: 'recordDetail'
        },
        data: {
          displayName: 'Push Results'
        },
        resolve: {
          buildRecordPushResult: function (BuildRecord, $stateParams) {
            return BuildRecord.getLatestPushStatus($stateParams.recordId);
          }
        }
      });



    }]);

})();
