@Library('jenkins-shared-library')_

def componentName = "rasa-ui"
def compomentNamespace = "chatbot"
def clientName = "caa"
def solutionName = "caa-chatbot-chatbot-solution"


def label = "${clientName}-${componentName}-${env.BUILD_NUMBER}"

timestamps {
  podTemplate(label: label, serviceAccount: 'jenkins', slaveConnectTimeout: 120, name: label,
      containers: [
      containerTemplate(name: 'nodejs', image: 'node:8.9.4', ttyEnabled: true, command: 'cat'),
      containerTemplate(name: 'docker', image: 'docker:stable', ttyEnabled: true, command: 'cat')
      ],
      volumes: [
      hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock'),
      persistentVolumeClaim(claimName: 'jenkins', mountPath: '/jenkins-data')
      ]
      ) {

    node(label) {
      def componentVersion = ""
        def branchName = ""
        def componentHash = ""
        def commitMessage = ""
        def repositoryName = "${clientName}/${compomentNamespace}/${componentName}"
        env.DOCKER_REGISTRY_REPOSITORY = "${cacd2GetDockerRegistry()}/${repositoryName}"

        try {
          stage("Checkout") {
            def scmRet = cacd2GitCheckout()
              branchName = scmRet[0]
              componentHash = scmRet[1]
              commitMessage = scmRet[2]
          }

          container('nodejs') {
              componentVersion = cacd2GetComponentVersion("nodejs")

          }
          stage("Tagging") {
            cacd2GitTagComponent(branchName, componentVersion)
          }

          // If explicit commit message "#docker" (Build a HASH tag docker image)
          if (commitMessage.contains("#docker")) {
            container('docker') {
              stage("Build Docker Image") {
                env.DOCKER_REGISTRY_IMAGE_TAG_HASH = "${DOCKER_REGISTRY_REPOSITORY}:${componentHash}"
                  env.DOCKER_BUILD_ARGS = ""
                  sh "docker build --label 'image.source.version=${componentHash}' ${DOCKER_BUILD_ARGS} -t $DOCKER_REGISTRY_IMAGE_TAG_HASH ."
              }

              stage("Push Docker Image") {
                cacd2DockerPushImages(DOCKER_REGISTRY_IMAGE_TAG_HASH)
              }

              stage("Scan Docker Image") {
                cacd2DockerScanImage(env.DOCKER_REGISTRY_IMAGE_TAG_HASH, componentHash)
              }
            }
          }

          // US branch
          if (cacd2IsUserStoryBranch(branchName)) {
            container('docker') {
              stage("Build Docker Image") {
                cacd2DockerLogin(cacd2GetDockerRegistry())
                  env.DOCKER_REGISTRY_IMAGE_TAG_US = "${DOCKER_REGISTRY_REPOSITORY}:${cacd2GetUserStoryBranchName(branchName)}"
                  env.DOCKER_BUILD_ARGS = ""
                  sh "docker build --label 'image.source.version=${componentHash}' ${DOCKER_BUILD_ARGS} -t $DOCKER_REGISTRY_IMAGE_TAG_US ."
              }

              stage("Push Docker Image") {
                cacd2DockerPushImages(DOCKER_REGISTRY_IMAGE_TAG_US)
              }

              stage("Scan Docker Image") {
                cacd2DockerScanImage(env.DOCKER_REGISTRY_IMAGE_TAG_US, componentHash)
              }
            }
          }

          // Tag several Docker images
          if (branchName == "master") {
            container('docker') {
              stage("Build Docker Image") {
                cacd2DockerLogin(cacd2GetDockerRegistry())
                  env.DOCKER_REGISTRY_IMAGE_TAG_VERSION = "${DOCKER_REGISTRY_REPOSITORY}:${componentVersion}"
                  env.DOCKER_REGISTRY_IMAGE_TAG_LATEST = "${DOCKER_REGISTRY_REPOSITORY}:latest"
                  env.DOCKER_REGISTRY_IMAGE_TAG_HASH = "${DOCKER_REGISTRY_REPOSITORY}:${componentHash}"
                  env.DOCKER_REGISTRY_IMAGE_TAG_ALL_PATCHES = "${DOCKER_REGISTRY_REPOSITORY}:${cacd2GetVersionForAllPatches(componentVersion)}"
                  env.DOCKER_REGISTRY_IMAGE_TAG_ALL_MINOR_FIXES = "${DOCKER_REGISTRY_REPOSITORY}:${cacd2GetVersionForAllMinorFixes(componentVersion)}"
                  env.DOCKER_BUILD_ARGS = ""
                  sh "docker build --label 'image.source.version=${componentHash}' ${DOCKER_BUILD_ARGS} -t $DOCKER_REGISTRY_IMAGE_TAG_VERSION -t $DOCKER_REGISTRY_IMAGE_TAG_LATEST -t $DOCKER_REGISTRY_IMAGE_TAG_HASH -t $DOCKER_REGISTRY_IMAGE_TAG_ALL_PATCHES -t $DOCKER_REGISTRY_IMAGE_TAG_ALL_MINOR_FIXES ."
              }

              stage("Push Docker Image") {
                cacd2DockerPushImages(DOCKER_REGISTRY_IMAGE_TAG_VERSION,
                    DOCKER_REGISTRY_IMAGE_TAG_LATEST,
                    DOCKER_REGISTRY_IMAGE_TAG_HASH,
                    DOCKER_REGISTRY_IMAGE_TAG_ALL_PATCHES,
                    DOCKER_REGISTRY_IMAGE_TAG_ALL_MINOR_FIXES)
              }

              stage("Scan Docker Image") {
                cacd2DockerScanImage(env.DOCKER_REGISTRY_IMAGE_TAG_VERSION, componentHash)
              }
            }
          }

          // Trigger solution
          if (branchName == "master") {
            build job: solutionName,
                  parameters: [
                    string(name: 'forcedBranch', value: 'master'),
                  string(name: 'forcedBuildUserId', value: cacd2GetUserEmail())
                  ], wait: false
          }

          if (cacd2IsUserStoryBranch(branchName)) {
            build job: solutionName,
                  parameters: [
                    string(name: 'forcedUserStory', value: cacd2GetUserStoryBranchName(branchName)),
                  string(name: 'forcedBuildUserId', value: cacd2GetUserEmail())
                  ], wait: false
          }

          currentBuild.result = 'SUCCESS'
        } catch (e) {
          currentBuild.result = 'FAILURE'

        } finally {
          stage("Build Notifications") {
            //cacd2NotifySlackForBuildStatus("#dev-pic", currentBuild.result)
            cacd2NotifyEmail()
              cacd2NotifyGitlabStatus("cacd2/${clientName}/${compomentNamespace}/thirdparty/${componentName}", componentHash, env.BUILD_URL, currentBuild.result)
          }
        }

    }
  }
}

